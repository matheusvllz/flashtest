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
 * Estilo compartilhado das opções "tocáveis" (docs/18 §7.10). Caneta (mar) para
 * seleção — nunca abismo, que é reservado a texto/contorno — e as cores de
 * feedback SÓ aparecem depois de verificar: verde/vermelho são reservados a
 * certo/errado, nunca decorativos (docs/09-branding.md §3, docs/18 §5).
 *
 * Usado tanto pelos exercícios de redação quanto por `/study` (aula de 60s) —
 * uma linguagem só nos dois pilares do produto.
 */
export function choiceClasses(state: {
  selected: boolean;
  checked: boolean;
  isCorrect: boolean;
  isWrongPick: boolean;
}): string {
  return cn(
    "w-full rounded-lg border-2 px-4 py-3.5 text-left text-[15px] leading-relaxed transition-all duration-100",
    !state.checked &&
      "border-gelo bg-cards text-abismo shadow-[0_3px_0_var(--color-gelo)] active:translate-y-[3px] active:shadow-none hover:border-mar/40",
    !state.checked &&
      state.selected &&
      "border-mar bg-mar/8 font-semibold text-abismo shadow-[0_3px_0_color-mix(in_srgb,var(--color-mar)_40%,transparent)]",
    state.checked &&
      state.isCorrect &&
      "border-success bg-success/10 font-semibold text-abismo shadow-none",
    state.checked && state.isWrongPick && "border-error bg-error/10 text-abismo shadow-none",
    // Neutra após validar: opacidade 1, só a cor muda — nunca esmaecer texto
    // já respondido (docs/20 §3 B4, §4.4, critério A5).
    state.checked &&
      !state.isCorrect &&
      !state.isWrongPick &&
      "border-gelo bg-cards text-abismo shadow-none",
    state.checked && "cursor-default",
  );
}

/**
 * Marcador circular A–E das alternativas de múltipla escolha (docs/18 §7.10).
 * 28px, mesma hierarquia de cor do `choiceClasses` acima.
 */
export function marcadorClasses(state: {
  selected: boolean;
  checked: boolean;
  isCorrect: boolean;
  isWrongPick: boolean;
}): string {
  return cn(
    "grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-xs font-bold",
    !state.checked && !state.selected && "bg-gelo text-abismo",
    !state.checked && state.selected && "bg-mar text-white",
    state.checked && state.isCorrect && "bg-success text-white",
    state.checked && state.isWrongPick && "bg-error text-white",
    state.checked && !state.isCorrect && !state.isWrongPick && "bg-gelo text-abismo",
  );
}
