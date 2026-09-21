import type { ReorderExercise } from "@/lib/lessons/types";
import { cn } from "@/lib/utils";
import type { ExerciseViewProps } from "./shared";

/**
 * Ordenar por TOQUE: tocar num bloco disponível adiciona à frase; tocar num
 * bloco da frase devolve pra bancada. Drag-and-drop foi descartado de
 * propósito (frágil no mobile, e a demo do pitch roda no celular).
 */
export function ReorderView({
  exercise,
  answer,
  onAnswer,
  checked,
  shownBlocks,
}: ExerciseViewProps<ReorderExercise>) {
  const blocks = shownBlocks ?? exercise.blocos;
  const sequence: number[] = Array.isArray(answer) ? answer : [];
  const acertou =
    checked &&
    sequence.length === exercise.blocos.length &&
    sequence.every((shownIdx, pos) => blocks[shownIdx] === exercise.blocos[pos]);

  function add(idx: number) {
    onAnswer([...sequence, idx]);
  }

  function removeAt(pos: number) {
    const next = sequence.filter((_, i) => i !== pos);
    onAnswer(next.length > 0 ? next : null);
  }

  return (
    <div className="space-y-4">
      <p className="font-display text-lg font-bold leading-snug text-abismo">
        {exercise.instrucao ?? "Toque nos blocos para montar a frase na ordem certa"}
      </p>

      {/* Área de montagem */}
      <div
        aria-label="Sua frase"
        className={cn(
          "flex min-h-[88px] flex-wrap content-start items-start gap-2 rounded-xl border-2 border-dashed px-3 py-3 transition-colors",
          !checked && "border-gelo bg-neve",
          checked && acertou && "border-success bg-success/[0.07]",
          checked && !acertou && "border-error bg-error/[0.07]",
        )}
      >
        {sequence.length === 0 && (
          <span className="px-1 py-2 text-sm text-nevoa">A frase montada aparece aqui.</span>
        )}
        {sequence.map((shownIdx, pos) => (
          <button
            key={`${shownIdx}-${pos}`}
            disabled={checked}
            onClick={() => removeAt(pos)}
            className={cn(
              "rounded-lg border-2 border-gelo bg-cards px-3 py-2 text-left text-[15px] text-abismo shadow-[0_2px_0_var(--color-gelo)] transition-all duration-150",
              !checked && "active:scale-95 hover:border-error/50",
              checked && "cursor-default",
            )}
          >
            {blocks[shownIdx]}
          </button>
        ))}
      </div>

      {/* Bancada de blocos disponíveis */}
      <div className="flex flex-wrap gap-2" aria-label="Blocos disponíveis">
        {blocks.map((bloco, idx) => {
          const used = sequence.includes(idx);
          return (
            <button
              key={idx}
              disabled={checked || used}
              onClick={() => add(idx)}
              className={cn(
                "rounded-lg border-2 px-3 py-2 text-left text-[15px] transition-all duration-150",
                used
                  ? "select-none border-transparent bg-gelo text-transparent"
                  : "border-gelo bg-cards text-abismo shadow-[0_2px_0_var(--color-gelo)] active:scale-95 hover:border-mar/40",
                checked && "cursor-default",
              )}
              aria-hidden={used}
            >
              {bloco}
            </button>
          );
        })}
      </div>
    </div>
  );
}
