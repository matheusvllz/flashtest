import { learningStateVazio, type LearningState, type LearningSession } from "@/lib/learning/types";
import type { ExamTarget } from "@/lib/learning/types";

/**
 * Migração de estado (docs/20 §15.2/§15.3, Fase 5) — schemaVersion 4, aditivo
 * sobre `foca.state.v3`. Só cuida do que é NOVO nesta fase (`learning`,
 * `schemaVersion`, `prefs.examTargets/showExamTips`,
 * `progress.activityDaysSinceFreezeAward`, `progress.today.completedBlockIds`).
 * A fusão dos campos que já existiam (prefs/progress/quiz/tutor) continua em
 * `store.ts#load()`, que já fazia isso corretamente desde o rebranding v2→v3
 * — reescrever aquilo do zero aqui seria risco sem necessidade.
 */

export const CURRENT_SCHEMA_VERSION = 5;
export const BACKUP_KEY = "foca.state.backup.before-learning-v4";

export interface ParseResult {
  parsed: Record<string, unknown> | null;
  warning: string | null;
}

/** Parse protegido — nunca confia no cast TS; JSON inválido ou forma inesperada vira `null` + aviso, nunca lança. */
export function parseStoredState(raw: string): ParseResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { parsed: null, warning: "JSON inválido no storage — usando padrão nos campos afetados." };
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { parsed: null, warning: "Formato inesperado no storage — usando padrão nos campos afetados." };
  }
  return { parsed: value as Record<string, unknown>, warning: null };
}

/**
 * Cria o backup pré-Fase-5 uma única vez — nunca sobrescreve um já existente
 * (docs/20 §15.3 item 4). `readKey`/`writeKey` são injetados pra a função
 * continuar testável sem `localStorage` real.
 */
export function ensureBackup(
  raw: string,
  readKey: (key: string) => string | null,
  writeKey: (key: string, value: string) => void,
): boolean {
  try {
    if (readKey(BACKUP_KEY) !== null) return false;
    writeKey(BACKUP_KEY, raw);
    return true;
  } catch {
    return false;
  }
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function arrayOr<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function recordOr<T extends object>(value: unknown, fallback: T): T {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as T)
    : fallback;
}

/**
 * Sessão ativa sobrevive a um reload comum (docs/20 §8.1, critério A8) — o
 * próprio `useLearningSession` já ignora uma sessão cujo `contentId`/
 * `contentVersion` não bate com a lição atual, então preservar aqui é
 * seguro; só descarta se a forma básica estiver quebrada (nunca confia no
 * cast TS sem checar).
 *
 * Schema v5 (docs/25 §7.6): além da forma v4, exige `stepIndex` numérico —
 * uma sessão gravada pelo motor antigo (pré-T-08) não tem esse campo e é
 * descartada de propósito (decisão §6.2: não há como "des-descartar" uma
 * `activeSession` v4; o aluno recomeça a lição em progresso, nada mais é
 * perdido).
 */
function parseActiveSession(value: unknown): LearningSession | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const formaValida =
    typeof v.id === "string" &&
    typeof v.contentId === "string" &&
    typeof v.contentVersion === "number" &&
    typeof v.stage === "string" &&
    typeof v.exerciseIndex === "number" &&
    Array.isArray(v.exerciseIds) &&
    typeof v.answers === "object" &&
    v.answers !== null &&
    typeof v.stepIndex === "number";
  return formaValida ? (v as unknown as LearningSession) : null;
}

export interface AdditiveFields {
  schemaVersion: number;
  learning: LearningState;
  examTargets: ExamTarget[];
  showExamTips: boolean;
  activityDaysSinceFreezeAward: number;
  completedBlockIds: string[];
  /** Schema v5 (docs/25 §7.6) — matéria selecionada na trilha; `null` = nenhuma ainda. */
  trailSubjectId: string | null;
  /** true quando o storage já tem uma versão MAIOR que a que este app conhece. */
  futureVersion: boolean;
}

/**
 * Calcula os campos aditivos do schema v4 a partir do que já existe no
 * storage (se algo existir). Nunca reduz um `schemaVersion` já maior que o
 * conhecido por este app — versão futura não é sobrescrita por versão antiga
 * (docs/20 §15.3, item 10).
 */
export function computeAdditiveFields(parsed: Record<string, unknown> | null): AdditiveFields {
  const existente = numberOr(parsed?.schemaVersion, 3); // storage pré-Fase-5 é implicitamente v3
  const futureVersion = existente > CURRENT_SCHEMA_VERSION;

  const progress = recordOr<Record<string, unknown>>(parsed?.progress, {});
  const prefs = recordOr<Record<string, unknown>>(parsed?.prefs, {});
  const today = recordOr<Record<string, unknown>>(progress.today, {});
  const learningRaw = recordOr<Record<string, unknown>>(parsed?.learning, {});
  const vazio = learningStateVazio();

  return {
    schemaVersion: futureVersion ? existente : CURRENT_SCHEMA_VERSION,
    learning: {
      ...vazio,
      activeSession: parseActiveSession(learningRaw.activeSession),
      completedLessons: recordOr(learningRaw.completedLessons, vazio.completedLessons),
      skillEvidence: recordOr(learningRaw.skillEvidence, vazio.skillEvidence),
      reviewSchedule: recordOr(learningRaw.reviewSchedule, vazio.reviewSchedule),
      recentAttempts: arrayOr(learningRaw.recentAttempts, vazio.recentAttempts),
      // Ledger de recompensa: a Fase 11 é quem popula tetos consumidos por
      // questões legadas já concluídas (ela mesma lista essa tarefa como sua
      // — docs/20 Fase 11, item 3). Aqui só preserva o que já existir.
      rewardLedger: recordOr(learningRaw.rewardLedger, vazio.rewardLedger),
      tipHistory: arrayOr(learningRaw.tipHistory, vazio.tipHistory),
      // Schema v5 (docs/25 §7.6): capítulos cuja folha de celebração já foi mostrada.
      celebratedChapterIds: arrayOr<string>(learningRaw.celebratedChapterIds, vazio.celebratedChapterIds),
    },
    examTargets: arrayOr<ExamTarget>(prefs.examTargets, []),
    showExamTips: typeof prefs.showExamTips === "boolean" ? prefs.showExamTips : true,
    activityDaysSinceFreezeAward: numberOr(progress.activityDaysSinceFreezeAward, 0),
    completedBlockIds: arrayOr<string>(today.completedBlockIds, []),
    trailSubjectId: typeof prefs.trailSubjectId === "string" ? prefs.trailSubjectId : null,
    futureVersion,
  };
}
