import { useRef, useState } from "react";
import { createFeedback } from "@/lib/feedback/create-feedback";
import { dispatchAnswerFeedback } from "@/lib/feedback/dispatch-feedback";
import type { AnswerFeedback, FeedbackPhase } from "@/lib/feedback/types";

/**
 * Transições de resposta compartilhadas pelos dois players (docs/20 §5, Fase
 * 2). Não é um store concorrente: não persiste nada — só concentra a máquina
 * `answering -> feedback -> advancing` e as guardas síncronas que a Fase 1
 * duplicava em `study.tsx` e `LessonPlayer.tsx`. Progresso/XP continuam em
 * `store.ts`; cada player decide sua própria correção e chama as funções de
 * domínio de dentro de `evaluate`.
 */
export function useExerciseSession() {
  const [phase, setPhase] = useState<FeedbackPhase>("answering");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const answeringRef = useRef(false);
  const advancingRef = useRef(false);

  /**
   * Roda a correção/transação do chamador (`evaluate`) e publica o snapshot
   * UMA vez. Clique duplo/Enter repetido não registra duas tentativas nem
   * dois eventos de som (docs/20 §3 B5).
   */
  function submit(evaluate: () => {
    exerciseId: string;
    correct: boolean;
    explanation: string;
    xpAwarded?: number;
  }) {
    if (answeringRef.current || phase !== "answering") return;
    answeringRef.current = true;
    const result = evaluate();
    const fb = createFeedback(result);
    dispatchAnswerFeedback(fb);
    setFeedback(fb);
    setPhase("feedback");
  }

  /** Consome o avanço uma única vez (docs/20 §3 B5) e roda `onAdvance`. */
  function advance(onAdvance: () => void) {
    if (advancingRef.current || phase !== "feedback") return;
    advancingRef.current = true;
    setPhase("advancing");
    onAdvance();
  }

  /** Prepara a sessão pra próxima pergunta (ou replay) — chamado pelo player depois que `onAdvance` já trocou de questão. */
  function reset() {
    answeringRef.current = false;
    advancingRef.current = false;
    setFeedback(null);
    setPhase("answering");
  }

  return { phase, feedback, submit, advance, reset };
}
