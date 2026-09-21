import { useMemo } from "react";
import type { FindErrorExercise } from "@/lib/lessons/types";
import { cn } from "@/lib/utils";
import type { ExerciseViewProps } from "./shared";

export function FindErrorView({
  exercise,
  answer,
  onAnswer,
  checked,
}: ExerciseViewProps<FindErrorExercise>) {
  const palavras = useMemo(() => exercise.frase.trim().split(/\s+/), [exercise.frase]);

  return (
    <div className="space-y-4">
      <p className="font-display text-lg font-bold leading-snug text-abismo">
        {exercise.instrucao ?? "Toque na palavra com problema"}
      </p>
      <p className="flex flex-wrap gap-x-1.5 gap-y-2 rounded-xl border-2 border-gelo bg-cards px-4 py-4 text-[17px] leading-relaxed text-abismo">
        {palavras.map((palavra, i) => {
          const selected = answer === i;
          const isTheError = i === exercise.erroIndex;
          return (
            <button
              key={i}
              disabled={checked}
              onClick={() => onAnswer(selected ? null : i)}
              className={cn(
                "rounded-md px-1 py-0.5 transition-all duration-150",
                !checked && "hover:bg-mar/8 active:scale-95",
                !checked &&
                  selected &&
                  "bg-mar/12 font-bold text-mar-fundo underline decoration-mar decoration-2 underline-offset-4",
                checked && isTheError && "bg-success/15 font-bold text-abismo",
                checked && selected && !isTheError && "bg-error/15 text-abismo line-through",
                checked && "cursor-default",
              )}
            >
              {palavra}
            </button>
          );
        })}
      </p>
    </div>
  );
}
