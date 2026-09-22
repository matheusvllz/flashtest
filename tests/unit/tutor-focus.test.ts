import { describe, expect, test } from "bun:test";
import { focusFromExercise } from "@/lib/lessons/tutor-focus";
import type { MatchPairsExercise, ReorderExercise } from "@/lib/lessons/types";

/**
 * Cobre a correção do B2/§4.2 item 8 do docs/20: contexto do tutor para
 * respostas compostas (ordenar/parear) não pode dizer "não respondeu" quando
 * houve resposta, e o texto da escolha precisa refletir a ORDEM APRESENTADA.
 */
describe("focusFromExercise — respostas compostas", () => {
  const reorder: ReorderExercise = {
    type: "ordenar",
    blocos: ["O", "gato", "dorme"],
    explicacao: "Ordem correta: O gato dorme.",
  };

  test("ordenar: não respondido -> chosen null e answered false", () => {
    const focus = focusFromExercise(reorder, null, "lesson-1", "Título", "Trilha", 0, undefined, false);
    expect(focus.chosen).toBeNull();
    expect(focus.answered).toBe(false);
  });

  test("ordenar: respondido -> chosen reflete a ordem exibida, nunca null", () => {
    const shown = ["dorme", "O", "gato"]; // ordem embaralhada exibida ao aluno
    // Aluno monta na ordem shown[1], shown[2], shown[0] => "O gato dorme" (certo)
    const answer = [1, 2, 0];
    const focus = focusFromExercise(reorder, answer, "lesson-1", "Título", "Trilha", 0, shown, true);
    expect(focus.answered).toBe(true);
    expect(focus.chosen).toBe("O → gato → dorme");
    expect(focus.wasCorrect).toBe(true);
  });

  const matchPairs: MatchPairsExercise = {
    type: "parear",
    pares: [
      { a: "Cão", b: "Late" },
      { a: "Gato", b: "Mia" },
    ],
    explicacao: "Cada animal com seu som.",
  };

  test("parear: respondido errado -> chosen lista os pares formados, answered true", () => {
    const shown = ["Mia", "Late"]; // coluna B embaralhada
    // pares[0] (Cão) -> shown[0] "Mia" (errado); pares[1] (Gato) -> shown[1] "Late" (errado)
    const answer = [0, 1];
    const focus = focusFromExercise(
      matchPairs,
      answer,
      "lesson-2",
      "Título",
      "Trilha",
      1,
      shown,
      false,
    );
    expect(focus.answered).toBe(true);
    expect(focus.wasCorrect).toBe(false);
    expect(focus.chosen).toBe("Cão=Mia; Gato=Late");
  });

  test("ID usa lessonId estável, não o título editorial", () => {
    const focus = focusFromExercise(
      reorder,
      null,
      "id-estavel",
      "Título que pode mudar",
      "Trilha",
      3,
      undefined,
      false,
    );
    expect(focus.questionId).toBe("redacao:id-estavel:3");
  });
});
