import { describe, expect, test } from "bun:test";
import {
  activityReasonText,
  activityTitle,
  buildActivityLesson,
} from "@/lib/adaptive/activity-lesson";
import type { PlannedActivity } from "@/lib/adaptive/types";
import type { QuestionStep } from "@/lib/learning/types";

function questionSteps(lesson: { steps: Array<{ kind: string }> }): QuestionStep[] {
  return lesson.steps.filter((s): s is QuestionStep => s.kind === "question");
}

/**
 * Lição sintética de atividade (docs/30 §14.4, Fase 12 F12.2).
 */

function pratica(overrides: Partial<PlannedActivity> = {}): PlannedActivity {
  return {
    id: "atv-2026-09-24-abc123",
    kind: "pratica",
    skillIds: ["mat:porcentagem-conceito"],
    subjectId: "mat",
    estimatedMinutes: 2,
    reasons: ["consolidar"],
    score: 0.8,
    scoreBreakdown: {},
    ...overrides,
  };
}

describe("buildActivityLesson", () => {
  test("monta MicroLessonV2 com id prefixado, skillIds da atividade e questões ordenadas por dificuldade", () => {
    const lesson = buildActivityLesson(pratica(), ["q10", "q21"]);
    expect(lesson.id).toBe("atividade--atv-2026-09-24-abc123");
    expect(lesson.format).toBe(2);
    expect(lesson.skillIds).toEqual(["mat:porcentagem-conceito"]);
    const questions = questionSteps(lesson);
    expect(questions).toHaveLength(2);
    for (let i = 1; i < questions.length; i++) {
      expect(questions[i].difficulty).toBeGreaterThanOrEqual(questions[i - 1].difficulty);
    }
    expect(lesson.steps[0].kind).toBe("intro");
    expect(lesson.steps.at(-1)?.kind).toBe("recap");
  });

  test("papel da questão segue o tipo da atividade (revisão)", () => {
    const lesson = buildActivityLesson(pratica({ kind: "revisao" }), ["q10", "q21"]);
    expect(questionSteps(lesson).every((s) => s.role === "revisao")).toBe(true);
  });

  test("menos de 2 itens lança (nunca monta lição incompleta silenciosamente)", () => {
    expect(() => buildActivityLesson(pratica(), ["q10"])).toThrow();
    expect(() => buildActivityLesson(pratica(), [])).toThrow();
  });

  test("nunca grava chapterId de um capítulo real por acidente quando a habilidade não tem um mapeado", () => {
    // mat:funcao-afim-grafico não serve mais de exemplo aqui: ganhou aula gerada na Fase 11
    // (docs/30 §21.3) e passou a ter chapterId mapeado de verdade — achado real, este teste
    // quebrou ao publicar as primeiras aulas. mat:operacoes-fundamentais não tem aula nem
    // capítulo legado.
    const lesson = buildActivityLesson(pratica({ skillIds: ["mat:operacoes-fundamentais"] }), [
      "q10",
      "q21",
    ]);
    expect(lesson.chapterId.startsWith("atividade--")).toBe(true);
  });
});

describe("activityTitle", () => {
  test("atividade sem lição própria usa '{tipo} · {habilidade}'", () => {
    expect(activityTitle(pratica())).toBe("Prática · Entender porcentagem como fração de 100");
  });

  test("aula/legado com lessonId usa o título da lição real", () => {
    const titulo = activityTitle(pratica({ kind: "aula", lessonId: "porcentagem-valor" }));
    expect(titulo).toBe("O que é porcentagem");
  });
});

describe("activityReasonText", () => {
  test("usa o primeiro ReasonCode da atividade", () => {
    expect(activityReasonText(pratica({ reasons: ["desafio", "equilibrio-area"] }))).toContain(
      "firme",
    );
  });

  test("sem reasons cai no motivo de fallback, nunca lança", () => {
    expect(() => activityReasonText(pratica({ reasons: [] }))).not.toThrow();
  });
});
