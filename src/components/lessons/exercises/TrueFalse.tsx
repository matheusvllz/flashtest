import { Check, X } from "lucide-react";
import type { TrueFalseExercise } from "@/lib/lessons/types";
import { cn } from "@/lib/utils";
import type { ExerciseViewProps } from "./shared";

/** Julgamento rápido: afirmação + dois botões grandes. Resposta: 1 = verdadeiro, 0 = falso. */
export function TrueFalseView({
  exercise,
  answer,
  onAnswer,
  checked,
}: ExerciseViewProps<TrueFalseExercise>) {
  const correctAnswer = exercise.verdadeiro ? 1 : 0;

  function option(value: 1 | 0, label: string, Icon: typeof Check) {
    const selected = answer === value;
    return (
      <button
        role="radio"
        aria-checked={selected}
        disabled={checked}
        onClick={() => onAnswer(selected ? null : value)}
        className={cn(
          "flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 px-4 py-6 font-display text-base font-bold transition-all duration-150",
          !checked && "active:scale-[0.97] hover:border-mar/40",
          !checked && selected && "border-mar bg-mar/8 text-abismo",
          !checked && !selected && "border-gelo bg-cards text-abismo",
          checked && value === correctAnswer && "border-success bg-success/10 text-abismo",
          checked && selected && value !== correctAnswer && "border-error bg-error/10 text-abismo",
          checked && !selected && value !== correctAnswer && "border-gelo bg-cards opacity-45",
          checked && "cursor-default",
        )}
      >
        <Icon size={26} strokeWidth={2.6} aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-display text-lg font-bold leading-snug text-abismo">
        Verdadeiro ou falso?
      </p>
      <p className="rounded-xl border-2 border-gelo bg-cards px-4 py-4 text-[17px] leading-relaxed text-abismo">
        {exercise.afirmacao}
      </p>
      <div className="flex gap-3" role="radiogroup" aria-label="Verdadeiro ou falso">
        {option(1, "Verdadeiro", Check)}
        {option(0, "Falso", X)}
      </div>
    </div>
  );
}
