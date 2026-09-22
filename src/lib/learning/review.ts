import type { Attempt, AttemptRole, ReviewScheduleEntry, SkillEvidenceEntry } from "./types";

/**
 * Agenda de revisão e evidência de consistência (docs/20 §13, Fase 7).
 * Funções puras — quem persiste é o chamador (`useLearningSession`/futura
 * integração), isto aqui não toca `store.ts`. Agenda de flashcards legada
 * (`progress.flashcardReviews`) tem fórmula própria e não é tocada por este
 * módulo (docs/20 §13: "não sobrescrever silenciosamente os registros de
 * flashcards legados").
 */

const INTERVALOS_DIAS = [1, 3, 7, 14] as const;
export type IntervaloDias = (typeof INTERVALOS_DIAS)[number];

/** Erro reinicia pro intervalo de 1 dia; acerto avança pro próximo intervalo da escada (docs/20 §13). */
export function proximoIntervalo(atual: IntervaloDias | undefined, acertou: boolean): IntervaloDias {
  if (!acertou) return 1;
  const idx = atual ? INTERVALOS_DIAS.indexOf(atual) : -1;
  const proximoIdx = Math.min(idx + 1, INTERVALOS_DIAS.length - 1);
  return INTERVALOS_DIAS[proximoIdx];
}

function addDiasISO(dataISO: string, dias: number): string {
  const d = new Date(`${dataISO}T00:00:00`);
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Recalcula a entrada da agenda para uma habilidade depois de uma tentativa de revisão elegível. */
export function scheduleReview(
  entryAtual: ReviewScheduleEntry | undefined,
  skillId: string,
  acertou: boolean,
  hojeISO: string,
): ReviewScheduleEntry {
  const intervalDays = proximoIntervalo(entryAtual?.intervalDays, acertou);
  return {
    skillId,
    intervalDays,
    dueDate: addDiasISO(hojeISO, intervalDays),
    lastResult: acertou ? "correct" : "incorrect",
  };
}

export function isReviewDue(entry: ReviewScheduleEntry, hojeISO: string): boolean {
  return entry.dueDate <= hojeISO;
}

/**
 * Uma tentativa conta como recuperação de 24h só se for role "revisao" E o
 * intervalo desde a última exposição à habilidade já tiver passado 24h reais
 * (docs/20 §13: "explicação imediata após erro não conta como recuperação
 * 24h depois" — não é sobre o role sozinho, é sobre o TEMPO decorrido).
 */
export function isEligibleReviewRecovery(
  role: AttemptRole,
  correct: boolean,
  horasDesdeUltimaExposicao: number,
): boolean {
  return role === "revisao" && correct && horasDesdeUltimaExposicao >= 24;
}

const EVIDENCIA_VAZIA = (skillId: string): SkillEvidenceEntry => ({
  skillId,
  distinctExerciseIds: [],
  distinctLocalDates: [],
  lastFiveCorrect: [],
  hasReviewCorrectAfter24h: false,
});

/**
 * Atualiza a evidência de uma habilidade a partir de UMA tentativa (docs/20
 * §13, critério A10). Checkpoint não conta (mede compreensão imediata, não
 * retenção); tentativa assistida (dica/tutor) não é evidência independente,
 * mas ainda pode contar como recuperação de revisão se o resultado em si
 * bater os critérios — não, na verdade: assistida nunca conta, ponto (ver
 * teste). Item repetido no mesmo dia não conta como segunda data distinta.
 */
export function updateSkillEvidence(
  entryAtual: SkillEvidenceEntry | undefined,
  skillId: string,
  tentativa: {
    exerciseId: string;
    correct: boolean;
    localDate: string;
    role: AttemptRole;
    assisted: boolean;
    isReviewRecovery: boolean;
  },
): SkillEvidenceEntry | undefined {
  // Checkpoint/assistida não geram evidência — devolve o que já existia SEM
  // materializar uma entrada vazia nova (evita escrever `skillEvidence[id]`
  // quando nada de fato mudou).
  if (tentativa.role === "checkpoint" || tentativa.assisted) return entryAtual;

  const base = entryAtual ?? EVIDENCIA_VAZIA(skillId);
  const distinctExerciseIds = base.distinctExerciseIds.includes(tentativa.exerciseId)
    ? base.distinctExerciseIds
    : [...base.distinctExerciseIds, tentativa.exerciseId];
  const distinctLocalDates = base.distinctLocalDates.includes(tentativa.localDate)
    ? base.distinctLocalDates
    : [...base.distinctLocalDates, tentativa.localDate];
  const lastFiveCorrect = [...base.lastFiveCorrect, tentativa.correct].slice(-5);
  const hasReviewCorrectAfter24h = base.hasReviewCorrectAfter24h || tentativa.isReviewRecovery;

  return { skillId, distinctExerciseIds, distinctLocalDates, lastFiveCorrect, hasReviewCorrectAfter24h };
}

export type SkillEvidenceState = "sem-evidencia" | "em-pratica" | "consistente";

/**
 * Estado de evidência honesto (docs/20 §13, critério A10): "consistente"
 * exige TODOS os critérios ao mesmo tempo — 5 exercícios distintos, 2 datas
 * distintas, 4 dos últimos 5 corretos, e pelo menos uma revisão correta
 * depois de 24h real. Faltando qualquer um, no máximo "em-pratica" — nunca
 * anunciar domínio por 1 acerto em 1 tentativa.
 */
export function skillEvidenceState(entry: SkillEvidenceEntry | undefined): SkillEvidenceState {
  if (!entry || entry.distinctExerciseIds.length === 0) return "sem-evidencia";

  const cincoDistintos = entry.distinctExerciseIds.length >= 5;
  const duasDatas = entry.distinctLocalDates.length >= 2;
  const ultimosCinco = entry.lastFiveCorrect.slice(-5);
  const quatroDeCinco = ultimosCinco.length >= 5 && ultimosCinco.filter(Boolean).length >= 4;

  if (cincoDistintos && duasDatas && quatroDeCinco && entry.hasReviewCorrectAfter24h) {
    return "consistente";
  }
  return "em-pratica";
}

/**
 * Registra uma tentativa completa: atualiza evidência e, se aplicável,
 * reagenda a revisão. Função pura de composição — não persiste nada sozinha.
 */
export function recordAttemptForSkill(params: {
  skillId: string;
  evidenceAtual: SkillEvidenceEntry | undefined;
  scheduleAtual: ReviewScheduleEntry | undefined;
  attempt: Pick<Attempt, "exerciseId" | "correct" | "localDate" | "role" | "hintUsed" | "tutorUsed">;
  horasDesdeUltimaExposicao: number;
  hojeISO: string;
}): { evidence: SkillEvidenceEntry | undefined; schedule: ReviewScheduleEntry | undefined } {
  const assisted = params.attempt.hintUsed || params.attempt.tutorUsed;
  const isReviewRecovery = isEligibleReviewRecovery(
    params.attempt.role,
    params.attempt.correct,
    params.horasDesdeUltimaExposicao,
  );

  const evidence = updateSkillEvidence(params.evidenceAtual, params.skillId, {
    exerciseId: params.attempt.exerciseId,
    correct: params.attempt.correct,
    localDate: params.attempt.localDate,
    role: params.attempt.role,
    assisted,
    isReviewRecovery,
  });

  const schedule =
    params.attempt.role === "revisao"
      ? scheduleReview(params.scheduleAtual, params.skillId, params.attempt.correct, params.hojeISO)
      : params.scheduleAtual;

  return { evidence, schedule };
}
