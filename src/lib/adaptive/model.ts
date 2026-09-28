import type { AttemptRole, SkillModelEntry } from "@/lib/learning/types";
import {
  ALGO_VERSION,
  ALPHA_INDEPENDENT_SHARE,
  JANELA_RECENT,
  K_MIN,
  K_SPAN,
  MAX_STEP,
  DRIFT_Q,
  PESO_ASSISTIDA,
  PESO_NAO_SEI,
  PESO_PAPEL,
  SIGMA0,
  SIGMA_MIN,
  SLIP,
  THETA_MAX,
  THETA_MIN,
  THETA_PRIOR,
} from "./constants";

/**
 * Mastery/Confidence (docs/30 §9, Fase 5 do docs/31) — modelo inspirado em
 * TRI (3PL com escorregão), atualização estilo Elo/Glicko com ganho
 * proporcional à incerteza. Funções puras: nenhuma chamada de rede, nenhum
 * `Date.now()` fora de `updatedAt` (metadado, não usado em cálculo).
 */

function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function clamp(x: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, x));
}

/** Dias corridos entre duas datas `YYYY-MM-DD` locais. `null`/ausente → 0 (entrada nova, sem drift a aplicar). */
function diasEntreISO(anterior: string | null, hoje: string): number {
  if (!anterior) return 0;
  const a = new Date(`${anterior}T00:00:00`);
  const b = new Date(`${hoje}T00:00:00`);
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

export interface ItemIrtLike {
  a: number;
  b: number;
  c: number;
}

/**
 * Probabilidade de acerto prevista (docs/30 §9.2/§9.4). "Não sei" não é
 * chute errado — a probabilidade de "acerto" ali é lida como "sem
 * escorregão", sem o piso de chute `c` (o aluno optou por não adivinhar).
 */
export function probabilityCorrect(theta: number, irt: ItemIrtLike, opts?: { dontKnow?: boolean }): number {
  const p2 = logistic(irt.a * (theta - irt.b));
  if (opts?.dontKnow) return (1 - SLIP) * p2;
  return irt.c + (1 - irt.c - SLIP) * p2;
}

export function mastery(entry: SkillModelEntry | undefined | Pick<SkillModelEntry, "theta">): number {
  const theta = entry?.theta ?? THETA_PRIOR;
  return Math.round(100 * logistic(theta));
}

/** Papéis reconhecidos por `PESO_PAPEL`; qualquer outro (ex. `"simulado"`, ainda sem peso definido) usa 1,0. */
function pesoDoPapel(role: AttemptRole): number {
  return (PESO_PAPEL as Partial<Record<AttemptRole, number>>)[role] ?? 1.0;
}

export interface UpdateSkillAttempt {
  role: AttemptRole;
  correct: boolean;
  response?: "answered" | "dont-know";
  assisted?: boolean;
}

export interface UpdateSkillPrior {
  theta: number;
  sigma: number;
  source: SkillModelEntry["source"];
}

export interface UpdateSkillOptions {
  /** Habilidade secundária (0,4) e/ou repetição do mesmo item no mesmo dia (0,5) — já combinados pelo chamador. */
  weightMultiplier?: number;
  /** Dificuldade editorial do item (1–5) — alimenta `difficultiesSeen` (Confidence, diversidade). */
  difficulty?: 1 | 2 | 3 | 4 | 5;
  prior?: UpdateSkillPrior;
  /** Injetável para teste; default `new Date().toISOString()`. */
  now?: string;
}

function entradaVazia(skillId: string, prior: UpdateSkillPrior | undefined, now: string): SkillModelEntry {
  return {
    skillId,
    theta: prior?.theta ?? THETA_PRIOR,
    sigma: prior?.sigma ?? SIGMA0,
    nEff: 0,
    difficultiesSeen: [],
    recent: [],
    independentShare: 0,
    lastEvidenceDate: null,
    lapses: 0,
    dontKnowRecent: 0,
    helpHeavyRecent: 0,
    source: prior?.source ?? "evidencia",
    algoVersion: ALGO_VERSION,
    updatedAt: now,
  };
}

/**
 * Atualiza o modelo de UMA habilidade a partir de UMA tentativa (docs/30
 * §9.4). Chamado uma vez por `skillId` de `Attempt.skillIds` — a principal
 * com `weightMultiplier` 1 (× repetição-mesmo-dia se aplicável), as
 * secundárias com `PESO_HABILIDADE_SECUNDARIA` (× repetição) já combinado
 * pelo chamador antes de passar aqui.
 */
export function updateSkill(
  entryAtual: SkillModelEntry | undefined,
  skillId: string,
  attempt: UpdateSkillAttempt,
  irt: ItemIrtLike,
  today: string,
  opts: UpdateSkillOptions = {},
): SkillModelEntry {
  const now = opts.now ?? new Date().toISOString();
  const e = entryAtual ? { ...entryAtual } : entradaVazia(skillId, opts.prior, now);

  // 1. Drift de incerteza — dias sem evidência aumentam sigma (nunca além do teto SIGMA0).
  const dias = diasEntreISO(e.lastEvidenceDate, today);
  e.sigma = Math.min(SIGMA0, Math.sqrt(e.sigma ** 2 + DRIFT_Q * dias));

  const thetaAntes = e.theta;
  const dontKnow = attempt.response === "dont-know";
  const p = probabilityCorrect(thetaAntes, irt, { dontKnow });
  const obs: 0 | 1 = dontKnow ? 0 : attempt.correct ? 1 : 0;

  // 2. Peso da tentativa.
  const wPapel = pesoDoPapel(attempt.role);
  const wAssist = attempt.assisted ? PESO_ASSISTIDA : 1;
  const wNaoSei = dontKnow ? PESO_NAO_SEI : 1;
  const w = wPapel * wAssist * wNaoSei * (opts.weightMultiplier ?? 1);

  // 3. Passo estilo Elo, ganho proporcional à incerteza atual.
  const K = K_MIN + K_SPAN * (e.sigma / SIGMA0);
  const delta = clamp(K * w * (obs - p), -MAX_STEP, MAX_STEP);
  const thetaDepois = clamp(thetaAntes + delta, THETA_MIN, THETA_MAX);

  // 4. Incerteza encolhe com a informação do item (Fisher, 2PL, no theta ANTES da atualização).
  const p2 = logistic(irt.a * (thetaAntes - irt.b));
  const informacao = w * irt.a ** 2 * p2 * (1 - p2);
  const sigmaDepois = Math.max(SIGMA_MIN, 1 / Math.sqrt(1 / e.sigma ** 2 + informacao));

  // 5. Contadores.
  const independente = !attempt.assisted;
  const independentShare =
    e.nEff === 0 ? (independente ? 1 : 0) : e.independentShare * (1 - ALPHA_INDEPENDENT_SHARE) + (independente ? 1 : 0) * ALPHA_INDEPENDENT_SHARE;
  const difficultiesSeen =
    independente && opts.difficulty && !e.difficultiesSeen.includes(opts.difficulty)
      ? [...e.difficultiesSeen, opts.difficulty]
      : e.difficultiesSeen;
  const recentValor: 0 | 1 | 2 = dontKnow ? 2 : obs;
  const masteryAntes = mastery({ theta: thetaAntes });
  const papelConfereRetencao = attempt.role === "revisao" || attempt.role === "diagnostico";
  const lapses = e.lapses + (papelConfereRetencao && obs === 0 && masteryAntes >= 70 ? 1 : 0);

  return {
    ...e,
    theta: thetaDepois,
    sigma: sigmaDepois,
    nEff: e.nEff + w,
    difficultiesSeen,
    recent: [...e.recent, recentValor].slice(-JANELA_RECENT),
    independentShare,
    lastEvidenceDate: today,
    lapses,
    dontKnowRecent: Math.max(0, e.dontKnowRecent - dias) + (dontKnow ? 1 : 0),
    helpHeavyRecent: Math.max(0, e.helpHeavyRecent - dias),
    // Esta chamada É evidência real (uma tentativa acabou de ser processada) —
    // mesmo quando `opts.prior` seedou o ponto de partida (nivelamento, Fase
    // 13; prior de matéria, futuro), o resultado não é mais "só prior" depois
    // de passar por aqui. Só `applyPlacement` grava entradas com source
    // `"prior-*"` de verdade, direto, sem chamar `updateSkill` (docs/30 §12.3).
    source: "evidencia",
    algoVersion: ALGO_VERSION,
    updatedAt: now,
  };
}
