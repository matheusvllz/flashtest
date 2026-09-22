import { beforeEach, describe, expect, test } from "bun:test";
import { getState, recordLearningAttempt, reset } from "@/lib/store";
import type { Attempt } from "@/lib/learning/types";

/**
 * Fase 7, item 1/3 (docs/20 §14.1): tentativa registrada atualiza evidência
 * da habilidade numa transação única, sem duplicar em `recentAttempts`.
 * Roda em memória (sem `window`/`localStorage`) — `setState`/`getState`
 * funcionam puramente sobre o estado do módulo mesmo em teste.
 */
function tentativaBase(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: "at-1",
    sessionId: "ls-1",
    exerciseId: "mc:x:checkpoint",
    exerciseVersion: 1,
    subjectId: "mat",
    topicId: "porc",
    skillIds: ["mat:porcentagem-valor"],
    role: "pratica",
    answer: 1,
    correct: true,
    hintUsed: false,
    tutorUsed: false,
    firstSubmission: true,
    submittedAt: "2026-09-21T10:00:00.000Z",
    localDate: "2026-09-21",
    durationMs: 0,
    ...overrides,
  };
}

describe("recordLearningAttempt", () => {
  beforeEach(() => reset());

  test("empilha a tentativa em recentAttempts", () => {
    recordLearningAttempt(tentativaBase());
    expect(getState().learning.recentAttempts).toHaveLength(1);
  });

  test("checkpoint não gera evidência pra habilidade nenhuma", () => {
    recordLearningAttempt(tentativaBase({ role: "checkpoint" }));
    expect(getState().learning.skillEvidence["mat:porcentagem-valor"]).toBeUndefined();
  });

  test("prática gera evidência com o exerciseId registrado", () => {
    recordLearningAttempt(tentativaBase({ role: "pratica" }));
    const evidencia = getState().learning.skillEvidence["mat:porcentagem-valor"];
    expect(evidencia?.distinctExerciseIds).toEqual(["mc:x:checkpoint"]);
  });

  test("role 'revisao' cria/atualiza a agenda da habilidade", () => {
    recordLearningAttempt(tentativaBase({ role: "revisao", correct: true }));
    const agenda = getState().learning.reviewSchedule["mat:porcentagem-valor"];
    expect(agenda?.dueDate).toBe("2026-09-22");
  });

  test("habilidade sem tentativa anterior conta horas desde a exposição como infinito -> conta se for revisão de verdade", () => {
    // Não há tentativa anterior na mesma skill: `horasDesdeUltimaExposicao`
    // vira Infinity, então uma 1ª tentativa de papel "revisao" JÁ conta como
    // recuperação de 24h (não faz sentido penalizar a primeira exposição).
    recordLearningAttempt(tentativaBase({ role: "revisao", correct: true }));
    const evidencia = getState().learning.skillEvidence["mat:porcentagem-valor"];
    expect(evidencia?.hasReviewCorrectAfter24h).toBe(true);
  });

  test("duas tentativas da mesma skill no mesmo instante não contam como recuperação de 24h", () => {
    recordLearningAttempt(tentativaBase({ id: "at-1", role: "pratica", submittedAt: "2026-09-21T10:00:00.000Z" }));
    recordLearningAttempt(
      tentativaBase({ id: "at-2", role: "revisao", correct: true, submittedAt: "2026-09-21T10:00:01.000Z" }),
    );
    const evidencia = getState().learning.skillEvidence["mat:porcentagem-valor"];
    expect(evidencia?.hasReviewCorrectAfter24h).toBe(false);
  });
});
