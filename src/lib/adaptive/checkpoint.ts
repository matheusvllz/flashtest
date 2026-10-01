/**
 * Quando inserir E como compor um checkpoint da trilha (docs/30 §13, Fase 8
 * F8.x `deveInserirCheckpoint` + Fase 14 do docs/31 F14.1/F14.3
 * `composeCheckpoint`/`recalibrar`, atrás de `FEATURES.checkpointsTrilha`).
 * Funções puras: recebem a janela (histórico + o que já foi decidido nesta
 * rodada) e o pool real de itens (`selectItems`, papel "diagnostico" — o
 * MESMO pool do nivelamento, Fase 13; hoje vazio no catálogo, ver o
 * comentário no topo de `placement.ts`. Composição/recalibração testadas
 * com pools sintéticos e simulação, mesmo padrão da Fase 13).
 */
import { activeSkills } from "@/content/taxonomy";
import { confidence } from "./confidence";
import { mastery } from "./model";
import { selectItems } from "./select-items";
import {
  CHECKPOINT_COTA_ANTIGAS,
  CHECKPOINT_COTA_FIRMES,
  CHECKPOINT_COTA_PRATICADAS,
  CHECKPOINT_MAX_ITENS,
  CHECKPOINT_MIN_ITENS,
  CHECKPOINT_SUBESTIMADO_PREDICTED_MAX,
  CHECKPOINT_SUPERESTIMADO_PREDICTED_MIN,
  CHECKPOINT_TARGET_P,
  FIRME_CONFIDENCE_MIN,
  FIRME_MASTERY_MIN,
} from "./constants";
import type { Attempt, JourneyHistoryEntry, LearningState } from "@/lib/learning/types";

export interface CheckpointWindowEntry {
  skillIds: string[];
  completedAt: string; // ISO — só usado pra achar "hoje"
}

export function deveInserirCheckpoint(
  learning: Pick<LearningState, "skillModel" | "skillEvidence" | "journey">,
  janela: CheckpointWindowEntry[],
  today: string,
  checkpointsHabilitado: boolean,
): boolean {
  if (!checkpointsHabilitado) return false;

  const desdeUltimo = learning.journey.sinceCheckpoint + janela.length;
  const jaConcluidoHoje = learning.journey.lastCheckpointDate === today;
  if (jaConcluidoHoje) return false;

  const habilidadesDesdeUltimo = new Set<string>();
  for (const a of janela) for (const id of a.skillIds) habilidadesDesdeUltimo.add(id);

  const confidencias = [...habilidadesDesdeUltimo].map(
    (id) => confidence(learning.skillModel[id], learning.skillEvidence[id], today).value,
  );
  const confidenceMedia = confidencias.length
    ? confidencias.reduce((a, b) => a + b, 0) / confidencias.length
    : 100;
  const habilidadesNovas = [...habilidadesDesdeUltimo].filter(
    (id) => !learning.skillModel[id],
  ).length;

  const limite = confidenceMedia < 40 || habilidadesNovas >= 4 ? 15 : 20;
  const atividadesTotais = learning.journey.history.length + janela.length;

  if (desdeUltimo >= 25) return true; // forçado, ainda respeitando "1 por dia" acima.
  return desdeUltimo >= limite && habilidadesDesdeUltimo.size >= 3 && atividadesTotais >= 6;
}

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function ordenarPorHash(ids: string[], seed: string): string[] {
  return [...ids].sort((a, b) => fnv1a(`${seed}:${a}`) - fnv1a(`${seed}:${b}`));
}

/**
 * Cota em cascata (docs/30 §13.2): cada grupo pega `round(n · cota)`; o que
 * faltar (grupo sem habilidade suficiente) some pro PRÓXIMO grupo da lista,
 * na ordem dada (praticadas → antigas → firmes).
 */
function escolherComCota(grupos: string[][], cotas: number[], n: number, seed: string): string[] {
  const alvo = cotas.map((c) => Math.round(n * c));
  const ordenados = grupos.map((ids) => ordenarPorHash(ids, seed));
  const escolhidos: string[] = [];
  let deficit = 0;
  for (let i = 0; i < grupos.length; i++) {
    const quota = alvo[i] + deficit;
    const pegos = ordenados[i].slice(0, quota);
    escolhidos.push(...pegos);
    deficit = Math.max(0, quota - pegos.length);
  }
  return escolhidos.slice(0, n);
}

export interface ComposeCheckpointResult {
  itemIds: string[];
  skillIds: string[];
  /** `true` quando não deu pra juntar `CHECKPOINT_MIN_ITENS` (6) itens de verdade — pool curto (docs/30 §13.2, edge case "pool insuficiente < 6 → não insere"). */
  poolCurto: boolean;
}

/**
 * Compõe os itens de UM checkpoint (docs/30 §13.2, Fase 14 F14.1) — chamada
 * na hora de COMEÇAR a atividade (`selectItemsForActivity`), igual prática/
 * revisão/desafio (docs/30 §11.7): nunca no planejamento.
 */
export function composeCheckpoint(
  learning: Pick<
    LearningState,
    "skillModel" | "skillEvidence" | "reviewSchedule" | "recentAttempts"
  >,
  historicoDesdeUltimo: Array<Pick<JourneyHistoryEntry, "skillIds">>,
  today: string,
  seed: string,
): ComposeCheckpointResult {
  const praticadas = [...new Set(historicoDesdeUltimo.flatMap((h) => h.skillIds))];
  const praticadasSet = new Set(praticadas);
  const skillsAtivas = activeSkills();

  const antigas = skillsAtivas
    .filter((s) => !praticadasSet.has(s.id))
    .filter((s) => {
      const dueDate = learning.reviewSchedule[s.id]?.dueDate;
      const devida = !!dueDate && dueDate <= today;
      const comLapse = (learning.skillModel[s.id]?.lapses ?? 0) > 0;
      return devida || comLapse;
    })
    .map((s) => s.id);
  const antigasSet = new Set(antigas);

  const firmes = skillsAtivas
    .filter((s) => !praticadasSet.has(s.id) && !antigasSet.has(s.id))
    .filter((s) => {
      const m = mastery(learning.skillModel[s.id]);
      const c = confidence(learning.skillModel[s.id], learning.skillEvidence[s.id], today).value;
      return m >= FIRME_MASTERY_MIN && c >= FIRME_CONFIDENCE_MIN;
    })
    .map((s) => s.id);

  const n = Math.max(
    CHECKPOINT_MIN_ITENS,
    Math.min(CHECKPOINT_MAX_ITENS, Math.round(praticadas.length * 1.2)),
  );

  const skillIds = escolherComCota(
    [praticadas, antigas, firmes],
    [CHECKPOINT_COTA_PRATICADAS, CHECKPOINT_COTA_ANTIGAS, CHECKPOINT_COTA_FIRMES],
    n,
    seed,
  );

  let poolCurto = false;
  const itemIds: string[] = [];
  for (const skillId of skillIds) {
    const theta = learning.skillModel[skillId]?.theta ?? 0;
    const r = selectItems(
      skillId,
      1,
      CHECKPOINT_TARGET_P,
      theta,
      learning,
      today,
      seed,
      "diagnostico",
    );
    if (r.itemIds.length === 0) {
      poolCurto = true;
      continue;
    }
    itemIds.push(...r.itemIds);
  }

  if (itemIds.length < CHECKPOINT_MIN_ITENS) poolCurto = true;

  return { itemIds, skillIds, poolCurto };
}

export interface RecalibrarInput {
  skillId: string;
  predictedP: number | undefined;
  correct: boolean;
}

export interface RecalibrarResult {
  /** Habilidades superestimadas (achava que sabia, errou) — revisão antecipada pra amanhã. */
  antecipandoRevisao: string[];
  /** Habilidades subestimadas (achava que não sabia, acertou) — elegíveis a desafio no próximo plano. */
  elegivelDesafio: string[];
}

/**
 * Recalibração pós-checkpoint (docs/30 §13.4, Fase 14 F14.3) — pura: recebe
 * as respostas já com `predictedP` (calculado no momento de responder, como
 * toda tentativa — docs/30 §27) e devolve os dois sinais; quem chama grava
 * `reviewSchedule` (antecipada) e decide como sinalizar "elegível a desafio"
 * pro próximo plano.
 */
export function recalibrar(respostas: RecalibrarInput[]): RecalibrarResult {
  const antecipandoRevisao: string[] = [];
  const elegivelDesafio: string[] = [];
  for (const r of respostas) {
    if (r.predictedP === undefined) continue;
    if (r.predictedP >= CHECKPOINT_SUPERESTIMADO_PREDICTED_MIN && !r.correct) {
      antecipandoRevisao.push(r.skillId);
    } else if (r.predictedP <= CHECKPOINT_SUBESTIMADO_PREDICTED_MAX && r.correct) {
      elegivelDesafio.push(r.skillId);
    }
  }
  return { antecipandoRevisao, elegivelDesafio };
}

/**
 * Entradas de `recalibrar` a partir das tentativas DESTE checkpoint (docs/36 T-04.4).
 * Preferência: a sessão do player (`sessionId`); sem ela (sessão já limpa), as
 * tentativas dos `itemIds` da atividade enviadas depois de `startedAt`. Tentativa sem
 * `predictedP` (ex.: "Não sei") não entra — `recalibrar` também as ignora.
 */
export function checkpointRecalibrationInputs(
  attempts: Attempt[],
  ctx: { sessionId?: string | null; itemIds?: string[]; startedAt?: string },
): RecalibrarInput[] {
  const itemIds = new Set(ctx.itemIds ?? []);
  const doCheckpoint = attempts.filter((a) => {
    if (ctx.sessionId) return a.sessionId === ctx.sessionId;
    return itemIds.has(a.exerciseId) && (!ctx.startedAt || a.submittedAt >= ctx.startedAt);
  });
  return doCheckpoint
    .filter((a) => a.skillIds.length > 0)
    .map((a) => ({ skillId: a.skillIds[0], predictedP: a.predictedP, correct: a.correct }));
}

/** Rótulo por habilidade no resultado da checagem (30 §13.5; spec 48 D48-13). */
export type RotuloChecagem = "subiu" | "firme" | "revisar";

export interface LinhaDaChecagem {
  skillId: string;
  rotulo: RotuloChecagem;
  /** A revisão desta habilidade foi antecipada para amanhã (superestimada). */
  revisaoAmanha: boolean;
  /** Ficou elegível a desafio (subestimada). */
  desafio: boolean;
}

/** Diferença de Domínio que conta como mudança (31 Fase 14: ±5). */
export const CHECAGEM_DELTA = 5;

/**
 * Resultado por habilidade (spec 48 T-48.5.1, D48-13): ΔDomínio ≥ +5 → "Subiu"; |Δ| < 5 → "Firme"; Δ ≤ −5 **ou** erro com
 * probabilidade prevista ≥ 0,8 → "Vale revisar". Só entram as habilidades respondidas nesta checagem; sem retrato de
 * antes (checagem de antes desta versão), a habilidade fica "Firme" salvo o sinal de superestimação. Sem número na tela.
 */
export function resultadoDaChecagem(
  antes: Record<string, number> | undefined,
  depois: Record<string, number>,
  respostas: RecalibrarInput[],
): LinhaDaChecagem[] {
  const { antecipandoRevisao, elegivelDesafio } = recalibrar(respostas);
  const vistas = [...new Set(respostas.map((r) => r.skillId))];
  return vistas.map((skillId) => {
    const delta = antes && skillId in antes && skillId in depois ? depois[skillId] - antes[skillId] : 0;
    const superestimada = antecipandoRevisao.includes(skillId);
    const rotulo: RotuloChecagem = superestimada || delta <= -CHECAGEM_DELTA ? "revisar" : delta >= CHECAGEM_DELTA ? "subiu" : "firme";
    return { skillId, rotulo, revisaoAmanha: superestimada, desafio: elegivelDesafio.includes(skillId) };
  });
}
