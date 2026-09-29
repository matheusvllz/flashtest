import { FeedbackSheet } from "@/components/lessons/FeedbackSheet";
import { DontKnowButton } from "@/components/learning/DontKnowButton";
import { ExplanationLayers, hasExplanationLayers } from "@/components/learning/ExplanationLayers";
import { COPY } from "@/lib/copy";
import type { AnswerFeedback } from "@/lib/feedback/types";
import { exerciseViewFor } from "@/lib/lessons/registry";
import type { Exercise, ExerciseAnswer } from "@/lib/lessons/types";
import type { QuestionStep } from "@/lib/learning/types";
import type { ItemExplanationLayers } from "@/content/items/types";

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
  /** `undefined` = não mostra o botão (flag desligada ou item incompatível — docs/30 §16.1). Decisão de quem chama, não deste componente. */
  onDontKnow,
  isLast,
  questionNumber,
  questionTotal,
  /** Nível 2 da explicação em camadas (docs/30 §17.1, Fase 7 F7.2) — `ItemMeta.explanationLayers`, quando o item tiver. `undefined` = sem "Ver resolução" (item ainda sem conteúdo de nível 2). */
  explanationLayers,
  /** Nivelamento (Fase 13) e checkpoint (Fase 14, docs/30 §12.3/§13.3): sem feedback certo/errado, sem explicação, sem tutor — só confirma e segue. */
  silent = false,
  /** Atribuição de item oficial na folha de feedback (docs/36 RP-10) — `atribuicaoOficial(meta.source)` de quem chama. */
  fonteOficial,
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
  onDontKnow?: () => void;
  isLast: boolean;
  questionNumber: number;
  questionTotal: number;
  explanationLayers?: ItemExplanationLayers;
  silent?: boolean;
  fonteOficial?: string;
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

      {exercise.fonte && <p className="text-[11px] text-nevoa">{exercise.fonte}</p>}

      {!checked ? (
        <div className="space-y-2">
          {/* O `:disabled` da utility já cuida da opacidade — nada de
              `opacity-40` manual por cima (docs/25 §18 T-10). */}
          <button type="button" className="btn-primary w-full" disabled={!canVerify} onClick={onVerify}>
            {COPY.licao.verificar}
          </button>
          {onDontKnow && <DontKnowButton onClick={onDontKnow} />}
        </div>
      ) : silent ? (
        <div className="space-y-3" role="status">
          <p className="text-sm font-semibold text-nevoa">{COPY.licao.respostaRegistrada}</p>
          <button type="button" className="btn-primary w-full" onClick={onContinue}>
            {isLast ? COPY.feedback.verResultado : COPY.feedback.continuar}
          </button>
        </div>
      ) : (
        feedback && (
          <FeedbackSheet
            feedback={feedback}
            isLast={isLast}
            onContinue={onContinue}
            onAskTutor={onAskTutor}
            fonte={fonteOficial}
          >
            {hasExplanationLayers(explanationLayers) ? <ExplanationLayers layers={explanationLayers} /> : undefined}
          </FeedbackSheet>
        )
      )}
    </div>
  );
}
