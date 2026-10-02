/**
 * Sincronização de estudo no servidor (docs/specs/46-producao T-06.2, T-06.3, T-06.6; T6/T7).
 * Banco real (PGlite), conteúdo real (banco geral e pacotes), regras de `src/lib/recompensas.ts`.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { XP_BONUS_COMBO_TETO_DIA } from "../../../src/lib/combo";
import { randomUUID } from "node:crypto";
import type { EventoEstudo } from "../../../src/lib/sync/contrato";
import { eventoEstudo } from "../../../src/lib/sync/contrato";
import { exercicioDoItem } from "../../../src/server/estudo/conteudo";
import { ATIVIDADES_PAGAS_POR_DIA, agregadoDoAluno, aplicarEventos, dataNoFuso } from "../../../src/server/estudo/sincronizar";
import { ambiente, alunoVerificado, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-09-30T15:00:00-03:00");
const HOJE = dataNoFuso(AGORA, "America/Sao_Paulo");
const id = () => randomUUID().replaceAll("-", "");

function resposta(itemId: string, r: number | null, extra: Partial<Extract<EventoEstudo, { tipo: "resposta" }>> = {}): EventoEstudo {
  return eventoEstudo.parse({ tipo: "resposta", id: id(), itemId, resposta: r, fonte: "questao-geral", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE, ...extra });
}

let amb: Ambiente;
let certaQ1: number;
beforeEach(async () => {
  amb = await ambiente();
  const ex = await exercicioDoItem("q1");
  if (!ex || ex.type !== "multipla-escolha") throw new Error("q1 deveria ser múltipla escolha");
  certaQ1 = ex.correta;
});

describe("respostas e XP (T7: o servidor decide)", () => {
  test("a correção vem do gabarito, não do cliente; errar paga 5, acertar depois paga até 15, repetir não paga", async () => {
    const { userId } = await alunoVerificado(amb, "a@teste.dev");
    const errada = (certaQ1 + 1) % 4;
    let r = await aplicarEventos(amb.db, userId, [resposta("q1", errada)], AGORA);
    expect(r.agregado.xp).toBe(5);
    r = await aplicarEventos(amb.db, userId, [resposta("q1", certaQ1)], AGORA);
    expect(r.agregado.xp).toBe(15);
    r = await aplicarEventos(amb.db, userId, [resposta("q1", certaQ1), resposta("q1", errada)], AGORA);
    expect(r.agregado.xp).toBe(15);
  });

  test("o mesmo evento reenviado (mesmo id) não conta duas vezes", async () => {
    const { userId } = await alunoVerificado(amb, "b@teste.dev");
    const ev = resposta("q1", certaQ1);
    await aplicarEventos(amb.db, userId, [ev], AGORA);
    const r = await aplicarEventos(amb.db, userId, [ev, ev], AGORA);
    expect(r.aplicados).toEqual([ev.id, ev.id]);
    expect(r.agregado.xp).toBe(15);
  });

  test("item que não existe é recusado", async () => {
    const { userId } = await alunoVerificado(amb, "c@teste.dev");
    const r = await aplicarEventos(amb.db, userId, [resposta("item-inventado", 0)], AGORA);
    expect(r.rejeitados).toEqual([{ id: expect.any(String), motivo: "ITEM_DESCONHECIDO" }]);
    expect(r.agregado.xp).toBe(0);
  });

  test("data longe de hoje (mais de 7 dias atrás, ou depois de amanhã) é recusada", async () => {
    const { userId } = await alunoVerificado(amb, "d@teste.dev");
    const r = await aplicarEventos(
      amb.db,
      userId,
      [resposta("q1", certaQ1, { dataLocal: "2026-09-01" }), resposta("q1", certaQ1, { dataLocal: "2026-10-05" })],
      AGORA,
    );
    expect(r.rejeitados.map((x) => x.motivo)).toEqual(["DATA_FORA_DA_JANELA", "DATA_FORA_DA_JANELA"]);
  });
});

describe("atividades da trilha", () => {
  test("o XP da atividade sai das respostas registradas dela, e a conclusão é idempotente", async () => {
    const { userId } = await alunoVerificado(amb, "e@teste.dev");
    const chave = "pratica-mat@2026-09-30T17:00:00.000Z";
    const respostas = [0, 1, 2, 3].map(() => resposta("q1", certaQ1, { fonte: "atividade", attemptKey: chave }));
    await aplicarEventos(amb.db, userId, respostas, AGORA);
    const fim = eventoEstudo.parse({ tipo: "atividade-concluida", id: id(), attemptKey: chave, atividadeId: "pratica-mat", kind: "pratica", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE });
    let r = await aplicarEventos(amb.db, userId, [fim], AGORA);
    expect(r.agregado.xp).toBe(30); // 4/4 = 3 estrelas
    r = await aplicarEventos(amb.db, userId, [{ ...fim, id: id() }], AGORA);
    expect(r.agregado.xp).toBe(30);
    expect(r.agregado.sequencia).toBe(1);
  });

  test("atividade sem nenhuma resposta registrada não paga nada", async () => {
    const { userId } = await alunoVerificado(amb, "f@teste.dev");
    const fim = eventoEstudo.parse({ tipo: "atividade-concluida", id: id(), attemptKey: "x@1", atividadeId: "x", kind: "pratica", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE });
    const r = await aplicarEventos(amb.db, userId, [fim], AGORA);
    expect(r.rejeitados[0]?.motivo).toBe("ATIVIDADE_SEM_RESPOSTAS");
    expect(r.agregado.xp).toBe(0);
  });

  test(`teto diário: depois de ${ATIVIDADES_PAGAS_POR_DIA} atividades pagas no dia, as seguintes não pagam XP`, async () => {
    const { userId } = await alunoVerificado(amb, "g@teste.dev");
    const eventos: EventoEstudo[] = [];
    for (let i = 0; i < ATIVIDADES_PAGAS_POR_DIA + 2; i++) {
      const chave = `revisao-${i}@t`;
      eventos.push(resposta("q1", certaQ1, { fonte: "atividade", attemptKey: chave }));
      eventos.push(eventoEstudo.parse({ tipo: "atividade-concluida", id: id(), attemptKey: chave, atividadeId: `r${i}`, kind: "revisao", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE }));
    }
    const r = await aplicarEventos(amb.db, userId, eventos, AGORA);
    // Todas certas e seguidas: o combo do dia também dá o bônus fixo (spec 50 §5.1.3), limitado a 20 XP por dia.
    expect(r.agregado.xp).toBe(ATIVIDADES_PAGAS_POR_DIA * 5 + XP_BONUS_COMBO_TETO_DIA);
  });
});

describe("sequência pelos dias estudados", () => {
  test("dias com bloco concluído formam a sequência (com congelamento)", async () => {
    const { userId } = await alunoVerificado(amb, "h@teste.dev");
    const bloco = (dia: string) => eventoEstudo.parse({ tipo: "bloco-concluido", id: id(), bloco: "aula-60s", ocorreuEm: `${dia}T12:00:00-03:00`, dataLocal: dia });
    const r = await aplicarEventos(amb.db, userId, [bloco("2026-09-26"), bloco("2026-09-27"), bloco("2026-09-29"), bloco("2026-09-30")], AGORA);
    expect(r.agregado.sequencia).toBe(4); // perdeu o dia 28, gastou o congelamento inicial
    expect(r.agregado.congelamentos).toBe(0);
    expect(r.agregado.diasComAtividade).toBe(4);
  });
});

describe("isolamento entre alunos (T6)", () => {
  test("o que A faz não aparece no agregado de B", async () => {
    const a = await alunoVerificado(amb, "ana@teste.dev");
    const b = await alunoVerificado(amb, "beto@teste.dev");
    await aplicarEventos(amb.db, a.userId, [resposta("q1", certaQ1)], AGORA);
    expect((await agregadoDoAluno(amb.db, a.userId)).xp).toBe(15);
    expect((await agregadoDoAluno(amb.db, b.userId)).xp).toBe(0);
  });

  test("o mesmo id de evento em dois alunos é independente", async () => {
    const a = await alunoVerificado(amb, "caio@teste.dev");
    const b = await alunoVerificado(amb, "duda@teste.dev");
    const ev = resposta("q1", certaQ1);
    await aplicarEventos(amb.db, a.userId, [ev], AGORA);
    const r = await aplicarEventos(amb.db, b.userId, [ev], AGORA);
    expect(r.agregado.xp).toBe(15);
  });
});

describe("concorrência", () => {
  test("dois envios simultâneos do mesmo aluno não pagam a mesma chave duas vezes", async () => {
    const { userId } = await alunoVerificado(amb, "zeca@teste.dev");
    await Promise.all([
      aplicarEventos(amb.db, userId, [resposta("q1", certaQ1)], AGORA),
      aplicarEventos(amb.db, userId, [resposta("q1", certaQ1)], AGORA),
    ]);
    expect((await agregadoDoAluno(amb.db, userId)).xp).toBe(15);
  });
});

describe("contrato", () => {
  test("o cliente não consegue mandar XP, sequência ou correção: campos extras são descartados", () => {
    const ev = eventoEstudo.parse({ tipo: "resposta", id: id(), itemId: "q1", resposta: 0, fonte: "questao-geral", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE, correct: true, xp: 999 });
    expect(ev).not.toHaveProperty("xp");
    expect(ev).not.toHaveProperty("correct");
  });

  test("id de evento com caractere estranho é recusado", () => {
    expect(() => eventoEstudo.parse({ tipo: "entrada", id: "../../x;drop", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE })).toThrow();
  });
});
