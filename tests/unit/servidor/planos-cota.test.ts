/**
 * Plano decidido no servidor e cota da Foca IA por plano (spec 49 T-49.2.3, T-49.2.4; D49-08, D49-10).
 * Banco PGlite real; as assinaturas são gravadas direto (o webhook que as cria vem na F3).
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { aiBudget, aiUsage, assinatura, profile } from "../../../src/server/db/schema";
import { planoDasAssinaturas, planoDoAluno, sincronizarPlanoNoPerfil } from "../../../src/server/planos/plano";
import { cotaDisponivel, diaDaCota, registrarCustoGlobal, reservarMensagem } from "../../../src/server/tutor/cota";
import { ErroApp } from "../../../src/server/http";
import { alunoVerificado, ambiente, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00Z");
const DEPOIS = new Date("2026-11-15T15:00:00Z");
const ANTES = new Date("2026-09-15T15:00:00Z");
const LIMITES = { AI_COTA_GRATIS_MENSAGENS: 3, AI_TETO_DIARIO_USD: 1, AI_TETO_DIARIO_PAGOS_USD: 5 };

let amb: Ambiente;
beforeEach(async () => {
  amb = await ambiente();
});

async function assinar(userId: string, plano: "basic" | "pro", estado = "ativa", validoAte: Date | null = DEPOIS) {
  await amb.db.insert(assinatura).values({
    id: randomUUID(),
    userId,
    provedor: "teste",
    origem: "web",
    idExterno: randomUUID(),
    produto: `${plano}_mensal`,
    plano,
    estado,
    validoAte,
  });
}

async function reservarAte(userId: string, n: number, comFoto = false): Promise<number> {
  let ok = 0;
  for (let i = 0; i < n; i++) {
    try {
      await reservarMensagem(amb.db, userId, comFoto, AGORA, LIMITES);
      ok++;
    } catch (e) {
      if (!(e instanceof ErroApp)) throw e;
      break;
    }
  }
  return ok;
}

describe("plano derivado das assinaturas (puro)", () => {
  const a = (plano: string, estado: string, validoAte: Date | null) => ({ plano, estado, validoAte });
  test("sem assinatura: gratis", () => expect(planoDasAssinaturas([], AGORA)).toBe("gratis"));
  test("ativa, atrasada e cancelada valem até o fim do período", () => {
    expect(planoDasAssinaturas([a("basic", "ativa", DEPOIS)], AGORA)).toBe("basic");
    expect(planoDasAssinaturas([a("pro", "atrasada", DEPOIS)], AGORA)).toBe("pro");
    expect(planoDasAssinaturas([a("pro", "cancelada", DEPOIS)], AGORA)).toBe("pro");
  });
  test("vencida, pendente, reembolsada ou expirada não valem", () => {
    expect(planoDasAssinaturas([a("pro", "ativa", ANTES)], AGORA)).toBe("gratis");
    expect(planoDasAssinaturas([a("pro", "pendente", DEPOIS)], AGORA)).toBe("gratis");
    expect(planoDasAssinaturas([a("pro", "reembolsada", DEPOIS)], AGORA)).toBe("gratis");
    expect(planoDasAssinaturas([a("pro", "expirada", DEPOIS)], AGORA)).toBe("gratis");
    expect(planoDasAssinaturas([a("pro", "ativa", null)], AGORA)).toBe("gratis");
  });
  test("duas válidas: vale a maior", () => {
    expect(planoDasAssinaturas([a("basic", "ativa", DEPOIS), a("pro", "cancelada", DEPOIS)], AGORA)).toBe("pro");
  });
});

describe("plano no servidor", () => {
  test("o plano de um aluno nunca vem do perfil nem de outro aluno", async () => {
    const ana = await alunoVerificado(amb, "plano-ana@foca.dev");
    const bia = await alunoVerificado(amb, "plano-bia@foca.dev");
    await assinar(ana.userId, "pro");
    // Perfil adulterado para "pro" sem assinatura não vale.
    await amb.db.insert(profile).values({ userId: bia.userId, plano: "pro" }).onConflictDoUpdate({ target: profile.userId, set: { plano: "pro" } });
    expect(await planoDoAluno(amb.db, ana.userId, AGORA)).toBe("pro");
    expect(await planoDoAluno(amb.db, bia.userId, AGORA)).toBe("gratis");
    expect(await sincronizarPlanoNoPerfil(amb.db, bia.userId, AGORA)).toBe("gratis");
    const [p] = await amb.db.select({ plano: profile.plano }).from(profile).where(eq(profile.userId, bia.userId));
    expect(p.plano).toBe("gratis");
  });
});

describe("cota da Foca IA por plano", () => {
  test("Free 3, Basic 15, Pro 30 mensagens por dia", async () => {
    const free = await alunoVerificado(amb, "cota-free@foca.dev");
    const basic = await alunoVerificado(amb, "cota-basic@foca.dev");
    const pro = await alunoVerificado(amb, "cota-pro@foca.dev");
    await assinar(basic.userId, "basic");
    await assinar(pro.userId, "pro");
    expect(await reservarAte(free.userId, 10)).toBe(3);
    expect(await reservarAte(basic.userId, 40)).toBe(15);
    expect(await reservarAte(pro.userId, 40)).toBe(30);
    expect(await cotaDisponivel(amb.db, pro.userId, false, AGORA, LIMITES)).toBe(false);
  });

  test("fotos: Basic 3 e Pro 8 por dia; no Free a foto conta como mensagem", async () => {
    const free = await alunoVerificado(amb, "foto-free@foca.dev");
    const basic = await alunoVerificado(amb, "foto-basic@foca.dev");
    const pro = await alunoVerificado(amb, "foto-pro@foca.dev");
    await assinar(basic.userId, "basic");
    await assinar(pro.userId, "pro");
    expect(await reservarAte(free.userId, 10, true)).toBe(3);
    expect(await reservarAte(basic.userId, 10, true)).toBe(3);
    expect(await reservarAte(pro.userId, 20, true)).toBe(8);
  });

  test("uso justo do mês: Basic para em 300 mensagens no mês, mesmo com cota do dia", async () => {
    const basic = await alunoVerificado(amb, "justo-basic@foca.dev");
    await assinar(basic.userId, "basic");
    await amb.db.insert(aiUsage).values({ userId: basic.userId, day: "2026-10-01", messages: 299 });
    expect(await reservarAte(basic.userId, 5)).toBe(1);
    // Mês seguinte zera.
    expect(await cotaDisponivel(amb.db, basic.userId, false, new Date("2026-11-02T15:00:00Z"), LIMITES)).toBe(true);
  });

  test("teto do Free estourado não derruba quem paga (D49-10)", async () => {
    const free = await alunoVerificado(amb, "teto-free@foca.dev");
    const pro = await alunoVerificado(amb, "teto-pro@foca.dev");
    await assinar(pro.userId, "pro");
    await amb.db.insert(aiBudget).values({ day: diaDaCota(AGORA), costMicros: 1_000_000 });
    await expect(reservarMensagem(amb.db, free.userId, false, AGORA, LIMITES)).rejects.toMatchObject({ codigo: "TETO_GLOBAL" });
    expect((await reservarMensagem(amb.db, pro.userId, false, AGORA, LIMITES)).pago).toBe(true);
    // O teto dos pagantes é outro: estourado, aí sim o Pro para.
    await registrarCustoGlobal(amb.db, AGORA, 5_000_000, true);
    await expect(reservarMensagem(amb.db, pro.userId, false, AGORA, LIMITES)).rejects.toMatchObject({ codigo: "TETO_GLOBAL" });
  });
});
