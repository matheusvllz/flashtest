import type { Exercise, ExerciseAnswer } from "@/lib/lessons/types";
import { cn } from "@/lib/utils";

/**
 * Contrato único de todo componente de exercício: o player é dono do estado
 * (resposta atual + verificado) e os componentes só renderizam e reportam.
 * Adicionar tipo novo = implementar isto + 1 linha no registry.
 */
export interface ExerciseViewProps<E extends Exercise = Exercise> {
  exercise: E;
  /** Resposta atual (null = nada selecionado). */
  answer: ExerciseAnswer | null;
  onAnswer: (a: ExerciseAnswer | null) => void;
  /** true após Verificar: revela certo/errado e trava a interação. */
  checked: boolean;
  /** Para 'ordenar'/'parear': itens na ordem exibida (embaralhada pelo player). */
  shownBlocks?: string[];
}

/**
 * Estilo compartilhado das opções "tocáveis". Navy para seleção, e as cores de
 * feedback SÓ aparecem depois de verificar — verde/vermelho são reservados a
 * certo/errado, nunca decorativos (design system Flash Test).
 */
export function choiceClasses(state: {
  selected: boolean;
  checked: boolean;
  isCorrect: boolean;
  isWrongPick: boolean;
}): string {
  return cn(
    "w-full rounded-xl border-2 px-4 py-3 text-left text-[15px] leading-snug transition-all duration-150",
    !state.checked && "border-mist bg-white text-slate active:scale-[0.99] hover:border-navy/40",
    !state.checked && state.selected && "border-navy bg-navy/[0.06] font-semibold text-navy",
    state.checked && state.isCorrect && "border-success bg-success/10 font-semibold text-navy",
    state.checked && state.isWrongPick && "border-error bg-error/10 text-navy",
    state.checked && !state.isCorrect && !state.isWrongPick && "border-mist bg-white opacity-45",
    state.checked && "cursor-default",
  );
}
