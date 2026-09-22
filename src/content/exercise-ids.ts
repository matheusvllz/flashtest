import { QUESTIONS } from "@/data/questions";
import { TRILHAS } from "@/content/trilhas";

/**
 * Identidade congelada dos exercícios legados (docs/20 §9/§14.1, Fase 5).
 *
 * Não é uma tabela digitada à mão — seria trabalho mecânico sem valor e
 * arriscado a erro de transcrição para 1.263 itens. É uma FÓRMULA aplicada
 * sobre identificadores que já são estáveis no conteúdo real:
 * - Banco geral (`src/data/questions.ts`): o próprio `question.id` (`q1`, `q2`…).
 * - Trilhas (`src/content/trilhas/`): `${lesson.id}:${índice do exercício na lição}`.
 *   `lesson.id` é o slug autoral, não o título — já é estável hoje.
 *
 * "Congelado" quer dizer: reordenar exercícios DENTRO de uma lição ou renomear
 * `lesson.id` muda a identidade (docs/20 §9: "não recalcular identidade ao
 * reordenar ou renomear" é regra de processo para quem edita conteúdo, não
 * uma garantia que este arquivo impõe sozinho). Duplicar intencionalmente um
 * exercício deve reusar o MESMO ID gerado por outra lição — não há mecanismo
 * aqui para isso ainda; é um caso a tratar quando/se surgir.
 */

export type ExerciseSource = "banco-geral" | "trilha";

export interface StableExerciseId {
  id: string;
  source: ExerciseSource;
  /** Versão de conteúdo — incrementa em mudança editorial relevante (docs/20 §9). Tudo começa em 1: primeira congelação. */
  version: number;
}

const VERSAO_INICIAL = 1;

function congelarBancoGeral(): Record<string, StableExerciseId> {
  const mapa: Record<string, StableExerciseId> = {};
  for (const q of QUESTIONS) {
    mapa[q.id] = { id: q.id, source: "banco-geral", version: VERSAO_INICIAL };
  }
  return mapa;
}

function congelarTrilhas(): Record<string, StableExerciseId> {
  const mapa: Record<string, StableExerciseId> = {};
  for (const trilha of TRILHAS) {
    for (const lesson of trilha.licoes) {
      lesson.exercicios.forEach((_, index) => {
        const id = `${lesson.id}:${index}`;
        mapa[id] = { id, source: "trilha", version: VERSAO_INICIAL };
      });
    }
  }
  return mapa;
}

/** Mapa completo, calculado uma vez na carga do módulo. */
export const EXERCISE_IDS: Record<string, StableExerciseId> = {
  ...congelarBancoGeral(),
  ...congelarTrilhas(),
};

export function stableExerciseId(id: string): StableExerciseId | undefined {
  return EXERCISE_IDS[id];
}

/** ID de um exercício de trilha pela mesma fórmula usada em `focusFromExercise` (docs/20 §4.2.9). */
export function trilhaExerciseId(lessonId: string, exerciseIndex: number): string {
  return `${lessonId}:${exerciseIndex}`;
}
