import { describe, expect, test } from "bun:test";
import { classifySkill, prerequisiteSatisfied } from "@/lib/adaptive/classify";
import { updateSkill } from "@/lib/adaptive/model";
import { SKILL_MAP } from "@/content/taxonomy";
import type { Attempt, LearningState } from "@/lib/learning/types";

/**
 * Classificação de habilidade (docs/30 §11.2, Fase 8 F8.2).
 */

const skill = SKILL_MAP["mat:porcentagem-valor"]; // prerequisites: ["mat:porcentagem-conceito"]
const prereq = SKILL_MAP["mat:porcentagem-conceito"];

function learningBase(overrides: Partial<LearningState> = {}): Pick<
  LearningState,
  "skillModel" | "skillEvidence" | "reviewSchedule" | "completedLessons" | "recentAttempts"
> {
  return {
    skillModel: {},
    skillEvidence: {},
    reviewSchedule: {},
    completedLessons: {},
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
    skillIds: [skill.id],
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

const opts = { temConteudo: true, aulaConcluida: false, prereqsSatisfeitos: true };

describe("classifySkill", () => {
  test("planejado ou sem conteúdo → IGNORAR", () => {
    const planejado = { ...skill, status: "planejado" as const };
    expect(classifySkill(planejado, learningBase(), "2026-09-24", opts).state).toBe("IGNORAR");
    expect(classifySkill(skill, learningBase(), "2026-09-24", { ...opts, temConteudo: false }).state).toBe("IGNORAR");
  });

  test("pré-requisito não satisfeito → BLOQUEADA", () => {
    const r = classifySkill(skill, learningBase(), "2026-09-24", { ...opts, prereqsSatisfeitos: false });
    expect(r.state).toBe("BLOQUEADA");
  });

  test("sem evidência e aula não concluída → NOVA", () => {
    const r = classifySkill(skill, learningBase(), "2026-09-24", opts);
    expect(r.state).toBe("NOVA");
  });

  test("sem evidência mas aula concluída → não é NOVA (segue pra baixo, vira EM_APRENDIZADO)", () => {
    const r = classifySkill(skill, learningBase(), "2026-09-24", { ...opts, aulaConcluida: true });
    expect(r.state).not.toBe("NOVA");
  });

  test("2 erros distintos em 7 dias → REFORCO", () => {
    const attempts = [
      attempt({ id: "e1", exerciseId: "ex-a", correct: false, localDate: "2026-09-22" }),
      attempt({ id: "e2", exerciseId: "ex-b", correct: false, localDate: "2026-09-23" }),
    ];
    const r = classifySkill(skill, learningBase({ recentAttempts: attempts }), "2026-09-24", {
      ...opts,
      aulaConcluida: true,
    });
    expect(r.state).toBe("REFORCO");
    expect(r.reasons).toContain("erros-distintos");
  });

  test("erros fora da janela de 7 dias não contam", () => {
    const attempts = [
      attempt({ id: "e1", exerciseId: "ex-a", correct: false, localDate: "2026-09-01" }),
      attempt({ id: "e2", exerciseId: "ex-b", correct: false, localDate: "2026-09-02" }),
    ];
    const r = classifySkill(skill, learningBase({ recentAttempts: attempts }), "2026-09-24", {
      ...opts,
      aulaConcluida: true,
    });
    expect(r.state).not.toBe("REFORCO");
  });

  test("dontKnowRecent >= 2 → REFORCO", () => {
    const entry = updateSkill(
      undefined,
      skill.id,
      { role: "pratica", correct: false, response: "dont-know" },
      { a: 1, b: 0, c: 0.2, source: "estimado" },
      "2026-09-24",
      { now: "2026-09-24T10:00:00.000Z" },
    );
    const entry2 = updateSkill(
      entry,
      skill.id,
      { role: "pratica", correct: false, response: "dont-know" },
      { a: 1, b: 0, c: 0.2, source: "estimado" },
      "2026-09-24",
      { now: "2026-09-24T11:00:00.000Z" },
    );
    expect(entry2.dontKnowRecent).toBeGreaterThanOrEqual(2);
    const r = classifySkill(
      skill,
      learningBase({ skillModel: { [skill.id]: entry2 } }),
      "2026-09-24",
      { ...opts, aulaConcluida: true },
    );
    expect(r.state).toBe("REFORCO");
    expect(r.reasons).toContain("nao-sei-recente");
  });

  test("revisão vencida (dueDate <= hoje) → DEVIDA", () => {
    const r = classifySkill(
      skill,
      learningBase({
        reviewSchedule: { [skill.id]: { skillId: skill.id, intervalDays: 3, dueDate: "2026-09-24", lastResult: "correct" } },
      }),
      "2026-09-24",
      { ...opts, aulaConcluida: true },
    );
    expect(r.state).toBe("DEVIDA");
    expect(r.due).toBe(true);
  });

  test("Mastery >= 75 e Confidence >= 50 → FIRME", () => {
    let entry = undefined;
    for (let i = 0; i < 8; i++) {
      entry = updateSkill(
        entry,
        skill.id,
        { role: "pratica", correct: true },
        { a: 1.2, b: -0.5, c: 0.2, source: "estimado" },
        `2026-09-${10 + i}`,
        { difficulty: 3, now: `2026-09-${10 + i}T10:00:00.000Z` },
      );
    }
    const evidence = {
      skillId: skill.id,
      distinctExerciseIds: ["a", "b", "c", "d", "e"],
      distinctLocalDates: ["2026-09-10", "2026-09-11", "2026-09-12"],
      lastFiveCorrect: [true, true, true, true, true],
      hasReviewCorrectAfter24h: true,
    };
    const r = classifySkill(
      skill,
      learningBase({ skillModel: { [skill.id]: entry! }, skillEvidence: { [skill.id]: evidence } }),
      "2026-09-18",
      { ...opts, aulaConcluida: true },
    );
    expect(r.state).toBe("FIRME");
  });

  test("nem NOVA, nem REFORCO, nem DEVIDA, nem FIRME → EM_APRENDIZADO", () => {
    const entry = updateSkill(
      undefined,
      skill.id,
      { role: "pratica", correct: true },
      { a: 1, b: 0, c: 0.2, source: "estimado" },
      "2026-09-24",
      { now: "2026-09-24T10:00:00.000Z" },
    );
    const r = classifySkill(
      skill,
      learningBase({ skillModel: { [skill.id]: entry } }),
      "2026-09-24",
      { ...opts, aulaConcluida: true },
    );
    expect(r.state).toBe("EM_APRENDIZADO");
  });
});

describe("prerequisiteSatisfied", () => {
  test("habilidade 'planejada' sempre satisfaz (não trava o resto)", () => {
    const planejado = { ...prereq, status: "planejado" as const };
    expect(prerequisiteSatisfied(planejado, learningBase(), [], "2026-09-24")).toBe(true);
  });

  test("aula da habilidade concluída satisfaz, mesmo sem Mastery/Confidence", () => {
    const ok = prerequisiteSatisfied(
      prereq,
      learningBase({
        completedLessons: { "aula-1": { version: 1, completedAt: "2026-09-20", stars: 3, bestPct: 100 } },
      }),
      ["aula-1"],
      "2026-09-24",
    );
    expect(ok).toBe(true);
  });

  test("sem aula concluída e sem evidência não satisfaz", () => {
    expect(prerequisiteSatisfied(prereq, learningBase(), [], "2026-09-24")).toBe(false);
  });

  test("Mastery >= 60 e Confidence >= 30 satisfaz mesmo sem aula concluída", () => {
    let entry = undefined;
    for (let i = 0; i < 5; i++) {
      entry = updateSkill(
        entry,
        prereq.id,
        { role: "pratica", correct: true },
        { a: 1.2, b: -0.3, c: 0.2, source: "estimado" },
        `2026-09-1${i}`,
        { difficulty: 2, now: `2026-09-1${i}T10:00:00.000Z` },
      );
    }
    const evidence = {
      skillId: prereq.id,
      distinctExerciseIds: ["a", "b", "c"],
      distinctLocalDates: ["2026-09-10", "2026-09-11"],
      lastFiveCorrect: [true, true, true],
      hasReviewCorrectAfter24h: false,
    };
    const ok = prerequisiteSatisfied(
      prereq,
      learningBase({ skillModel: { [prereq.id]: entry! }, skillEvidence: { [prereq.id]: evidence } }),
      [],
      "2026-09-16",
    );
    expect(ok).toBe(true);
  });
});
