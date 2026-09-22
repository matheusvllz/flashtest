import { describe, expect, test } from "bun:test";
import {
  isV2,
  nodeKindOf,
  questionSteps,
  scoredQuestionSteps,
  stageOfStep,
  stepsOf,
  teachingWordCount,
} from "@/lib/learning/steps";
import { MICROLICOES } from "@/content/microlicoes";
import type {
  LessonStep,
  MicroLessonV1,
  MicroLessonV2,
  QuestionStep,
} from "@/lib/learning/types";

/**
 * Testes de `stepsOf`/normalização (docs/25 §7.3, T-02) — v1 vira passos
 * numa ordem fixa, v2 ganha intro/recap só se faltarem, e os utilitários de
 * leitura de passos (`questionSteps`, `stageOfStep`, `nodeKindOf`,
 * `teachingWordCount`) fazem exatamente o que a tabela do §6.5 descreve.
 */

function v1Fixture(overrides: Partial<MicroLessonV1> = {}): MicroLessonV1 {
  return {
    id: "l1",
    version: 1,
    subjectId: "mat",
    topicId: "porc",
    chapterId: "mat-porcentagem",
    title: "Título da lição",
    objective: "Objetivo da lição",
    skillIds: ["mat:x"],
    prerequisiteLessonIds: [],
    examProfileIds: ["enem"],
    status: "reviewed",
    estimatedTeachingSeconds: 45,
    estimatedPracticeSeconds: 60,
    blocks: [
      { type: "concept", title: "Conceito", body: "Corpo do conceito." },
      { type: "concept", title: "Conceito 2", body: "Outro corpo." },
    ],
    checkpointExerciseId: "c1",
    practiceExerciseIds: ["p1", "p2"],
    reviewExerciseIds: ["r1", "r2"],
    recap: "Recap da lição.",
    sources: ["fonte"],
    reviewedAt: "2026-09-21",
    ...overrides,
  };
}

function v2Fixture(overrides: Partial<MicroLessonV2> = {}): MicroLessonV2 {
  const steps: LessonStep[] = overrides.steps ?? [
    { kind: "intro", title: "Título v2", body: "Objetivo v2" },
    { kind: "teach", block: { type: "concept", title: "Ensino", body: "Corpo." } },
    { kind: "question", exerciseId: "q1", role: "checkpoint", difficulty: 1 },
    { kind: "teach", block: { type: "concept", title: "Ensino 2", body: "Corpo 2." } },
    { kind: "question", exerciseId: "q2", role: "pratica", difficulty: 2 },
    { kind: "question", exerciseId: "q3", role: "pratica", difficulty: 2 },
    { kind: "question", exerciseId: "q4", role: "desafio", difficulty: 3 },
    { kind: "recap", body: "Recap v2" },
  ];
  return {
    id: "l2",
    version: 1,
    subjectId: "mat",
    topicId: "porc",
    chapterId: "mat-porcentagem",
    title: "Título v2",
    objective: "Objetivo v2",
    skillIds: ["mat:x"],
    prerequisiteLessonIds: [],
    examProfileIds: ["enem"],
    status: "reviewed",
    estimatedTeachingSeconds: 45,
    estimatedPracticeSeconds: 60,
    format: 2,
    reviewExerciseIds: ["r1", "r2"],
    recap: "Recap v2",
    sources: ["fonte"],
    reviewedAt: "2026-09-21",
    ...overrides,
    steps,
  };
}

describe("stepsOf — normalização v1 (docs/25 §7.3)", () => {
  test("devolve intro, todos os blocks como teach, checkpoint, práticas na ordem, recap", () => {
    const lesson = v1Fixture();
    const steps = stepsOf(lesson);
    expect(steps.map((s) => s.kind)).toEqual([
      "intro",
      "teach",
      "teach",
      "question",
      "question",
      "question",
      "recap",
    ]);
    expect(steps[0]).toEqual({ kind: "intro", title: lesson.title, body: lesson.objective });
    expect((steps[3] as QuestionStep).role).toBe("checkpoint");
    expect((steps[3] as QuestionStep).difficulty).toBe(1);
    expect((steps[3] as QuestionStep).exerciseId).toBe("c1");
    expect((steps[4] as QuestionStep).role).toBe("pratica");
    expect((steps[4] as QuestionStep).exerciseId).toBe("p1");
    expect((steps[5] as QuestionStep).role).toBe("pratica");
    expect((steps[5] as QuestionStep).exerciseId).toBe("p2");
    expect(steps[6]).toEqual({ kind: "recap", body: lesson.recap });
  });

  test("devolve uma cópia — mutar o resultado não afeta a lição original", () => {
    const lesson = v1Fixture();
    const steps = stepsOf(lesson);
    steps.push({ kind: "recap", body: "mutado" });
    expect(stepsOf(lesson).length).toBe(steps.length - 1);
  });
});

describe("stepsOf — v2 (docs/25 §7.3)", () => {
  test("v2 sem intro/recap ganha ambos, a partir de title/objective/recap", () => {
    const lesson = v2Fixture({
      steps: [
        { kind: "teach", block: { type: "concept", title: "X", body: "Y" } },
        { kind: "question", exerciseId: "q1", role: "checkpoint", difficulty: 1 },
      ],
    });
    const steps = stepsOf(lesson);
    expect(steps[0]).toEqual({ kind: "intro", title: lesson.title, body: lesson.objective });
    expect(steps[steps.length - 1]).toEqual({ kind: "recap", body: lesson.recap });
    expect(steps.length).toBe(4);
  });

  test("v2 com intro/recap já presentes não duplica", () => {
    const lesson = v2Fixture();
    const steps = stepsOf(lesson);
    expect(steps.filter((s) => s.kind === "intro").length).toBe(1);
    expect(steps.filter((s) => s.kind === "recap").length).toBe(1);
    expect(steps[0].kind).toBe("intro");
    expect(steps[steps.length - 1].kind).toBe("recap");
  });
});

describe("questionSteps / scoredQuestionSteps", () => {
  test("questionSteps encontra todas as questões com o índice certo", () => {
    const lesson = v1Fixture();
    const steps = stepsOf(lesson);
    const found = questionSteps(steps);
    expect(found.length).toBe(3);
    expect(found.map((f) => f.stepIndex)).toEqual([3, 4, 5]);
  });

  test("scoredQuestionSteps exclui o checkpoint", () => {
    const lesson = v1Fixture();
    const steps = stepsOf(lesson);
    const scored = scoredQuestionSteps(steps);
    expect(scored.length).toBe(2);
    expect(scored.every(({ step }) => step.role !== "checkpoint")).toBe(true);
  });
});

describe("stageOfStep — mapeia os 5 casos (docs/25 §7.3)", () => {
  test("intro/teach/tip -> teaching; question checkpoint -> checkpoint; question outros -> practice; recap -> recap", () => {
    expect(stageOfStep({ kind: "intro", title: "t", body: "b" })).toBe("teaching");
    expect(stageOfStep({ kind: "teach", block: { type: "concept", title: "t", body: "b" } })).toBe(
      "teaching",
    );
    expect(stageOfStep({ kind: "tip", body: "b" })).toBe("teaching");
    expect(stageOfStep({ kind: "question", exerciseId: "q1", role: "checkpoint", difficulty: 1 })).toBe(
      "checkpoint",
    );
    expect(stageOfStep({ kind: "question", exerciseId: "q1", role: "pratica", difficulty: 2 })).toBe(
      "practice",
    );
    expect(stageOfStep({ kind: "question", exerciseId: "q1", role: "desafio", difficulty: 3 })).toBe(
      "practice",
    );
    expect(stageOfStep({ kind: "question", exerciseId: "q1", role: "revisao", difficulty: 2 })).toBe(
      "practice",
    );
    expect(stageOfStep({ kind: "recap", body: "b" })).toBe("recap");
  });
});

describe("nodeKindOf (docs/25 §6.4/§7.3)", () => {
  test("v1 com blocks -> aula", () => {
    expect(nodeKindOf(v1Fixture())).toBe("aula");
  });

  test("v2 sem nenhum passo teach -> pratica", () => {
    const lesson = v2Fixture({
      steps: [
        { kind: "intro", title: "t", body: "b" },
        { kind: "question", exerciseId: "q1", role: "revisao", difficulty: 2 },
        { kind: "recap", body: "b" },
      ],
    });
    expect(nodeKindOf(lesson)).toBe("pratica");
  });

  test("id começando com 'revisao--' -> revisao, mesmo tendo teach", () => {
    const lesson = v2Fixture({ id: "revisao--mat-porcentagem" });
    expect(nodeKindOf(lesson)).toBe("revisao");
  });
});

describe("isV2", () => {
  test("distingue v1 de v2 pelo campo format", () => {
    expect(isV2(v1Fixture())).toBe(false);
    expect(isV2(v2Fixture())).toBe(true);
  });
});

describe("teachingWordCount — soma intro+teach+tip, ignora questões e recap (docs/25 §7.3)", () => {
  test("soma palavras de intro.body, textos do block em teach, e tip.body", () => {
    const steps: LessonStep[] = [
      { kind: "intro", title: "T", body: "uma frase com cinco palavras" }, // 5
      {
        kind: "teach",
        block: { type: "concept", title: "dois termos", body: "corpo com tres palavras" }, // 2 + 4 = 6
      },
      { kind: "question", exerciseId: "q1", role: "checkpoint", difficulty: 1 }, // ignorado
      { kind: "tip", body: "dica com tres palavras" }, // 4
      { kind: "recap", body: "recap nao conta" }, // ignorado
    ];
    // intro: "uma frase com cinco palavras" = 5
    // teach.title "dois termos" = 2, teach.body "corpo com tres palavras" = 4 -> 6
    // tip "dica com tres palavras" = 4
    expect(teachingWordCount(steps)).toBe(5 + 6 + 4);
  });

  test("ignora completamente lições sem nenhum passo de ensino", () => {
    const steps: LessonStep[] = [
      { kind: "question", exerciseId: "q1", role: "checkpoint", difficulty: 1 },
      { kind: "recap", body: "algo aqui" },
    ];
    expect(teachingWordCount(steps)).toBe(0);
  });
});

describe("stepsOf — catálogo piloto real (docs/25 §18 T-13, critério de aceite)", () => {
  test("cada uma das 6 lições v2 devolve 1 intro, >= 2 teach, 4-8 questions (1 checkpoint + resto), 1 recap, nessa ordem", () => {
    expect(MICROLICOES.length).toBe(6);
    for (const lesson of MICROLICOES) {
      const steps = stepsOf(lesson);
      expect(steps[0].kind).toBe("intro");
      expect(steps[steps.length - 1].kind).toBe("recap");

      const teachCount = steps.filter((s) => s.kind === "teach").length;
      expect(teachCount).toBeGreaterThanOrEqual(2);

      const questions = questionSteps(steps);
      expect(questions.length).toBeGreaterThanOrEqual(4);
      expect(questions.length).toBeLessThanOrEqual(8);
      expect(questions[0].step.role).toBe("checkpoint");
      expect(questions[0].step.difficulty).toBe(1);
      expect(questions[questions.length - 1].step.difficulty).toBeGreaterThanOrEqual(2);
    }
  });
});
