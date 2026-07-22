/**
 * Ponte entre o motor de lições e o balão do tutor (SDD 12, D2+D3).
 *
 * O balão fala em `TutorFocus`, que nasceu no formato de questão de múltipla
 * escolha da aula de 60s. Aqui traduzimos qualquer um dos 7 tipos de exercício
 * da trilha para esse formato, para que **errar na redação abra a mesma IA**
 * que já explica o erro na aula — um tutor só, não dois.
 */

import type { TutorFocus } from "@/lib/tutor-prompt";
import type { Exercise, ExerciseAnswer } from "./types";

/** Enunciado legível de qualquer tipo de exercício. */
function statementOf(ex: Exercise): string {
  switch (ex.type) {
    case "multipla-escolha":
      return ex.pergunta;
    case "interpretacao":
      return `${ex.texto}\n\n${ex.pergunta}`;
    case "encontre-o-erro":
      return `${ex.instrucao ?? "Encontre a palavra com problema"}: "${ex.frase}"`;
    case "complete-lacuna":
      return `Complete a lacuna: "${ex.frase}"`;
    case "ordenar":
      return `${ex.instrucao ?? "Ordene os blocos"}: ${ex.blocos.join(" / ")}`;
    case "parear":
      return `${ex.instrucao ?? "Relacione as colunas"}: ${ex.pares.map((p) => `${p.a} ↔ ${p.b}`).join("; ")}`;
    case "verdadeiro-falso":
      return `Verdadeiro ou falso: "${ex.afirmacao}"`;
  }
}

/** Alternativas + gabarito, quando o tipo tem alternativas discretas. */
function optionsOf(ex: Exercise): {
  alternatives: { key: string; text: string }[];
  correct: string;
} {
  const letter = (i: number) => String.fromCharCode(65 + i);
  switch (ex.type) {
    case "multipla-escolha":
    case "interpretacao":
    case "complete-lacuna":
      return {
        alternatives: ex.opcoes.map((text, i) => ({ key: letter(i), text })),
        correct: letter(ex.correta),
      };
    case "verdadeiro-falso":
      return {
        alternatives: [
          { key: "A", text: "Verdadeiro" },
          { key: "B", text: "Falso" },
        ],
        correct: ex.verdadeiro ? "A" : "B",
      };
    case "encontre-o-erro": {
      const palavras = ex.frase.trim().split(/\s+/);
      return {
        alternatives: palavras.map((text, i) => ({ key: letter(i), text })),
        correct: letter(ex.erroIndex),
      };
    }
    // Ordenar e parear não têm alternativa única: a resposta certa é a ordem.
    case "ordenar":
      return { alternatives: [], correct: ex.blocos.join(" → ") };
    case "parear":
      return { alternatives: [], correct: ex.pares.map((p) => `${p.a}=${p.b}`).join("; ") };
  }
}

/** O que o aluno escolheu, em texto — `null` quando não é uma escolha única. */
function chosenOf(ex: Exercise, answer: ExerciseAnswer | null): string | null {
  if (answer === null || Array.isArray(answer)) return null;
  const letter = String.fromCharCode(65 + answer);
  switch (ex.type) {
    case "multipla-escolha":
    case "interpretacao":
    case "complete-lacuna":
    case "encontre-o-erro":
      return letter;
    case "verdadeiro-falso":
      return answer === 1 ? "A" : "B";
    default:
      return null;
  }
}

export function focusFromExercise(
  ex: Exercise,
  answer: ExerciseAnswer | null,
  lessonTitle: string,
  trilhaName: string,
  index: number,
): TutorFocus {
  const { alternatives, correct } = optionsOf(ex);
  return {
    questionId: `redacao:${lessonTitle}:${index}`,
    subjectName: "Redação",
    topic: `${trilhaName} · ${lessonTitle}`,
    statement: statementOf(ex),
    alternatives,
    correct,
    chosen: chosenOf(ex, answer),
    explanation: ex.explicacao,
    hint: ex.explicacao,
  };
}
