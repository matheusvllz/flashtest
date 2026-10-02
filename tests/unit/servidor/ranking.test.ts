/**
 * Ranking de maiores de 18 (spec 49 D49-06, T-49.8.1; RF-11). Regras puras + servidor com PGlite real.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { elegibilidade, pontosDaSemana, semanaDe, validarApelido } from "../../../src/lib/ranking";
import { studyDay, user } from "../../../src/server/db/schema";
import { denunciarApelido, entrarNoRanking, meuRanking, sairDoRanking } from "../../../src/server/ranking/ranking";
import { alunoVerificado, ambiente, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00Z"); // quinta-feira

describe("regras puras", () => {
  test("maioridade pelo ano; ano limítrofe pede dia e mês", () => {
    expect(elegibilidade(2007, AGORA)).toBe("maior"); // faz 19 em 2026
    expect(elegibilidade(2009, AGORA)).toBe("menor"); // faz 17
    expect(elegibilidade(2008, AGORA)).toBe("confirmar"); // faz 18 em 2026
    expect(elegibilidade(2008, AGORA, { dia: 1, mes: 3 })).toBe("maior");
    expect(elegibilidade(2008, AGORA, { dia: 20, mes: 12 })).toBe("menor");
    expect(elegibilidade(null, AGORA)).toBe("menor");
  });
  test("pontos: dias × 100 + blocos × 10, no máximo 5 blocos por dia (sem premiar maratona)", () => {
    expect(pontosDaSemana([{ blocos: 1 }, { blocos: 0 }, { blocos: 9 }])).toBe(100 + 10 + 100 + 50);
  });
  test("semana começa na segunda", () => {
    expect(semanaDe("2026-10-15")).toBe("2026-10-12");
    expect(semanaDe("2026-10-12")).toBe("2026-10-12");
    expect(semanaDe("2026-10-18")).toBe("2026-10-12");
  });
  test("apelido: tamanho, contato e termo ofensivo recusados", () => {
    expect(validarApelido("  Lia   Estuda ")).toEqual({ ok: true, apelido: "Lia Estuda" });
    expect(validarApelido("ab")).toMatchObject({ ok: false, problema: "tamanho" });
    expect(validarApelido("zap 11987654321")).toMatchObject({ ok: false, problema: "contato" });
    expect(validarApelido("lia@gmail.com")).toMatchObject({ ok: false, problema: "caracteres" });
    expect(validarApelido("Otário")).toMatchObject({ ok: false, problema: "ofensivo" });
  });
});

describe("servidor", () => {
  let amb: Ambiente;
  beforeEach(async () => {
    amb = await ambiente();
  });

  async function aluno(email: string, ano: number) {
    const a = await alunoVerificado(amb, email);
    await amb.db.update(user).set({ birthYear: ano }).where(eq(user.id, a.userId));
    return a.userId;
  }

  test("menor de 18 nunca entra nem vê o ranking", async () => {
    const menor = await aluno("rk-menor@foca.dev", 2009);
    expect(await meuRanking(amb.db, menor, AGORA)).toEqual({ estado: "menor" });
    await expect(entrarNoRanking(amb.db, menor, { apelido: "Menorzinho" }, AGORA)).rejects.toMatchObject({ codigo: "MENOR_DE_IDADE" });
  });

  test("ano limítrofe: sem dia e mês, pede; com aniversário passado, entra", async () => {
    const lim = await aluno("rk-lim@foca.dev", 2008);
    expect(await meuRanking(amb.db, lim, AGORA)).toEqual({ estado: "fora", confirmarNascimento: true });
    await expect(entrarNoRanking(amb.db, lim, { apelido: "Limite" }, AGORA)).rejects.toMatchObject({ codigo: "CONFIRMAR_NASCIMENTO" });
    expect(await entrarNoRanking(amb.db, lim, { apelido: "Limite", nascimento: { dia: 2, mes: 2 } }, AGORA)).toEqual({ ok: true });
    expect((await meuRanking(amb.db, lim, AGORA)).estado).toBe("participando");
  });

  test("adultos no mesmo grupo, pontos da semana; menor que o suporte corrigiu some na hora; sair tira do grupo", async () => {
    const ana = await aluno("rk-ana@foca.dev", 2000);
    const bia = await aluno("rk-bia@foca.dev", 2001);
    await amb.db.insert(studyDay).values([
      { userId: ana, localDate: "2026-10-12", blocks: 2 },
      { userId: ana, localDate: "2026-10-13", blocks: 1 },
      { userId: bia, localDate: "2026-10-14", blocks: 1 },
      { userId: bia, localDate: "2026-10-05", blocks: 3 }, // semana passada: não conta
    ]);
    expect(await entrarNoRanking(amb.db, ana, { apelido: "Ana" }, AGORA)).toEqual({ ok: true });
    expect(await entrarNoRanking(amb.db, bia, { apelido: "ana" }, AGORA)).toEqual({ ok: false, problema: "repetido" });
    expect(await entrarNoRanking(amb.db, bia, { apelido: "Bia" }, AGORA)).toEqual({ ok: true });
    await meuRanking(amb.db, bia, AGORA); // entra no grupo da semana
    const r = await meuRanking(amb.db, ana, AGORA);
    if (r.estado !== "participando") throw new Error("deveria participar");
    expect(r.grupo).toEqual([
      { posicao: 1, apelido: "Ana", pontos: 230, voce: true },
      { posicao: 2, apelido: "Bia", pontos: 110, voce: false },
    ]);

    await amb.db.update(user).set({ birthYear: 2010 }).where(eq(user.id, bia));
    const r2 = await meuRanking(amb.db, ana, AGORA);
    expect(r2.estado === "participando" && r2.grupo.map((l) => l.apelido)).toEqual(["Ana"]);

    await sairDoRanking(amb.db, ana, AGORA);
    expect(await meuRanking(amb.db, ana, AGORA)).toEqual({ estado: "fora", confirmarNascimento: false });
  });

  test("denúncia oculta o apelido do mesmo grupo", async () => {
    const ana = await aluno("rk-d-ana@foca.dev", 2000);
    const bia = await aluno("rk-d-bia@foca.dev", 2000);
    await entrarNoRanking(amb.db, ana, { apelido: "Ana" }, AGORA);
    await entrarNoRanking(amb.db, bia, { apelido: "BiaChata" }, AGORA);
    await meuRanking(amb.db, bia, AGORA);
    await denunciarApelido(amb.db, ana, "BiaChata", AGORA);
    const r = await meuRanking(amb.db, ana, AGORA);
    expect(r.estado === "participando" && r.grupo.map((l) => l.apelido).sort()).toEqual(["Ana", "Apelido em revisão"]);
    // Sair e entrar de novo não limpa a denúncia; ninguém pode se chamar "Apelido em revisão".
    await sairDoRanking(amb.db, bia, AGORA);
    expect(await entrarNoRanking(amb.db, bia, { apelido: "BiaChata" }, AGORA)).toEqual({ ok: true });
    await meuRanking(amb.db, bia, AGORA);
    const r2 = await meuRanking(amb.db, ana, AGORA);
    expect(r2.estado === "participando" && r2.grupo.map((l) => l.apelido).sort()).toEqual(["Ana", "Apelido em revisão"]);
    expect(await entrarNoRanking(amb.db, ana, { apelido: "Apelido em revisão" }, AGORA)).toEqual({ ok: false, problema: "repetido" });
  });

  test("ano limítrofe: quem não confirmou o aniversário neste ano sai do grupo (ano mudado pelo suporte)", async () => {
    const ana = await aluno("rk-l-ana@foca.dev", 2000);
    const bia = await aluno("rk-l-bia@foca.dev", 2000);
    await entrarNoRanking(amb.db, ana, { apelido: "Ana" }, AGORA);
    await entrarNoRanking(amb.db, bia, { apelido: "Bia" }, new Date("2025-03-01T15:00:00Z"));
    await meuRanking(amb.db, bia, AGORA);
    await amb.db.update(user).set({ birthYear: 2008 }).where(eq(user.id, bia)); // faz 18 em 2026, sem confirmar
    const r = await meuRanking(amb.db, ana, AGORA);
    expect(r.estado === "participando" && r.grupo.map((l) => l.apelido)).toEqual(["Ana"]);
    expect(await meuRanking(amb.db, bia, AGORA)).toEqual({ estado: "fora", confirmarNascimento: true });
  });
});

describe("apelido: palavras comuns não são barradas", () => {
  test("computador, pintor e rolamento passam; os termos como palavra inteira não", () => {
    expect(validarApelido("Computador")).toMatchObject({ ok: true });
    expect(validarApelido("Pintor 22")).toMatchObject({ ok: true });
    expect(validarApelido("Rolamento")).toMatchObject({ ok: true });
    expect(validarApelido("lia_puta")).toMatchObject({ ok: false, problema: "ofensivo" });
    expect(validarApelido("rola99")).toMatchObject({ ok: false, problema: "ofensivo" });
  });
});
