import {
  journeyVazia,
  learningStateVazio,
  studyFocusVazio,
  type FocusSession,
  type JourneyState,
  type LearningEvent,
  type LearningState,
  type LearningSession,
  type PlacementState,
  type StudyFocus,
} from "@/lib/learning/types";
import type { ExamTarget } from "@/lib/learning/types";

/**
 * Migração de estado (docs/20 §15.2/§15.3, Fase 5; docs/30 §21/§24.1, Fase 4
 * do docs/31) — aditiva sobre `foca.state.v3`. Só cuida do que é NOVO em
 * cada versão (`learning`, `schemaVersion`, campos de `prefs`/`progress`
 * declarados abaixo). A fusão dos campos que já existiam continua em
 * `store.ts#load()`, que já fazia isso corretamente desde o rebranding
 * v2→v3 — reescrever aquilo do zero aqui seria risco sem necessidade.
 */

export const CURRENT_SCHEMA_VERSION = 6;
export const BACKUP_KEY = "foca.state.backup.before-learning-v4";
/** Backup específico da migração v6 (docs/30 §21.1/§24.1) — mesma regra do `BACKUP_KEY`: uma vez, nunca sobrescrito. */
export const BACKUP_KEY_V6 = "foca.state.backup.before-v6";

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
  /** Schema v6 (Fase 4): chave do backup — default `BACKUP_KEY` (v4) por compatibilidade; `store.ts` passa `BACKUP_KEY_V6` numa segunda chamada. */
  key: string = BACKUP_KEY,
): boolean {
  try {
    if (readKey(key) !== null) return false;
    writeKey(key, raw);
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

/**
 * `PlannedActivity` real tem muitos campos (docs/30 §11.6); aqui só checamos
 * o mínimo que prova que o valor É um `PlannedActivity` sério (não confia
 * no cast TS) — mesmo nível de rigor de `parseActiveSession`. Forma errada
 * descarta o item (não lança, não trava o boot).
 */
function pareceAtividadePlanejada(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.kind === "string" &&
    typeof v.subjectId === "string" &&
    Array.isArray(v.skillIds)
  );
}

/** `undefined`/forma inválida → `journeyVazia()` — uma jornada corrompida nunca trava o boot; o motor (Fase 8/12) replaneja do zero. */
function parseJourney(value: unknown): JourneyState {
  if (typeof value !== "object" || value === null) return journeyVazia();
  const v = value as Record<string, unknown>;
  const committedOk = Array.isArray(v.committed) && v.committed.every(pareceAtividadePlanejada);
  const upcomingOk = Array.isArray(v.upcoming) && v.upcoming.every(pareceAtividadePlanejada);
  const historyOk = Array.isArray(v.history);
  const activeOk = v.activeActivity === null || pareceAtividadePlanejada(v.activeActivity);
  if (
    !committedOk ||
    !upcomingOk ||
    !historyOk ||
    !activeOk ||
    typeof v.sinceCheckpoint !== "number" ||
    (v.lastCheckpointDate !== null && typeof v.lastCheckpointDate !== "string") ||
    typeof v.planVersion !== "number"
  ) {
    return journeyVazia();
  }
  return v as unknown as JourneyState;
}

/** Forma inválida → `null` (docs/30 §21.1: "forma inválida → null" é a regra explícita pro placement, diferente da jornada). */
function parsePlacement(value: unknown): PlacementState | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const statusValido = v.status === "em-andamento" || v.status === "concluido" || v.status === "abandonado";
  if (
    !statusValido ||
    typeof v.startedAt !== "string" ||
    (v.finishedAt !== null && typeof v.finishedAt !== "string") ||
    typeof v.areas !== "object" ||
    v.areas === null ||
    typeof v.seed !== "string"
  ) {
    return null;
  }
  return v as unknown as PlacementState;
}

const ISO_DATA = /^\d{4}-\d{2}-\d{2}$/;

/** Sessão de foco EXPIRADA (`expiresOn < hoje`) some na carga (docs/30 §15) — nunca fica presa num "só hoje" de ontem. */
function parseFocusSession(value: unknown, hoje: string): FocusSession | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (
    !Array.isArray(v.subjectIds) ||
    !v.subjectIds.every((s) => typeof s === "string") ||
    typeof v.startedAt !== "string" ||
    typeof v.expiresOn !== "string" ||
    !ISO_DATA.test(v.expiresOn)
  ) {
    return null;
  }
  if (v.expiresOn < hoje) return null;
  return v as unknown as FocusSession;
}

function parseStudyFocusMode(value: unknown): StudyFocus["mode"] | null {
  return value === "todas" || value === "materias" || value === "areas" ? value : null;
}

function parseStudyFocus(value: unknown): StudyFocus {
  if (typeof value !== "object" || value === null) return studyFocusVazio();
  const v = value as Record<string, unknown>;
  const mode = parseStudyFocusMode(v.mode);
  if (!mode || !Array.isArray(v.subjectIds) || !Array.isArray(v.areas)) return studyFocusVazio();
  return {
    mode,
    subjectIds: v.subjectIds.filter((s): s is string => typeof s === "string"),
    areas: v.areas.filter((a): a is StudyFocus["areas"][number] => typeof a === "string"),
  };
}

const MINUTOS_VALIDOS = new Set([5, 10, 15, 20, 30]);

/** `dailyMinutes` derivado de `dailyLessons` (docs/30 §21.1) quando ainda não existe — nunca inventa um valor fora da lista fechada. */
function dailyMinutesDe(dailyLessons: unknown): 5 | 10 | 15 | 20 | 30 {
  const n = typeof dailyLessons === "number" ? dailyLessons : 3;
  if (n <= 1) return 5;
  if (n <= 3) return 10;
  return 15;
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
  /** Schema v6 (docs/30 §15/§21.1) — foco permanente; `{mode:"todas"}` = sem preferência ainda. */
  studyFocus: StudyFocus;
  /** Schema v6 — matérias que o aluno já declarou "vou bem". */
  easySubjects: string[];
  /** Schema v6 — minutos de estudo por dia, derivado de `dailyLessons` quando ainda não existe. */
  dailyMinutes: 5 | 10 | 15 | 20 | 30;
  /** Schema v6 (docs/30 §13.6/§24.1) — 1 = onboarding antigo (sem nivelamento oferecido), 2 = fluxo novo. */
  onboardingVersion: number;
  /** true quando o storage já tem uma versão MAIOR que a que este app conhece. */
  futureVersion: boolean;
}

/**
 * Calcula os campos aditivos a partir do que já existe no storage (se algo
 * existir). Nunca reduz um `schemaVersion` já maior que o conhecido por
 * este app — versão futura não é sobrescrita por versão antiga (docs/20
 * §15.3, item 10). `hoje` (YYYY-MM-DD local) é injetado pelo chamador
 * (`store.ts#load()` passa `hojeISO()`) — nunca calculado aqui com
 * `toISOString()`/UTC (mesma regra do resto do projeto).
 */
export function computeAdditiveFields(parsed: Record<string, unknown> | null, hoje: string): AdditiveFields {
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
      // Schema v6 (docs/30 §21.1, Fase 4 do docs/31) — todos aditivos, vazios até as Fases 5/12/13 popularem de verdade.
      skillModel: recordOr(learningRaw.skillModel, vazio.skillModel),
      journey: parseJourney(learningRaw.journey),
      placement: parsePlacement(learningRaw.placement),
      focusSession: parseFocusSession(learningRaw.focusSession, hoje),
      events: arrayOr<LearningEvent>(learningRaw.events, vazio.events).slice(-300),
      modelMeta: recordOr(learningRaw.modelMeta, vazio.modelMeta),
    },
    examTargets: arrayOr<ExamTarget>(prefs.examTargets, []),
    showExamTips: typeof prefs.showExamTips === "boolean" ? prefs.showExamTips : true,
    activityDaysSinceFreezeAward: numberOr(progress.activityDaysSinceFreezeAward, 0),
    completedBlockIds: arrayOr<string>(today.completedBlockIds, []),
    trailSubjectId: typeof prefs.trailSubjectId === "string" ? prefs.trailSubjectId : null,
    studyFocus: parseStudyFocus(prefs.studyFocus),
    easySubjects: arrayOr<string>(prefs.easySubjects, []),
    dailyMinutes: MINUTOS_VALIDOS.has(prefs.dailyMinutes as number)
      ? (prefs.dailyMinutes as 5 | 10 | 15 | 20 | 30)
      : dailyMinutesDe(prefs.dailyLessons),
    // Quem já tinha `onboarded: true` num storage sem `onboardingVersion` é
    // usuário do fluxo ANTIGO (docs/30 §13.6/§24.1) — ganha o card de oferta
    // de nivelamento na home; usuário realmente novo já nasce em "2".
    onboardingVersion: numberOr(prefs.onboardingVersion, parsed?.onboarded === true ? 1 : 2),
    futureVersion,
  };
}
