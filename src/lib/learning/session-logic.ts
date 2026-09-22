import { shuffled } from "@/lib/lessons/define";
import type { Exercise, ExerciseAnswer } from "@/lib/lessons/types";
import { scoredQuestionSteps } from "./steps";
import type { LessonStep } from "./types";

/**
 * Funções puras do motor de passo-a-passo (docs/25 §7.3/§9/§18 T-08) — sem
 * React, sem leitura de estado global. `useLearningSession` só chama estas
 * funções e cuida de `useState`/refs/persistência (`salvar()`).
 */

/** Próximo índice em `steps`, ou `null` quando `stepIndex` já é o último passo (não há próximo — `recap` nunca avança por `next()`/`advance()`, só por `complete()`). */
export function nextStepIndex(steps: LessonStep[], stepIndex: number): number | null {
  const next = stepIndex + 1;
  return next < steps.length ? next : null;
}

/**
 * Resposta "completa" o bastante pra habilitar "Verificar" (docs/25 §9):
 * índice único (`number`) sempre completo quando presente; `ordenar` exige um
 * item por bloco; `parear` exige um item por par (mesma regra que
 * `LessonPlayer` já aplica via `answer === null` — array parcial conta como
 * incompleto, docs/20 §18). `null` nunca é completo.
 */
export function isAnswerComplete(exercise: Exercise, answer: ExerciseAnswer | null): boolean {
  if (answer === null) return false;
  if (typeof answer === "number") return true;
  if (exercise.type === "ordenar") return answer.length === exercise.blocos.length;
  if (exercise.type === "parear") return answer.length === exercise.pares.length;
  return false;
}

/**
 * Acertos/total entre as questões PONTUADAS (`role !== "checkpoint"`, docs/25
 * §6.6) — checkpoint nunca conta pra estrela/XP de conclusão (docs/20 §12).
 * `answers` é chaveado por `String(stepIndex)`, igual à sessão persistida.
 */
export function scoreOf(
  steps: LessonStep[],
  answers: Record<string, { correct: boolean } | undefined>,
): { correct: number; total: number } {
  const pontuadas = scoredQuestionSteps(steps);
  const correct = pontuadas.filter(({ stepIndex }) => answers[String(stepIndex)]?.correct).length;
  return { correct, total: pontuadas.length };
}

/** Reembaralha até 3x se sair idêntico ao original — mesma regra do `LessonPlayer` (docs/20 §18). */
function embaralharAteDiferente<T>(original: T[], shuffle: <U>(items: U[]) => U[]): T[] {
  let mix = shuffle(original);
  for (let tentativas = 0; tentativas < 3 && mix.every((item, i) => item === original[i]); tentativas++) {
    mix = shuffle(original);
  }
  return mix;
}

/**
 * Ordem apresentada pra `ordenar`/`parear` — os outros 5 tipos não têm ordem
 * apresentada (`undefined`, nada a persistir em `presentedOrders`).
 */
export function presentedOrderFor(
  exercise: Exercise,
  shuffle: <T>(items: T[]) => T[] = shuffled,
): string[] | undefined {
  if (exercise.type === "ordenar") return embaralharAteDiferente(exercise.blocos, shuffle);
  if (exercise.type === "parear") return embaralharAteDiferente(exercise.pares.map((p) => p.b), shuffle);
  return undefined;
}
