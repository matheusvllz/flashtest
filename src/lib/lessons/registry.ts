/**
 * Motor de Lições — registry: mapeia o `type` do exercício pro componente
 * React que o renderiza. Tipo de questão novo no futuro = 1 componente novo
 * + 1 linha aqui. Nenhum if/else de tipo espalhado pelo app.
 */

import type { ComponentType } from "react";
import { MultipleChoiceView } from "@/components/lessons/exercises/MultipleChoice";
import { FindErrorView } from "@/components/lessons/exercises/FindError";
import { FillBlankView } from "@/components/lessons/exercises/FillBlank";
import { ReorderView } from "@/components/lessons/exercises/Reorder";
import { InterpretView } from "@/components/lessons/exercises/Interpret";
import { MatchPairsView } from "@/components/lessons/exercises/MatchPairs";
import { TrueFalseView } from "@/components/lessons/exercises/TrueFalse";
import type { ExerciseViewProps } from "@/components/lessons/exercises/shared";
import type { ExerciseType } from "./types";

const VIEWS = {
  "multipla-escolha": MultipleChoiceView,
  "encontre-o-erro": FindErrorView,
  "complete-lacuna": FillBlankView,
  ordenar: ReorderView,
  interpretacao: InterpretView,
  parear: MatchPairsView,
  "verdadeiro-falso": TrueFalseView,
} as const satisfies Record<ExerciseType, ComponentType<never>>;

/**
 * O player resolve o componente pelo discriminante e entrega o exercício
 * correspondente; o cast é seguro porque o mapa é indexado pelo próprio
 * `type` da union.
 */
export function exerciseViewFor(type: ExerciseType): ComponentType<ExerciseViewProps> {
  return VIEWS[type] as ComponentType<ExerciseViewProps>;
}
