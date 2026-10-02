/**
 * "Pular para cá" no servidor (spec 50 §5.7.1, RF-17; T-50.12.1–12.2). Banco PGlite real: onde o teste vale, composição
 * inédita, passar e não passar, limites do dia, XP 20 uma vez, lições puladas sem XP (e com XP normal depois), Pérolas
 * pelo bloco e isolamento entre alunos.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { and, eq, like, sql } from "drizzle-orm";
import type { Exercise } from "../../../src/lib/lessons/types";
import { attempt, completion, perolaMovimento, studyDay, xpLedger } from "../../../src/server/db/schema";
import { exercicioDoItem } from "../../../src/server/estudo/conteudo";
import { aplicarEventos, dataNoFuso } from "../../../src/server/estudo/sincronizar";
import { concluirPulo, iniciarPulo, licoesConcluidasNoServidor, previaDoPulo, type RespostaDoPulo } from "../../../src/server/trilha/pulo";
import { itemMetaOf } from "../../../src/content/items";
import { CURRICULUM_TREE } from "../../../src/content/curriculum-tree";
import { alunoVerificado, ambiente, type Ambiente } from "./ajuda";

const AGORA = new Date("2026-10-15T15:00:00-03:00");
const AMANHA = new Date("2026-10-16T15:00:00-03:00");
const HOJE = dataNoFuso(AGORA, "America/Sao_Paulo");

let amb: Ambiente;
beforeEach(async () => {
  amb = await ambiente();
});

const aluno = async (email: string) => (await alunoVerificado(amb, email)).userId;

const capitulosDe = (materia: string) => CURRICULUM_TREE.subjects.find((s) => s.id === materia)!.sections.flatMap((s) => s.chapters);
const POR = capitulosDe("por");
const MAT = capitulosDe("mat");
const BIO = capitulosDe("bio");

function certa(ex: Exercise): Omit<RespostaDoPulo, "itemId"> {
  switch (ex.type) {
    case "multipla-escolha":
    case "complete-lacuna":
    case "interpretacao":
      return { resposta: ex.correta };
    case "encontre-o-erro":
      return { resposta: ex.erroIndex };
    case "verdadeiro-falso":
      return { resposta: ex.verdadeiro ? 1 : 0 };
    case "ordenar":
      return { resposta: ex.blocos.map((_, i) => i), exibidos: ex.blocos };
    case "parear":
      return { resposta: ex.pares.map((_, i) => i), exibidos: ex.pares.map((p) => p.b) };
  }
}

async function respostas(itens: string[], acertar: (i: number) => boolean): Promise<RespostaDoPulo[]> {
  const out: RespostaDoPulo[] = [];
  for (const [i, itemId] of itens.entries()) {
    const ex = await exercicioDoItem(itemId);
    if (!ex) throw new Error(`item ${itemId}`);
    out.push(acertar(i) ? { itemId, ...certa(ex) } : { itemId, resposta: null });
  }
  return out;
}

async function codigo(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return "sem erro";
  } catch (e) {
    return (e as { codigo?: string }).codigo ?? String(e);
  }
}

async function xpDaChave(u: string, chave: string): Promise<number | null> {
  const [r] = await amb.db.select({ xp: xpLedger.xp }).from(xpLedger).where(and(eq(xpLedger.userId, u), eq(xpLedger.key, chave)));
  return r ? r.xp : null;
}

describe("onde o teste vale", () => {
  test("aluno novo: só o 2º capítulo da matéria; outro capítulo e a redação ficam fora", async () => {
    const u = await aluno("pulo-onde@foca.dev");
    const p = await previaDoPulo(amb.db, u, POR[1].id, AGORA);
    expect(p.disponivel).toBe(true);
    expect(p.licoes.map((l) => l.id)).toEqual(POR[0].lessonIds);
    expect(p.questoes).toBeGreaterThanOrEqual(6);
    expect(p.questoes).toBeLessThanOrEqual(10);
    expect(p.testesHoje).toBe(0);
    expect((await previaDoPulo(amb.db, u, POR[2].id, AGORA)).motivo).toBe("FORA_DO_ALCANCE");
    expect((await previaDoPulo(amb.db, u, "redacao-argumentacao", AGORA)).motivo).toBe("FORA_DO_ALCANCE");
    expect(await codigo(iniciarPulo(amb.db, u, POR[2].id, AGORA))).toBe("FORA_DO_ALCANCE");
    expect(await codigo(iniciarPulo(amb.db, u, "redacao-argumentacao", AGORA))).toBe("FORA_DO_ALCANCE");
  });

  test("o teste: 6 a 10 itens inéditos, pelo menos 1 por habilidade do caminho e do alvo, prévia igual ao começo", async () => {
    const u = await aluno("pulo-comp@foca.dev");
    // Uma questão já vista nunca volta no teste.
    const t0 = await iniciarPulo(amb.db, u, POR[1].id, AGORA);
    const p = await previaDoPulo(amb.db, u, POR[1].id, AGORA);
    expect(p.emAndamento).toBe(t0.id);
    expect(p.questoes).toBe(t0.itens.length);
    expect(t0.itens.length).toBeGreaterThanOrEqual(6);
    expect(t0.itens.length).toBeLessThanOrEqual(10);
    const habilidades = new Set([...(POR[0].skillIds ?? []), ...(POR[1].skillIds ?? [])]);
    for (const h of habilidades) expect({ h, coberta: t0.itens.some((id) => itemMetaOf(id).skillIds.includes(h)) }).toEqual({ h, coberta: true });
    // Retomar devolve as mesmas questões.
    expect((await iniciarPulo(amb.db, u, POR[1].id, AGORA)).itens).toEqual(t0.itens);
  });

  test("itens já respondidos ficam fora", async () => {
    const u = await aluno("pulo-vistos@foca.dev");
    const v = await aluno("pulo-vistos2@foca.dev");
    const referencia = await iniciarPulo(amb.db, v, POR[1].id, AGORA);
    const ja = referencia.itens[0];
    const ex = await exercicioDoItem(ja);
    await aplicarEventos(
      amb.db,
      u,
      [{ tipo: "resposta", id: randomUUID().replaceAll("-", ""), itemId: ja, resposta: null, fonte: "licao", ocorreuEm: AGORA.toISOString(), dataLocal: HOJE }],
      AGORA,
    );
    expect(ex).toBeDefined();
    const t = await iniciarPulo(amb.db, u, POR[1].id, AGORA);
    expect(t.itens).not.toContain(ja);
  });
});

describe("passar", () => {
  test("marca as lições do caminho como pulo, 20 XP uma vez, sem XP das lições; respostas viram evidência; 1 bloco", async () => {
    const u = await aluno("pulo-passa@foca.dev");
    const t = await iniciarPulo(amb.db, u, POR[1].id, AGORA);
    const r = await concluirPulo(amb.db, u, t.id, await respostas(t.itens, () => true), AGORA);
    expect(r.passou).toBe(true);
    expect(r.acertos).toBe(t.itens.length);
    expect(r.xp).toBe(20);
    expect(r.licoesPuladas.map((l) => l.id)).toEqual(POR[0].lessonIds);
    expect(r.comecePor).toBeNull();

    const puladas = await amb.db.select().from(completion).where(and(eq(completion.userId, u), eq(completion.kind, "pulo")));
    expect(puladas.map((c) => c.key).sort()).toEqual(POR[0].lessonIds.map((id) => `pulo:micro:${id}`).sort());
    expect(await xpDaChave(u, `pulo:capitulo:${POR[1].id}`)).toBe(20);
    const [xpLicoes] = await amb.db.select({ n: sql<number>`count(*)` }).from(xpLedger).where(and(eq(xpLedger.userId, u), like(xpLedger.key, "licao:%")));
    expect(Number(xpLicoes.n)).toBe(0);

    const tentativas = await amb.db.select().from(attempt).where(eq(attempt.userId, u));
    expect(tentativas).toHaveLength(t.itens.length);
    expect(tentativas.every((a) => a.source === "pulo" && a.combo === null)).toBe(true);
    const [dia] = await amb.db.select().from(studyDay).where(eq(studyDay.userId, u));
    expect(dia.blocks).toBe(1);
    const perolas = await amb.db.select().from(perolaMovimento).where(and(eq(perolaMovimento.userId, u), eq(perolaMovimento.motivo, "bloco")));
    expect(perolas.map((p) => p.quantidade)).toEqual([5]);

    // Concluir de novo devolve o mesmo resultado e não paga nada de novo.
    const de_novo = await concluirPulo(amb.db, u, t.id, await respostas(t.itens, () => false), AGORA);
    expect(de_novo).toEqual(r);
    expect(await amb.db.select().from(attempt).where(eq(attempt.userId, u))).toHaveLength(t.itens.length);
    // O aparelho que não recebeu a resposta recupera o resultado pela prévia do mesmo dia.
    const previa = await previaDoPulo(amb.db, u, POR[1].id, AGORA);
    expect(previa.motivo).toBe("CAPITULO_HOJE");
    expect(previa.resultadoDeHoje).toEqual(r);

    // O servidor passa a contar as lições como feitas: o alvo anda para o capítulo seguinte.
    expect([...(await licoesConcluidasNoServidor(amb.db, u))].sort()).toEqual([...POR[0].lessonIds].sort());
    expect((await previaDoPulo(amb.db, u, POR[2].id, AGORA)).disponivel).toBe(true);
    // A exportação leva o teste (privacidade.md §3.2).
    const { exportarDadosDoAluno } = await import("../../../src/server/conta/dados");
    expect((await exportarDadosDoAluno(amb.db, u, AGORA)).testesDePulo).toEqual([expect.objectContaining({ capitulo: POR[1].id, resultado: "passou" })]);
  });

  test("lição pulada feita depois paga o XP normal da primeira conclusão", async () => {
    const u = await aluno("pulo-depois@foca.dev");
    const t = await iniciarPulo(amb.db, u, POR[1].id, AGORA);
    await concluirPulo(amb.db, u, t.id, await respostas(t.itens, () => true), AGORA);
    const licao = POR[0].lessonIds[0];
    await aplicarEventos(
      amb.db,
      u,
      [{ tipo: "licao-concluida", id: randomUUID().replaceAll("-", ""), licaoId: licao, tipoLicao: "micro", acertos: 4, total: 4, ocorreuEm: AGORA.toISOString(), dataLocal: HOJE }],
      AGORA,
    );
    expect(await xpDaChave(u, `licao:micro:${licao}`)).toBe(30);
  });

  test("80% com todas as habilidades acertadas passa", async () => {
    const u = await aluno("pulo-80@foca.dev");
    const t = await iniciarPulo(amb.db, u, POR[1].id, AGORA);
    // Erra só o último item: com 6 a 10 itens, ainda ≥ 80% (6 itens → 5/6 = 83%) e cada habilidade tem acerto.
    const r = await concluirPulo(amb.db, u, t.id, await respostas(t.itens, (i) => i < t.itens.length - 1), AGORA);
    expect(r.acertos).toBe(t.itens.length - 1);
    const erradoTemOutroAcerto = r.itens.filter((i) => i.skillId === r.itens[r.itens.length - 1].skillId).some((i) => i.correta);
    expect(r.passou).toBe(erradoTemOutroAcerto);
  });
});

describe("não passar", () => {
  test("nada é marcado e nenhum XP; mostra por onde começar; o teste ainda conta como bloco", async () => {
    const u = await aluno("pulo-nao@foca.dev");
    const t = await iniciarPulo(amb.db, u, POR[1].id, AGORA);
    const r = await concluirPulo(amb.db, u, t.id, await respostas(t.itens, (i) => i === 0), AGORA);
    expect(r.passou).toBe(false);
    expect(r.xp).toBe(0);
    expect(r.licoesPuladas).toEqual([]);
    expect(r.semQuestao).toEqual([]);
    expect(r.comecePor?.id).toBe(POR[0].lessonIds[0]);
    expect(r.valeRevisar.length).toBeGreaterThan(0);
    expect(await amb.db.select().from(completion).where(and(eq(completion.userId, u), eq(completion.kind, "pulo")))).toHaveLength(0);
    expect(await xpDaChave(u, `pulo:capitulo:${POR[1].id}`)).toBeNull();
    const [dia] = await amb.db.select().from(studyDay).where(eq(studyDay.userId, u));
    expect(dia.blocks).toBe(1);
  });

  test("não passou hoje: no dia seguinte tenta de novo e, passando, recebe os 20 XP uma vez", async () => {
    const u = await aluno("pulo-amanha@foca.dev");
    const t1 = await iniciarPulo(amb.db, u, POR[1].id, AGORA);
    await concluirPulo(amb.db, u, t1.id, await respostas(t1.itens, () => false), AGORA);
    expect(await codigo(iniciarPulo(amb.db, u, POR[1].id, AGORA))).toBe("CAPITULO_HOJE");
    expect((await previaDoPulo(amb.db, u, POR[1].id, AGORA)).motivo).toBe("CAPITULO_HOJE");
    const t2 = await iniciarPulo(amb.db, u, POR[1].id, AMANHA);
    expect(t2.id).not.toBe(t1.id);
    expect(t2.itens.some((id) => t1.itens.includes(id))).toBe(false); // as de ontem já foram vistas
    const r = await concluirPulo(amb.db, u, t2.id, await respostas(t2.itens, () => true), AMANHA);
    expect(r.passou).toBe(true);
    expect(await xpDaChave(u, `pulo:capitulo:${POR[1].id}`)).toBe(20);
  });
});

describe("limites", () => {
  test("3 testes por dia, em capítulos diferentes; o 4º é recusado", async () => {
    const u = await aluno("pulo-limite@foca.dev");
    const a = await iniciarPulo(amb.db, u, POR[1].id, AGORA);
    await concluirPulo(amb.db, u, a.id, await respostas(a.itens, () => true), AGORA);
    const b = await iniciarPulo(amb.db, u, POR[2].id, AGORA); // passou: o alvo andou
    await concluirPulo(amb.db, u, b.id, await respostas(b.itens, () => false), AGORA);
    await iniciarPulo(amb.db, u, MAT[1].id, AGORA); // começado e não terminado também conta
    expect((await previaDoPulo(amb.db, u, BIO[1].id, AGORA)).motivo).toBe("LIMITE_DO_DIA");
    expect(await codigo(iniciarPulo(amb.db, u, BIO[1].id, AGORA))).toBe("LIMITE_DO_DIA");
    // O começado continua retomável.
    expect(await codigo(iniciarPulo(amb.db, u, MAT[1].id, AGORA))).toBe("sem erro");
  });

  test("respostas incompletas são recusadas sem gastar nada", async () => {
    const u = await aluno("pulo-incompleto@foca.dev");
    const t = await iniciarPulo(amb.db, u, POR[1].id, AGORA);
    const todas = await respostas(t.itens, () => true);
    expect(await codigo(concluirPulo(amb.db, u, t.id, todas.slice(1), AGORA))).toBe("RESPOSTAS_INCOMPLETAS");
    expect(await amb.db.select().from(attempt).where(eq(attempt.userId, u))).toHaveLength(0);
  });
});

describe("isolamento", () => {
  test("B não vê, não retoma e não conclui o teste de A; o progresso de A não move o alvo de B", async () => {
    const a = await aluno("pulo-a@foca.dev");
    const b = await aluno("pulo-b@foca.dev");
    const t = await iniciarPulo(amb.db, a, POR[1].id, AGORA);
    expect(await codigo(concluirPulo(amb.db, b, t.id, await respostas(t.itens, () => true), AGORA))).toBe("NAO_ENCONTRADO");
    await concluirPulo(amb.db, a, t.id, await respostas(t.itens, () => true), AGORA);
    expect((await previaDoPulo(amb.db, b, POR[1].id, AGORA)).disponivel).toBe(true);
    expect((await previaDoPulo(amb.db, b, POR[1].id, AGORA)).emAndamento).toBeNull();
    expect((await previaDoPulo(amb.db, b, POR[2].id, AGORA)).motivo).toBe("FORA_DO_ALCANCE");
    expect(await xpDaChave(b, `pulo:capitulo:${POR[1].id}`)).toBeNull();
  });
});
