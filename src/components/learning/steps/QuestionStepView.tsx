import { FeedbackSheet } from "@/components/lessons/FeedbackSheet";
import { COPY } from "@/lib/copy";
import type { AnswerFeedback } from "@/lib/feedback/types";
import { exerciseViewFor } from "@/lib/lessons/registry";
import type { Exercise, ExerciseAnswer } from "@/lib/lessons/types";
import type { QuestionStep } from "@/lib/learning/types";

/**
 * Passo `question` (docs/25 §12.2/§18 T-10) — nunca mostra a Foca (docs/15
 * §4), exceto a que já vive dentro da `FeedbackSheet`. Sem lógica de estado —
 * `useLearningSession` decide tudo, este componente só renderiza o snapshot.
 */
export function QuestionStepView({
  step,
  exercise,
  answer,
  onAnswer,
  presentedOrder,
  feedback,
  canVerify,
  onVerify,
  onContinue,
  onAskTutor,
  isLast,
  questionNumber,
  questionTotal,
}: {
  step: QuestionStep;
  exercise: Exercise;
  answer: ExerciseAnswer | null;
  onAnswer: (a: ExerciseAnswer | null) => void;
  presentedOrder: string[] | undefined;
  feedback: AnswerFeedback | null;
  canVerify: boolean;
  onVerify: () => void;
  onContinue: () => void;
  onAskTutor: () => void;
  isLast: boolean;
  questionNumber: number;
  questionTotal: number;
}) {
  const View = exerciseViewFor(exercise.type);
  const checked = feedback !== null;

  return (
    <div className="space-y-4" aria-label={`Questão ${questionNumber} de ${questionTotal}`}>
      <p className="ds-label">{COPY.licao.roles[step.role]}</p>

      {exercise.imagem && (
        <figure>
          <img
            src={exercise.imagem.url}
            alt={exercise.imagem.alt}
            loading="lazy"
            className="mx-auto max-h-64 w-auto rounded-xl border-2 border-gelo bg-cards"
          />
          {exercise.imagem.credito && (
            <figcaption className="mt-1.5 text-center text-[11px] text-nevoa">
              {exercise.imagem.credito}
            </figcaption>
          )}
        </figure>
      )}

      <View
        exercise={exercise}
        answer={answer}
        onAnswer={onAnswer}
        checked={checked}
        shownBlocks={presentedOrder}
      />

      {!checked ? (
        // O `:disabled` da utility já cuida da opacidade — nada de
        // `opacity-40` manual por cima (docs/25 §18 T-10).
        <button className="btn-primary w-full" disabled={!canVerify} onClick={onVerify}>
          {COPY.licao.verificar}
        </button>
      ) : (
        feedback && (
          <FeedbackSheet
            feedback={feedback}
            isLast={isLast}
            onContinue={onContinue}
            onAskTutor={onAskTutor}
          />
        )
      )}
    </div>
  );
}
