import { describe, expect, test } from "bun:test";
import { QUESTIONS } from "@/data/questions";
import { TRILHAS } from "@/content/trilhas";
import { EXERCISE_IDS, trilhaExerciseId } from "@/content/exercise-ids";
import { CURRICULUM } from "@/content/curriculum";
import { assertContentValid, validateCurriculum, validateExerciseIds } from "@/lib/learning/validate";
import { questionToExercise } from "@/lib/learning/adapters";
import { checkAnswer } from "@/lib/lessons/define";

describe("exercise-ids — identidade congelada (docs/20 §9/§14.1)", () => {
  test("toda questão do banco geral tem um id congelado igual ao seu próprio id", () => {
    for (const q of QUESTIONS) {
      expect(EXERCISE_IDS[q.id]).toEqual({ id: q.id, source: "banco-geral", version: 1 });
    }
  });

  test("todo exercício de toda lição tem um id congelado por lessonId:índice", () => {
    for (const trilha of TRILHAS) {
      for (const lesson of trilha.licoes) {
        lesson.exercicios.forEach((_, i) => {
          const id = trilhaExerciseId(lesson.id, i);
          expect(EXERCISE_IDS[id]).toEqual({ id, source: "trilha", version: 1 });
        });
      }
    }
  });

  test("nenhuma colisão entre id de banco geral e id de trilha", () => {
    const total = QUESTIONS.length + TRILHAS.flatMap((t) => t.licoes.flatMap((l) => l.exercicios)).length;
    expect(Object.keys(EXERCISE_IDS).length).toBe(total);
  });
});

describe("curriculum — validado, sem referência quebrada (docs/20 §14.1)", () => {
  test("o currículo real (SUBJECTS + TRILHAS) passa na validação sem nenhum issue", () => {
    expect(validateCurriculum(CURRICULUM)).toEqual([]);
  });

  test("detecta matéria duplicada", () => {
    const issues = validateCurriculum({
      subjects: [
        { id: "mat", name: "Matemática", topicIds: ["a"] },
        { id: "mat", name: "Matemática de novo", topicIds: ["b"] },
      ],
      trilhaIds: [],
    });
    expect(issues.some((i) => i.code === "subject-id-duplicado")).toBe(true);
  });

  test("detecta tópico duplicado dentro da mesma matéria", () => {
    const issues = validateCurriculum({
      subjects: [{ id: "mat", name: "Matemática", topicIds: ["a", "a"] }],
      trilhaIds: [],
    });
    expect(issues.some((i) => i.code === "topic-id-duplicado")).toBe(true);
  });

  test("assertContentValid não lança pro conteúdo real carregado", () => {
    expect(() => assertContentValid(CURRICULUM, EXERCISE_IDS)).not.toThrow();
  });

  test("validateExerciseIds detecta versão inválida", () => {
    const issues = validateExerciseIds({ x: { id: "x", source: "banco-geral", version: 0 } });
    expect(issues.some((i) => i.code === "exercise-id-versao-invalida")).toBe(true);
  });
});

describe("adapters — Question -> Exercise (docs/20 §14.1, item 3)", () => {
  test("toda questão do banco geral adapta sem lançar, e o gabarito bate com checkAnswer", () => {
    for (const q of QUESTIONS) {
      const exercicio = questionToExercise(q);
      expect(exercicio.type).toBe("multipla-escolha");
      // A alternativa correta original (pelo `key`) deve corresponder ao mesmo texto.
      const correta = q.alternatives.find((a) => a.key === q.correct)!;
      expect(exercicio.opcoes[exercicio.correta]).toBe(correta.text);
      expect(checkAnswer(exercicio, exercicio.correta)).toBe(true);
    }
  });

  test("gabarito que não bate com nenhuma alternativa lança em vez de adaptar errado", () => {
    const questaoQuebrada = {
      ...QUESTIONS[0],
      correct: "Z",
    };
    expect(() => questionToExercise(questaoQuebrada)).toThrow();
  });
});
