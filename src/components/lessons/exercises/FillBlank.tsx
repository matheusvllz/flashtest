import type { FillBlankExercise } from "@/lib/lessons/types";
import { cn } from "@/lib/utils";
import type { ExerciseViewProps } from "./shared";

export function FillBlankView({
  exercise,
  answer,
  onAnswer,
  checked,
}: ExerciseViewProps<FillBlankExercise>) {
  const [antes, depois] = exercise.frase.split("___");
  const preenchido = typeof answer === "number" ? exercise.opcoes[answer] : null;
  const acertou = checked && answer === exercise.correta;

  return (
    <div className="space-y-4">
      <p className="font-display text-lg font-bold leading-snug text-navy">Complete a frase</p>
      <p className="rounded-xl border border-mist bg-white px-4 py-4 text-[17px] leading-relaxed text-slate">
        {antes}
        <span
          className={cn(
            "mx-1 inline-block min-w-[72px] rounded-md border-b-2 px-2 text-center align-baseline font-bold transition-colors",
            !preenchido && "border-dashed border-navy-2 text-transparent",
            preenchido && !checked && "border-navy bg-navy/10 text-navy",
            checked && acertou && "border-success bg-success/15 text-navy",
            checked && !acertou && "border-error bg-error/15 text-navy",
          )}
        >
          {preenchido ?? "____"}
        </span>
        {depois}
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Opções para a lacuna">
        {exercise.opcoes.map((opcao, i) => {
          const selected = answer === i;
          return (
            <button
              key={i}
              role="radio"
              aria-checked={selected}
              disabled={checked}
              onClick={() => onAnswer(selected ? null : i)}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-[15px] font-semibold transition-all duration-150",
                !checked && "active:scale-95 hover:border-navy/40",
                !checked && selected && "border-navy bg-navy/10 text-navy",
                !checked && !selected && "border-mist bg-white text-slate",
                checked && i === exercise.correta && "border-success bg-success/10 text-navy",
                checked &&
                  selected &&
                  i !== exercise.correta &&
                  "border-error bg-error/10 text-navy",
                checked && !selected && i !== exercise.correta && "border-mist bg-white opacity-45",
                checked && "cursor-default",
              )}
            >
              {opcao}
            </button>
          );
        })}
      </div>
    </div>
  );
}
