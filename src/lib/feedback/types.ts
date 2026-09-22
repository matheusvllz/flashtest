/**
 * Contratos de feedback compartilhados pelos dois players (docs/20 §5, Fase 2).
 * Formaliza o que a Fase 1 já fazia manualmente e de forma duplicada em
 * `study.tsx`/`LessonPlayer.tsx`: escolher a frase e o resultado UMA vez por
 * resposta, fora do render, e não deixar a UI decidir concessão nem som.
 */

/** Máquina de estados da resposta. `advancing` é a trava da transição, não um tempo de espera imposto. */
export type FeedbackPhase = "answering" | "feedback" | "advancing";

/**
 * Snapshot imutável de uma resposta — criado UMA vez em `createFeedback`
 * (Fase 2) e nunca recalculado durante a interação. IDs e texto ficam
 * estáveis até a próxima resposta trocar `interactionId`.
 */
export interface AnswerFeedback {
  interactionId: string;
  exerciseId: string;
  correct: boolean;
  /** Slot usado em `fala()` — guardado pra depuração/teste, não pra re-sortear depois. */
  messageId: string;
  messageText: string;
  explanation: string;
  /** XP concedido por ESTA resposta (0 em replay sem melhora, teto etc. — regra de cada chamador). */
  xpAwarded?: number;
}
