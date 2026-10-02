/**
 * Missões do dia, desafio do mês e conquistas no servidor (spec 50 §5.4). O sorteio é determinístico (aluno + dia) e
 * o progresso vem só dos fatos que o servidor já confere (respostas recorrigidas, conclusões, combo do servidor).
 * Pérolas: 10 por missão, +10 pelas 3, 150 pelo desafio do mês; conquistas pelo catálogo. Idempotente pelas chaves.
 */
import { and, count, desc, eq, gte, lte, max, sql } from "drizzle-orm";
import { CONQUISTAS, novasConquistas, type Estatisticas } from "@/lib/conquistas";
import { MISSOES_DO_DESAFIO, mesDe, sortearMissoes, type ContextoDasMissoes, type IdDeMissao } from "@/lib/missoes";
import { chavePerola, PEROLAS_DESAFIO_DO_MES, PEROLAS_MISSOES_COMPLETAS, PEROLAS_POR_MISSAO } from "@/lib/perolas";
import { nivelDeXp } from "@/lib/niveis";
import { dominioPorArea } from "@/lib/dominio-por-area";
import { MINIMO_PARA_MINI, semanaDe } from "@/lib/simulado";
import type { SkillModelEntry } from "@/lib/learning/types";
import type { NovidadesDoServidor } from "@/lib/sync/contrato";
import type { Banco } from "../db/client";
import {
  attempt,
  cadernoItem,
  comboDia,
  completion,
  conquista,
  desafioMes,
  learningDoc,
  missaoDia,
  perolaMovimento,
  redacao,
  simulado,
  studyDay,
  xpLedger,
} from "../db/schema";
import type { Tx } from "../estudo/sincronizar";
import { creditar } from "../economia/perolas";
import { itensOficiais } from "../estudo/conteudo";
import { alunoTemFuncao, recursoLigado } from "../planos/funcoes";

type Leitor = Banco | Tx;

/* ------------------------------------------------------------ contexto e sorteio --- */

async function miniFeito(db: Leitor, userId: string, dia: string): Promise<boolean> {
  const [s] = await db
    .select({ fim: simulado.concluidoEm })
    .from(simulado)
    .where(eq(simulado.id, `mini:${userId}:${semanaDe(dia)}`))
    .limit(1);
  return !!s?.fim;
}

async function contextoDasMissoes(db: Leitor, userId: string, dia: string, agora: Date): Promise<ContextoDasMissoes> {
  const [doc] = await db.select({ doc: learningDoc.doc }).from(learningDoc).where(eq(learningDoc.userId, userId)).limit(1);
  const d = (doc?.doc ?? {}) as {
    prefs?: { dailyLessons?: number };
    learning?: { reviewSchedule?: Record<string, { dueDate?: string }>; skillModel?: Record<string, SkillModelEntry> };
  };
  const [dias] = await db.select({ n: count() }).from(studyDay).where(eq(studyDay.userId, userId));
  const recentes = await db
    .select({ c: attempt.correct })
    .from(attempt)
    .where(and(eq(attempt.userId, userId), eq(attempt.tentativa, "primeira"), eq(attempt.pontuada, true)))
    .orderBy(desc(attempt.answeredAt))
    .limit(30);
  const revisaoDevida = Object.values(d.learning?.reviewSchedule ?? {}).some((r) => typeof r?.dueDate === "string" && r.dueDate <= dia);
  const dom = dominioPorArea(d.learning?.skillModel ?? {});
  const comLacuna = (Object.entries(dom) as [ContextoDasMissoes["areaComLacuna"], number | null][])
    .filter(([, v]) => v !== null)
    .sort((a, b) => (a[1] as number) - (b[1] as number))[0]?.[0] ?? null;
  let cadernoParaHoje = 0;
  if (await alunoTemFuncao(db as Banco, userId, "cadernoDeErros", agora)) {
    const [c] = await db
      .select({ n: count() })
      .from(cadernoItem)
      .where(and(eq(cadernoItem.userId, userId), eq(cadernoItem.estado, "ativo"), lte(cadernoItem.proximaRevisao, dia)));
    cadernoParaHoje = Number(c?.n ?? 0);
  }
  return {
    metaDiaria: Math.max(1, Math.min(10, Number(d.prefs?.dailyLessons ?? 1))),
    diasDeEstudo: Number(dias?.n ?? 0),
    precisaoRecente: recentes.length >= 10 ? recentes.filter((r) => r.c).length / recentes.length : null,
    revisaoDevida,
    areaComLacuna: comLacuna,
    cadernoParaHoje,
    temEscrita: recursoLigado("escrita"),
    // A missão do mini só entra se ele está aberto e o aluno ainda não fez o desta semana.
    miniDisponivel: recursoLigado("miniSimulado") && itensOficiais().length >= MINIMO_PARA_MINI && !(await miniFeito(db, userId, dia)),
    flashcardsDevidos: 0,
  };
}

/** As missões do dia, sorteando e gravando na primeira vez. */
export async function garantirMissoesDoDia(tx: Tx, userId: string, dia: string, agora: Date) {
  const atuais = await tx.select().from(missaoDia).where(and(eq(missaoDia.userId, userId), eq(missaoDia.localDate, dia)));
  if (atuais.length) return atuais.sort((a, b) => a.ordem - b.ordem);
  const sorteadas = sortearMissoes(userId, dia, await contextoDasMissoes(tx, userId, dia, agora));
  await tx
    .insert(missaoDia)
    .values(sorteadas.map((m, ordem) => ({ userId, localDate: dia, missaoId: m.id, ordem, alvo: m.alvo })))
    .onConflictDoNothing();
  return (await tx.select().from(missaoDia).where(and(eq(missaoDia.userId, userId), eq(missaoDia.localDate, dia)))).sort(
    (a, b) => a.ordem - b.ordem,
  );
}

/* ---------------------------------------------------------------- progresso --- */

/** Fato que faz missão andar (spec 50 §5.4.1). */
export type FatoDeMissao =
  | { tipo: "bloco"; flashcards: boolean }
  | { tipo: "combo"; atual: number }
  | { tipo: "perfeita" }
  | { tipo: "revisao-trilha" }
  | { tipo: "resposta-area"; area: "LC" | "CH" | "CN" | "MT" }
  | { tipo: "caderno" }
  | { tipo: "escrita" }
  | { tipo: "mini" };

function avanco(missao: IdDeMissao, f: FatoDeMissao): { soma?: number; minimo?: number } | null {
  switch (f.tipo) {
    case "bloco":
      if (missao === "fazer-1" || missao === "fazer-2") return { soma: 1 };
      if (missao === "flashcards-1" && f.flashcards) return { soma: 1 };
      return null;
    case "combo":
      return missao === "combo-3" || missao === "combo-5" ? { minimo: f.atual } : null;
    case "perfeita":
      return missao === "perfeita" ? { soma: 1 } : null;
    case "revisao-trilha":
      return missao === "revisao-trilha" ? { soma: 1 } : null;
    case "resposta-area":
      return missao === `pratica-${f.area}` ? { soma: 1 } : null;
    case "caderno":
      return missao === "caderno-3" ? { soma: 1 } : null;
    case "escrita":
      return missao === "escrita-1" ? { soma: 1 } : null;
    case "mini":
      return missao === "mini-semana" ? { soma: 1 } : null;
  }
}

/** Aplica fatos às missões do dia; concede Pérolas e o desafio do mês. Só com missões ligadas. */
export async function progredirMissoes(
  tx: Tx,
  userId: string,
  dia: string,
  fatos: readonly FatoDeMissao[],
  agora: Date,
  nov: NovidadesDoServidor,
): Promise<void> {
  if (!fatos.length || !recursoLigado("missoes")) return;
  const missoes = await garantirMissoesDoDia(tx, userId, dia, agora);
  for (const m of missoes) {
    if (m.concluidaEm) continue;
    let progresso = m.progresso;
    for (const f of fatos) {
      const a = avanco(m.missaoId as IdDeMissao, f);
      if (!a) continue;
      if (a.soma) progresso += a.soma;
      if (a.minimo !== undefined) progresso = Math.max(progresso, a.minimo);
    }
    if (progresso === m.progresso) continue;
    const concluida = progresso >= m.alvo;
    await tx
      .update(missaoDia)
      .set({ progresso: Math.min(progresso, m.alvo), concluidaEm: concluida ? agora : null })
      .where(and(eq(missaoDia.userId, userId), eq(missaoDia.localDate, dia), eq(missaoDia.missaoId, m.missaoId)));
    if (!concluida) continue;
    m.concluidaEm = agora;
    nov.missoesConcluidas.push(m.missaoId);
    if (recursoLigado("perolas") && (await creditar(tx, userId, chavePerola.missao(dia, m.missaoId), PEROLAS_POR_MISSAO, "missao", dia, m.missaoId))) {
      nov.perolasGanhas += PEROLAS_POR_MISSAO;
    }
    await contarNoDesafio(tx, userId, dia, agora, nov);
  }
  if (missoes.length === 3 && missoes.every((m) => m.concluidaEm) && recursoLigado("perolas")) {
    if (await creditar(tx, userId, chavePerola.missoesCompletas(dia), PEROLAS_MISSOES_COMPLETAS, "missoes-completas", dia)) {
      nov.perolasGanhas += PEROLAS_MISSOES_COMPLETAS;
    }
  }
}

async function contarNoDesafio(tx: Tx, userId: string, dia: string, agora: Date, nov: NovidadesDoServidor) {
  const mes = mesDe(dia);
  await tx
    .insert(desafioMes)
    .values({ userId, mes, progresso: 1 })
    .onConflictDoUpdate({ target: [desafioMes.userId, desafioMes.mes], set: { progresso: sql`${desafioMes.progresso} + 1` } });
  const [d] = await tx.select().from(desafioMes).where(and(eq(desafioMes.userId, userId), eq(desafioMes.mes, mes))).limit(1);
  if (d && d.progresso >= MISSOES_DO_DESAFIO && !d.concluidoEm) {
    await tx.update(desafioMes).set({ concluidoEm: agora }).where(and(eq(desafioMes.userId, userId), eq(desafioMes.mes, mes)));
    nov.desafioDoMes = true;
    if (recursoLigado("perolas") && (await creditar(tx, userId, chavePerola.desafio(mes), PEROLAS_DESAFIO_DO_MES, "desafio", dia, mes))) {
      nov.perolasGanhas += PEROLAS_DESAFIO_DO_MES;
    }
  }
}

/* --------------------------------------------------------------- conquistas --- */

function inicioDaSemana(dia: string): string {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export async function estatisticasDoAluno(db: Leitor, userId: string, hoje: string, melhorOfensiva: number): Promise<Estatisticas> {
  const [lic] = await db
    .select({ n: count() })
    .from(completion)
    .where(and(eq(completion.userId, userId), sql`${completion.kind} in ('licao-micro', 'licao-redacao', 'pratica', 'desafio', 'reforco', 'introducao')`));
  const [perf] = await db.select({ n: count() }).from(perolaMovimento).where(and(eq(perolaMovimento.userId, userId), eq(perolaMovimento.motivo, "perfeita")));
  const [combo] = await db.select({ m: max(comboDia.maximo) }).from(comboDia).where(eq(comboDia.userId, userId));
  const [sims] = await db.select({ n: count() }).from(simulado).where(and(eq(simulado.userId, userId), sql`${simulado.concluidoEm} is not null`));
  const [sims90] = await db
    .select({ n: count() })
    .from(simulado)
    .where(and(eq(simulado.userId, userId), sql`${simulado.concluidoEm} is not null`, eq(simulado.tipo, "dia")));
  const [escr] = await db.select({ n: count() }).from(redacao).where(and(eq(redacao.userId, userId), sql`${redacao.tipo} in ('treino', 'tarefa')`));
  const [est] = await db
    .select({ n: count() })
    .from(redacao)
    .where(and(eq(redacao.userId, userId), eq(redacao.tipo, "correcao"), sql`${redacao.resultado} is not null`));
  const [cad] = await db.select({ n: count() }).from(cadernoItem).where(and(eq(cadernoItem.userId, userId), eq(cadernoItem.estado, "resolvido")));
  const [xp] = await db.select({ s: sql<number>`coalesce(sum(${xpLedger.xp}), 0)` }).from(xpLedger).where(eq(xpLedger.userId, userId));
  const areas = await db
    .select({ m: missaoDia.missaoId })
    .from(missaoDia)
    .where(and(eq(missaoDia.userId, userId), gte(missaoDia.localDate, inicioDaSemana(hoje)), sql`${missaoDia.missaoId} like 'pratica-%'`, sql`${missaoDia.progresso} > 0`));
  return {
    licoes: Number(lic?.n ?? 0),
    melhorOfensiva,
    perfeitas: Number(perf?.n ?? 0),
    maiorCombo: Number(combo?.m ?? 0),
    simulados: Number(sims?.n ?? 0),
    simulados90: Number(sims90?.n ?? 0),
    escritas: Number(escr?.n ?? 0),
    estimativas: Number(est?.n ?? 0),
    areasNaSemana: new Set(areas.map((a) => a.m)).size,
    cadernoResolvidos: Number(cad?.n ?? 0),
    nivel: nivelDeXp(Number(xp?.s ?? 0)).nivel,
  };
}

export async function avaliarConquistas(tx: Tx, userId: string, hoje: string, melhorOfensiva: number, nov: NovidadesDoServidor) {
  if (!recursoLigado("missoes")) return;
  const tem = new Set((await tx.select({ id: conquista.conquistaId }).from(conquista).where(eq(conquista.userId, userId))).map((r) => r.id));
  if (tem.size === CONQUISTAS.length) return;
  const e = await estatisticasDoAluno(tx, userId, hoje, melhorOfensiva);
  for (const c of novasConquistas(e, tem)) {
    const r = await tx.insert(conquista).values({ userId, conquistaId: c.id }).onConflictDoNothing().returning({ id: conquista.conquistaId });
    if (!r.length) continue;
    nov.conquistas.push(c.id);
    if (recursoLigado("perolas") && (await creditar(tx, userId, chavePerola.conquista(c.id), c.perolas, "conquista", hoje, c.id))) {
      nov.perolasGanhas += c.perolas;
    }
  }
}

/* ------------------------------------------------------------- leitura da tela --- */

export interface MinhasMissoes {
  ligado: boolean;
  dia: string;
  missoes: { id: string; alvo: number; progresso: number; concluida: boolean }[];
  desafio: { mes: string; progresso: number; alvo: number; concluido: boolean };
  conquistas: { id: string; perolas: number; obtidaEm: string | null }[];
  medalhas: string[];
}

export async function minhasMissoes(db: Banco, userId: string, dia: string, agora: Date): Promise<MinhasMissoes> {
  const ligado = recursoLigado("missoes");
  const missoes = ligado ? await db.transaction((tx) => garantirMissoesDoDia(tx, userId, dia, agora)) : [];
  const mes = mesDe(dia);
  const [d] = await db.select().from(desafioMes).where(and(eq(desafioMes.userId, userId), eq(desafioMes.mes, mes))).limit(1);
  const obtidas = await db.select().from(conquista).where(eq(conquista.userId, userId));
  const medalhas = (await db.select({ mes: desafioMes.mes }).from(desafioMes).where(and(eq(desafioMes.userId, userId), sql`${desafioMes.concluidoEm} is not null`))).map(
    (r) => r.mes,
  );
  const quando = new Map(obtidas.map((o) => [o.conquistaId, o.obtidaEm.toISOString()]));
  return {
    ligado,
    dia,
    missoes: missoes.map((m) => ({ id: m.missaoId, alvo: m.alvo, progresso: m.progresso, concluida: !!m.concluidaEm })),
    desafio: { mes, progresso: Math.min(d?.progresso ?? 0, MISSOES_DO_DESAFIO), alvo: MISSOES_DO_DESAFIO, concluido: !!d?.concluidoEm },
    conquistas: CONQUISTAS.map((c) => ({ id: c.id, perolas: c.perolas, obtidaEm: quando.get(c.id) ?? null })),
    medalhas: medalhas.sort(),
  };
}
