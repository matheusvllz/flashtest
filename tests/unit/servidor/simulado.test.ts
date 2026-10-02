/**
 * Simulado no servidor (spec 50 §5.9.4, §5.9.2; T-50.10.2–10.6): mini para todos, prova e nível ENEM no Pro, retomada,
 * gabarito só depois de terminar, isolamento por aluno e reporte de questão. Banco PGlite real.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { assinatura, attempt, xpLedger } from "../../../src/server/db/schema";
import { exportarDadosDoAluno } from "../../../src/server/conta/dados";
import { exercicioDoItem } from "../../../src/server/estudo/conteudo";
import {
  concluirSimulado,
  estadoDoSimulado,
  iniciarSimulado,
  opcoesDeSimulado,
  reportarQuestao,
  responderSimulado,
} from "../../../src/server/simulado/simulado";
import { alunoVerificado, ambiente, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00-03:00");
let amb: Ambiente;
beforeEach(async () => {
  amb = await ambiente();
});

async function aluno(email: string, pro = false): Promise<string> {
  const { userId } = await alunoVerificado(amb, email);
  if (pro)
    await amb.db.insert(assinatura).values({
      id: randomUUID(),
      userId,
      provedor: "teste",
      origem: "web",
      idExterno: randomUUID(),
      produto: "pro_mensal",
      plano: "pro",
      estado: "ativa",
      validoAte: new Date("2026-12-01T00:00:00Z"),
    });
  return userId;
}

async function erro(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return "sem erro";
  } catch (e) {
    return (e as { codigo?: string }).codigo ?? String(e);
  }
}

describe("mini-simulado da semana (todos os planos)", () => {
  test("Free vê o mini e não o completo; a prova oficial é recusada", async () => {
    const u = await aluno("sim-free@foca.dev");
    const o = await opcoesDeSimulado(amb.db, u, AGORA);
    expect(o.mini.disponivel).toBe(true);
    expect(o.completo.liberado).toBe(false);
    expect(await erro(iniciarSimulado(amb.db, u, { tipo: "prova", ano: 2023, area: "MT" }, false, AGORA))).toBe("FUNCAO_FECHADA");
  });

  test("retomada, gabarito escondido até terminar, conclusão idempotente com tentativas e XP", async () => {
    const u = await aluno("sim-mini@foca.dev");
    const { id } = await iniciarSimulado(amb.db, u, { tipo: "mini" }, true, AGORA);
    expect((await iniciarSimulado(amb.db, u, { tipo: "mini" }, false, AGORA)).id).toBe(id);
    const ini = await estadoDoSimulado(amb.db, u, id);
    expect(ini.itens.length).toBe(15);
    expect(ini.gabarito).toBeNull();
    expect(ini.cronometro).toBe(true);

    const [a, b] = ini.itens;
    const exA = await exercicioDoItem(a!);
    if (!exA || exA.type !== "multipla-escolha") throw new Error("oficial deveria ser múltipla escolha");
    await responderSimulado(amb.db, u, id, a!, exA.correta, undefined, 60_000, AGORA);
    await responderSimulado(amb.db, u, id, b!, null, true, 90_000, AGORA);
    const meio = await estadoDoSimulado(amb.db, u, id);
    expect(meio.respostas[a!]).toBe(exA.correta);
    expect(meio.marcadas).toEqual([b!]);
    expect(meio.tempoMs).toBe(90_000);
    expect(meio.gabarito).toBeNull();
    expect(await erro(responderSimulado(amb.db, u, id, "oficial:fora", 1, undefined, 0, AGORA))).toBe("ITEM_FORA");
    // Mais 4 respostas ao mesmo tempo (a linha travada não perde nenhuma) para chegar ao mínimo que paga recompensa.
    const resto = ini.itens.slice(2, 6);
    await Promise.all(resto.map((i) => responderSimulado(amb.db, u, id, i, 4, undefined, 95_000, AGORA)));
    expect(Object.keys((await estadoDoSimulado(amb.db, u, id)).respostas).length).toBe(6);

    const r = await concluirSimulado(amb.db, u, id, 120_000, AGORA);
    expect(r.total).toBe(15);
    expect(r.respondidas).toBe(5);
    expect(r.acertos).toBeGreaterThanOrEqual(1);
    expect(await concluirSimulado(amb.db, u, id, 999_999, AGORA)).toEqual(r);
    const fim = await estadoDoSimulado(amb.db, u, id);
    expect(fim.concluido).toBe(true);
    expect(fim.gabarito?.[a!]).toBe(exA.correta);
    expect(await erro(responderSimulado(amb.db, u, id, b!, 1, undefined, 0, AGORA))).toBe("JA_CONCLUIDO");

    const tentativas = await amb.db.select().from(attempt).where(and(eq(attempt.userId, u), eq(attempt.source, "simulado")));
    expect(tentativas.length).toBe(5);
    const xp = await amb.db.select().from(xpLedger).where(eq(xpLedger.userId, u));
    expect(xp.filter((l) => l.key === `simulado:${id}`).map((l) => l.xp)).toEqual([10]);
  });

  test("simulado vazio não paga XP nem marca o dia; o 4º simulado do dia não paga XP", async () => {
    const u = await aluno("sim-vazio@foca.dev", true);
    const vazio = await iniciarSimulado(amb.db, u, { tipo: "nivel", area: "CH" }, false, AGORA);
    const rv = await concluirSimulado(amb.db, u, vazio.id, 0, AGORA);
    expect(rv.respondidas).toBe(0);
    const ids: string[] = [];
    for (let n = 0; n < 4; n++) {
      const { id } = await iniciarSimulado(amb.db, u, { tipo: "nivel", area: "MT" }, false, AGORA);
      const itens = (await estadoDoSimulado(amb.db, u, id)).itens.slice(0, 5);
      for (const i of itens) await responderSimulado(amb.db, u, id, i, 0, undefined, 1000, AGORA);
      await concluirSimulado(amb.db, u, id, 1000, AGORA);
      ids.push(id);
    }
    const xp = (await amb.db.select().from(xpLedger).where(eq(xpLedger.userId, u))).filter((l) => l.key.startsWith("simulado:"));
    expect(xp.map((l) => l.key).sort()).toEqual(ids.slice(0, 3).map((i) => `simulado:${i}`).sort());
  });

  test("isolamento: outro aluno não vê, não responde e não conclui o simulado alheio", async () => {
    const dono = await aluno("sim-dono@foca.dev");
    const outro = await aluno("sim-outro@foca.dev");
    const { id } = await iniciarSimulado(amb.db, dono, { tipo: "mini" }, false, AGORA);
    const item = (await estadoDoSimulado(amb.db, dono, id)).itens[0]!;
    expect(await erro(estadoDoSimulado(amb.db, outro, id))).toBe("NAO_ENCONTRADO");
    expect(await erro(responderSimulado(amb.db, outro, id, item, 0, undefined, 0, AGORA))).toBe("NAO_ENCONTRADO");
    expect(await erro(concluirSimulado(amb.db, outro, id, 0, AGORA))).toBe("NAO_ENCONTRADO");
  });
});

describe("simulado completo (Pro)", () => {
  test("prova oficial na ordem do caderno, com rótulo de prova; nível ENEM nunca se diz prova oficial", async () => {
    const u = await aluno("sim-pro@foca.dev", true);
    const o = await opcoesDeSimulado(amb.db, u, AGORA);
    expect(o.completo.liberado).toBe(true);
    const prova = o.completo.provas[0]!;
    const { id } = await iniciarSimulado(amb.db, u, { tipo: "prova", ano: prova.ano, area: prova.area }, false, AGORA);
    const e = await estadoDoSimulado(amb.db, u, id);
    expect(e.rotulo).toContain(`Prova do ENEM ${prova.ano}`);
    expect(e.itens.length).toBe(prova.questoes);

    const nivel = await iniciarSimulado(amb.db, u, { tipo: "nivel", area: "MT" }, false, AGORA);
    const n = await estadoDoSimulado(amb.db, u, nivel.id);
    expect(n.rotulo).toContain("nível ENEM");
    expect(n.rotulo).not.toContain("Prova do ENEM");
    expect(n.itens.length).toBe(45);

    const dia = await iniciarSimulado(amb.db, u, { tipo: "dia", dia: 2 }, false, AGORA);
    expect((await estadoDoSimulado(amb.db, u, dia.id)).itens.length).toBe(90);
    expect((await opcoesDeSimulado(amb.db, u, AGORA)).historico.length).toBe(3);
  });
});

test("reporte: duas pessoas com o mesmo motivo retiram a questão dos simulados; a mesma pessoa não conta duas vezes", async () => {
  const a = await aluno("rep-a@foca.dev");
  const b = await aluno("rep-b@foca.dev");
  const { id } = await iniciarSimulado(amb.db, a, { tipo: "mini" }, false, AGORA);
  const item = (await estadoDoSimulado(amb.db, a, id)).itens[0]!;
  // Só reporta quem respondeu a questão; questão que não é oficial é recusada.
  expect(await erro(reportarQuestao(amb.db, a, item, "gabarito"))).toBe("QUESTAO_NAO_RESPONDIDA");
  expect(await erro(reportarQuestao(amb.db, a, "q1", "gabarito"))).toBe("ITEM_FORA");
  await responderSimulado(amb.db, a, id, item, 0, undefined, 0, AGORA);
  const doB = await iniciarSimulado(amb.db, b, { tipo: "mini" }, false, AGORA);
  await responderSimulado(amb.db, b, doB.id, item, 1, undefined, 0, AGORA);
  expect((await reportarQuestao(amb.db, a, item, "gabarito")).retirada).toBe(false);
  expect((await reportarQuestao(amb.db, a, item, "gabarito")).retirada).toBe(false);
  expect((await reportarQuestao(amb.db, b, item, "imagem")).retirada).toBe(false);
  expect((await reportarQuestao(amb.db, b, item, "gabarito")).retirada).toBe(true);
  const exportA = await exportarDadosDoAluno(amb.db, a, AGORA);
  expect(exportA.simulados.length).toBe(1);
  expect(exportA.reportesDeQuestao).toEqual([expect.objectContaining({ item, motivo: "gabarito" })]);
  expect((await exportarDadosDoAluno(amb.db, b, AGORA)).simulados.length).toBe(1);
  const forasteiro = await aluno("rep-x@foca.dev");
  expect((await exportarDadosDoAluno(amb.db, forasteiro, AGORA)).simulados).toEqual([]);
  const c = await aluno("rep-c@foca.dev", true);
  const prova = (await opcoesDeSimulado(amb.db, c, AGORA)).completo.provas;
  for (const p of prova.slice(0, 8)) {
    const s = await iniciarSimulado(amb.db, c, { tipo: "prova", ano: p.ano, area: p.area }, false, AGORA);
    expect((await estadoDoSimulado(amb.db, c, s.id)).itens).not.toContain(item);
  }
});
