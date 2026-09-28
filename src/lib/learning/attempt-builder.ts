import type { Attempt, AttemptRole } from "./types";

/**
 * Monta um `Attempt` completo a partir do que cada player já sabe (docs/30
 * §7.3/§21.1, Fase 6 do docs/31) — construtor ÚNICO usado pelas 3 superfícies
 * (microlição, `/study`, lição legada) pra não duplicar a lógica de duração/
 * assistência/"não sei" três vezes. De propósito SEM import de conteúdo
 * (`@/content/*`): quem chama já resolveu `skillIds`/dificuldade (via
 * `itemMetaOf`, cada um no seu próprio módulo já content-aware) e passa
 * pronto — mantém este arquivo puro e barato de importar em qualquer lugar.
 */

const DURACAO_MAX_MS = 600_000; // 10 min — aluno que sai e volta não vira uma duração absurda (docs/30 §21.1).

export interface BuildAttemptParams {
  id: string;
  sessionId: string | null;
  exerciseId: string;
  exerciseVersion: number;
  subjectId?: string;
  topicId?: string;
  skillIds: string[];
  role: AttemptRole;
  answer: unknown;
  presentedOrder?: string[];
  correct: boolean;
  /** `"dont-know"` força `correct: false` independente do que veio em `correct` (docs/30 §16.1). */
  response?: "answered" | "dont-know";
  /** Dica/tutor pedidos ANTES de responder (docs/30 §9.4: tentativa assistida). */
  hintUsed?: boolean;
  tutorUsed?: boolean;
  firstSubmission: boolean;
  /** `Date.now()` de quando a questão apareceu — usado só pra calcular `durationMs`. */
  startedAtMs: number;
  /** Injetável pra teste determinístico; default `Date.now()`. */
  nowMs?: number;
  /** `YYYY-MM-DD` local — o chamador já tem via `hojeISO()` (docs/20 §12.1). */
  localDate: string;
  itemDifficulty?: 1 | 2 | 3 | 4 | 5;
  source: NonNullable<Attempt["source"]>;
}

export function buildAttempt(p: BuildAttemptParams): Attempt {
  const now = p.nowMs ?? Date.now();
  const dontKnow = p.response === "dont-know";
  return {
    id: p.id,
    sessionId: p.sessionId,
    exerciseId: p.exerciseId,
    exerciseVersion: p.exerciseVersion,
    subjectId: p.subjectId,
    topicId: p.topicId,
    skillIds: p.skillIds,
    role: p.role,
    answer: p.answer,
    presentedOrder: p.presentedOrder,
    correct: dontKnow ? false : p.correct,
    hintUsed: p.hintUsed ?? false,
    tutorUsed: p.tutorUsed ?? false,
    firstSubmission: p.firstSubmission,
    submittedAt: new Date(now).toISOString(),
    localDate: p.localDate,
    durationMs: Math.max(0, Math.min(DURACAO_MAX_MS, now - p.startedAtMs)),
    response: p.response ?? "answered",
    helpLevel: 0,
    assisted: Boolean(p.hintUsed || p.tutorUsed),
    itemDifficulty: p.itemDifficulty,
    source: p.source,
  };
}
