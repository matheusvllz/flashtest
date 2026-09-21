import type { MultipleChoiceExercise } from "@/lib/lessons/types";
import { choiceClasses, type ExerciseViewProps } from "./shared";

export function MultipleChoiceView({
  exercise,
  answer,
  onAnswer,
  checked,
}: ExerciseViewProps<MultipleChoiceExercise>) {
  return (
    <div className="space-y-4">
      <p className="font-display text-lg font-bold leading-snug text-abismo">{exercise.pergunta}</p>
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
