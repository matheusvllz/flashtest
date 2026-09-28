import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getState, recordLearningAttempt, reset } from "@/lib/store";
import { FEATURES } from "@/lib/features";
import type { Attempt } from "@/lib/learning/types";

/**
 * Integração em modo sombra (docs/30 §9.4/§21.1, Fase 5 T-5.5) —
 * `recordLearningAttempt` atualiza `skillModel` na MESMA transação só
 * quando a flag `masteryModel` não é `"off"`; desligada, comportamento
 * idêntico ao pré-Fase-5 (nenhum campo do modelo muda).
 */

/** Mesmo IRT que `src/content/items/meta/microlicoes.ts` atribui ao checkpoint de `mc:porcentagem-valor` (dificuldade 1). */
const META_CHECKPOINT = { irt: { a: 1.0, b: -1.6, c: 0.25 }, difficulty: 1 as const };

function tentativaBase(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: "at-1",
    sessionId: "ls-1",
    exerciseId: "mc:porcentagem-valor:checkpoint", // item real, classificado na Fase 3
    exerciseVersion: 1,
    subjectId: "mat",
    topicId: "porc",
    skillIds: ["mat:porcentagem-conceito"],
    role: "pratica",
    answer: 1,
    correct: true,
    hintUsed: false,
    tutorUsed: false,
    firstSubmission: true,
    submittedAt: "2026-09-21T10:00:00.000Z",
    localDate: "2026-09-21",
    durationMs: 3000,
    ...overrides,
  };
}

const flagOriginal = FEATURES.masteryModel;
beforeEach(() => {
  reset();
});
afterEach(() => {
  FEATURES.masteryModel = flagOriginal;
});

describe("recordLearningAttempt — flag 'off' (padrão)", () => {
  test("não grava nada em learning.skillModel mesmo com itemMeta passado", () => {
    FEATURES.masteryModel = "off";
    recordLearningAttempt(tentativaBase(), META_CHECKPOINT);
    expect(getState().learning.skillModel).toEqual({});
  });

  test("não grava predictedP na tentativa", () => {
    FEATURES.masteryModel = "off";
    recordLearningAttempt(tentativaBase(), META_CHECKPOINT);
    const salva = getState().learning.recentAttempts[0];
    expect(salva.predictedP).toBeUndefined();
  });
});

describe("recordLearningAttempt — flag 'shadow'/'on'", () => {
  test("atualiza evidência, agenda e modelo NA MESMA transação", () => {
    FEATURES.masteryModel = "shadow";
    recordLearningAttempt(tentativaBase(), META_CHECKPOINT);
    const s = getState();
    expect(s.learning.skillEvidence["mat:porcentagem-conceito"]).toBeDefined();
    expect(s.learning.reviewSchedule["mat:porcentagem-conceito"]).toBeDefined(); // 1º acerto independente cria agenda (Fase 5)
    expect(s.learning.skillModel["mat:porcentagem-conceito"]).toBeDefined();
    expect(s.learning.skillModel["mat:porcentagem-conceito"].nEff).toBeGreaterThan(0);
  });

  test("SEM itemMeta (chamador que ainda não foi atualizado), evidência/agenda gravam normal mas o modelo NÃO atualiza", () => {
    FEATURES.masteryModel = "shadow";
    recordLearningAttempt(tentativaBase()); // sem 2º argumento — mesmo caminho de um chamador antigo
    const s = getState();
    expect(s.learning.skillEvidence["mat:porcentagem-conceito"]).toBeDefined(); // evidência/agenda não dependem de itemMeta
    expect(s.learning.skillModel["mat:porcentagem-conceito"]).toBeUndefined(); // modelo, sim
  });

  test("habilidade secundária de um item multi-habilidade recebe peso menor (nEff menor)", () => {
    FEATURES.masteryModel = "shadow";
    recordLearningAttempt(
      tentativaBase({ skillIds: ["mat:porcentagem-conceito", "mat:porcentagem-valor"] }),
      META_CHECKPOINT,
    );
    const s = getState();
    const primaria = s.learning.skillModel["mat:porcentagem-conceito"].nEff;
    const secundaria = s.learning.skillModel["mat:porcentagem-valor"].nEff;
    expect(secundaria).toBeLessThan(primaria);
  });

  test("grava predictedP na tentativa (exceto quando 'não sei')", () => {
    FEATURES.masteryModel = "shadow";
    recordLearningAttempt(tentativaBase(), META_CHECKPOINT);
    expect(getState().learning.recentAttempts[0].predictedP).toBeGreaterThan(0);

    reset();
    recordLearningAttempt(tentativaBase({ response: "dont-know", correct: false }), META_CHECKPOINT);
    expect(getState().learning.recentAttempts[0].predictedP).toBeUndefined();
  });

  test("repetir o MESMO item no MESMO dia pesa menos que a primeira vez", () => {
    FEATURES.masteryModel = "shadow";
    recordLearningAttempt(tentativaBase({ id: "at-1", localDate: "2026-09-21" }), META_CHECKPOINT);
    const nEffApos1a = getState().learning.skillModel["mat:porcentagem-conceito"].nEff;
    recordLearningAttempt(tentativaBase({ id: "at-2", localDate: "2026-09-21" }), META_CHECKPOINT);
    const nEffApos2a = getState().learning.skillModel["mat:porcentagem-conceito"].nEff;
    // O incremento da 2ª (mesmo item, mesmo dia) é MENOR que o da 1ª.
    expect(nEffApos2a - nEffApos1a).toBeLessThan(nEffApos1a);
  });

  test("item sem nenhuma skillId não quebra nem atualiza modelo", () => {
    FEATURES.masteryModel = "shadow";
    recordLearningAttempt(tentativaBase({ skillIds: [] }), META_CHECKPOINT);
    expect(getState().learning.skillModel).toEqual({});
  });
});
