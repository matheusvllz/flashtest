/**
 * Spec 50 E1 no servidor (§5.1.4, RF-4): a resposta da revisão de erros do fim da lição fica gravada, mas não custa
 * vida, não entra no caderno, não muda a nota da atividade e não paga XP. Cliente antigo (sem `tentativa`) segue igual.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { eventoEstudo, type EventoEstudo } from "../../../src/lib/sync/contrato";
import { assinatura, attempt, cadernoItem } from "../../../src/server/db/schema";
import { exercicioDoItem } from "../../../src/server/estudo/conteudo";
import { aplicarEventos, dataNoFuso } from "../../../src/server/estudo/sincronizar";
import { ambiente, alunoVerificado, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00-03:00");
const HOJE = dataNoFuso(AGORA, "America/Sao_Paulo");
const id = () => randomUUID().replaceAll("-", "");
let amb: Ambiente;
let certa: number;

function resposta(r: number | null, fonte: string, extra: Partial<EventoEstudo> = {}): EventoEstudo {
  return eventoEstudo.parse({
    tipo: "resposta",
    id: id(),
    itemId: "q1",
    resposta: r,
    fonte,
    ocorreuEm: AGORA.toISOString(),
    dataLocal: HOJE,
    ...extra,
  });
}

beforeEach(async () => {
  amb = await ambiente();
  const ex = await exercicioDoItem("q1");
  if (!ex || ex.type !== "multipla-escolha") throw new Error("q1 deveria ser múltipla escolha");
  certa = ex.correta;
});

describe("revisão de erros no servidor (spec 50 §5.1.4)", () => {
  test("erro na revisão não custa vida (Free com vidas)", async () => {
    const { userId } = await alunoVerificado(amb, "e2e-vidas-revisao@foca.dev");
    const errada = (certa + 1) % 4;
    const r = await aplicarEventos(
      amb.db,
      userId,
      [resposta(errada, "licao", { tentativa: "revisao" }), resposta(errada, "licao", { tentativa: "revisao" })],
      AGORA,
    );
    expect(r.aplicados.length).toBe(2);
    expect(r.agregado.vidas?.restantes).toBe(5);
    const r2 = await aplicarEventos(amb.db, userId, [resposta(errada, "licao")], AGORA);
    expect(r2.agregado.vidas?.restantes).toBe(4);
  });

  test("revisão nunca entra na nota da atividade nem no caderno", async () => {
    const { userId } = await alunoVerificado(amb, "revisao-basic@foca.dev");
    await amb.db.insert(assinatura).values({
      id: randomUUID(), userId, provedor: "teste", origem: "web", idExterno: randomUUID(), produto: "basic_mensal", plano: "basic", estado: "ativa",
      inicio: new Date(AGORA.getTime() - 86_400_000), validoAte: new Date(AGORA.getTime() + 20 * 86_400_000),
    });
    const errada = (certa + 1) % 4;
    const ev = resposta(errada, "atividade", { tentativa: "revisao", attemptKey: "ativ-1@2026" });
    await aplicarEventos(amb.db, userId, [ev], AGORA);
    const [linha] = await amb.db.select().from(attempt).where(and(eq(attempt.userId, userId), eq(attempt.id, ev.id)));
    expect(linha.activityAttemptKey).toBeNull();
    const caderno = await amb.db.select().from(cadernoItem).where(eq(cadernoItem.userId, userId));
    expect(caderno.length).toBe(0);
    // A mesma resposta errada como primeira tentativa entra no caderno (Basic).
    await aplicarEventos(amb.db, userId, [resposta(errada, "atividade")], AGORA);
    const depois = await amb.db.select().from(cadernoItem).where(eq(cadernoItem.userId, userId));
    expect(depois.length).toBe(1);
  });

  test("questão geral na revisão não paga XP; cliente antigo sem `tentativa` segue pagando", async () => {
    const { userId } = await alunoVerificado(amb, "revisao-xp@foca.dev");
    const r1 = await aplicarEventos(amb.db, userId, [resposta(certa, "questao-geral", { tentativa: "revisao" })], AGORA);
    expect(r1.agregado.xp).toBe(0);
    const r2 = await aplicarEventos(amb.db, userId, [resposta(certa, "questao-geral")], AGORA);
    expect(r2.agregado.xp).toBeGreaterThan(0);
  });

  test("o contrato aceita os campos novos e recusa valores fora da lista", () => {
    expect(() => resposta(certa, "licao", { tentativa: "revisao", assistida: true })).not.toThrow();
    expect(() =>
      eventoEstudo.parse({ tipo: "resposta", id: id(), itemId: "q1", resposta: 0, fonte: "licao", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE, tentativa: "segunda" }),
    ).toThrow();
  });
});
