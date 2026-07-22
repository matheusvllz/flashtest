import type { InterpretExercise } from "@/lib/lessons/types";
import { choiceClasses, type ExerciseViewProps } from "./shared";

export function InterpretView({
  exercise,
  answer,
  onAnswer,
  checked,
}: ExerciseViewProps<InterpretExercise>) {
  return (
    <div className="space-y-4">
      {/* Texto de apoio: barra gold à esquerda, o acento da marca marcando "leia isto primeiro". */}
      <div className="rounded-xl border-l-4 border-yellow bg-cloud px-4 py-3">
        <p className="text-[15px] leading-relaxed text-slate">{exercise.texto}</p>
        {exercise.fonte && (
          <p className="mt-2 text-[11px] font-semibold text-navy-2">{exercise.fonte}</p>
        )}
      </div>
      <p className="font-display text-lg font-bold leading-snug text-navy">{exercise.pergunta}</p>
      <div className="space-y-2.5" role="radiogroup" aria-label="Opções de resposta">
        {exercise.opcoes.map((opcao, i) => (
          <button
            key={i}
            role="radio"
            aria-checked={answer === i}
            disabled={checked}
            onClick={() => onAnswer(answer === i ? null : i)}
            className={choiceClasses({
              selected: answer === i,
              checked,
              isCorrect: checked && i === exercise.correta,
              isWrongPick: checked && answer === i && i !== exercise.correta,
            })}
          >
            {opcao}
          </button>
        ))}
      </div>
    </div>
  );
}
