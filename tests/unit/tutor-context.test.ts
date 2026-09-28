import { describe, expect, test } from "bun:test";
import { buildPedagogicalContext } from "@/lib/tutor-context";
import { updateSkill } from "@/lib/adaptive/model";
import type { Attempt, LearningState } from "@/lib/learning/types";

/**
 * Contexto pedagógico do tutor (docs/30 §17, Fase 7 T-7.3).
 */

function learningBase(overrides: Partial<LearningState> = {}): Pick<
  LearningState,
  "skillModel" | "skillEvidence" | "reviewSchedule" | "recentAttempts"
> {
  return {
    skillModel: {},
    skillEvidence: {},
    reviewSchedule: {},
    recentAttempts: [],
    ...overrides,
  };
}

function attempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: "at-1",
    sessionId: null,
    exerciseId: "mc:porcentagem-valor:pratica-2",
    exerciseVersion: 1,
    skillIds: ["mat:porcentagem-valor"],
    role: "pratica",
    answer: 0,
    correct: false,
    hintUsed: false,
    tutorUsed: false,
    firstSubmission: true,
    submittedAt: "2026-09-24T10:00:00.000Z",
    localDate: "2026-09-24",
    durationMs: 3000,
    ...overrides,
  };
}

describe("buildPedagogicalContext", () => {
  test("item sem habilidade na taxonomia devolve null (não trava o balão)", () => {
    const ctx = buildPedagogicalContext(learningBase(), [], "id-que-nao-existe", "duvida", "2026-09-24");
    expect(ctx).toBeNull();
  });

  test("preenche matéria/tema/habilidade a partir do item em foco", () => {
    const ctx = buildPedagogicalContext(
      learningBase(),
      [],
      "mc:porcentagem-valor:pratica-2",
      "duvida",
      "2026-09-24",
    );
    expect(ctx?.skillName).toBeTruthy();
    expect(ctx?.subjectName).toBe("Matemática");
    expect(ctx?.topicName).toBe("Porcentagem");
    expect(ctx?.mode).toBe("duvida");
  });

  test("sem nenhuma evidência, mastery vem null e confidence 'ainda medindo'", () => {
    const ctx = buildPedagogicalContext(
      learningBase(),
      [],
      "mc:porcentagem-valor:pratica-2",
      "duvida",
      "2026-09-24",
    );
    expect(ctx?.mastery).toBeNull();
    expect(ctx?.confidenceLabel).toBe("ainda medindo");
  });

  test("pré-requisito sem modelo (mastery ~50, confidence 0) entra em weakPrerequisites", () => {
    // mat:porcentagem-valor tem mat:porcentagem-conceito como pré-requisito (src/content/taxonomy/skills/mat.ts).
    const ctx = buildPedagogicalContext(
      learningBase(),
      [],
      "mc:porcentagem-valor:pratica-2",
      "duvida",
      "2026-09-24",
    );
    expect(ctx?.weakPrerequisites.length).toBeGreaterThan(0);
  });

  test("erros recentes da MESMA habilidade entram, excluindo o item atual e limitados a 2", () => {
    const erro1 = attempt({ id: "e1", exerciseId: "mc:porcentagem-valor:pratica-3", correct: false });
    const erro2 = attempt({ id: "e2", exerciseId: "mc:porcentagem-valor:desafio", correct: false });
    const erro3 = attempt({ id: "e3", exerciseId: "mc:porcentagem-valor:pratica-2", correct: false }); // é o item atual — excluído
    const acerto = attempt({ id: "e4", exerciseId: "mc:porcentagem-valor:revisao-2", correct: true }); // acerto — excluído
    const ctx = buildPedagogicalContext(
      learningBase({ recentAttempts: [erro1, erro2, erro3, acerto] }),
      [],
      "mc:porcentagem-valor:pratica-2",
      "duvida",
      "2026-09-24",
    );
    expect(ctx?.recentErrors.length).toBe(2);
  });

  test("dontKnowRecent vem do skillModel da habilidade em foco", () => {
    const entry = updateSkill(
      undefined,
      "mat:porcentagem-valor",
      { role: "pratica", correct: false, response: "dont-know" },
      { a: 1, b: 0, c: 0.2, source: "estimado" },
      "2026-09-24",
      { difficulty: 2, now: "2026-09-24T10:00:00.000Z" },
    );
    const ctx = buildPedagogicalContext(
      learningBase({ skillModel: { "mat:porcentagem-valor": entry } }),
      [],
      "mc:porcentagem-valor:pratica-2",
      "duvida",
      "2026-09-24",
    );
    expect(ctx?.dontKnowRecent).toBeGreaterThan(0);
  });

  test("explanationSeen reflete o helpLevel da última tentativa desse MESMO item", () => {
    const tentativaAnterior = attempt({
      id: "prev",
      exerciseId: "mc:porcentagem-valor:pratica-2",
      helpLevel: 2,
      submittedAt: "2026-09-24T09:00:00.000Z",
    });
    const ctx = buildPedagogicalContext(
      learningBase({ recentAttempts: [tentativaAnterior] }),
      [],
      "mc:porcentagem-valor:pratica-2",
      "duvida",
      "2026-09-24",
    );
    expect(ctx?.explanationSeen).toBe("detalhada");
  });

  test("examName vem do primeiro examTarget, ou null sem nenhum", () => {
    const comExame = buildPedagogicalContext(
      learningBase(),
      [{ examId: "enem" }],
      "mc:porcentagem-valor:pratica-2",
      "duvida",
      "2026-09-24",
    );
    expect(comExame?.examName).toBe("ENEM");
    const semExame = buildPedagogicalContext(
      learningBase(),
      [],
      "mc:porcentagem-valor:pratica-2",
      "duvida",
      "2026-09-24",
    );
    expect(semExame?.examName).toBeNull();
  });

  test("mode 'ensinar-do-zero' é preservado no retorno", () => {
    const ctx = buildPedagogicalContext(
      learningBase(),
      [],
      "mc:porcentagem-valor:pratica-2",
      "ensinar-do-zero",
      "2026-09-24",
    );
    expect(ctx?.mode).toBe("ensinar-do-zero");
  });
});
