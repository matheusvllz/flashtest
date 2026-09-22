import { fala, type VozSlot } from "@/lib/voz";
import type { AnswerFeedback } from "./types";

let contador = 0;
/** IDs sequenciais bastam aqui: só precisam ser únicos dentro de uma sessão de página. */
function proximoInteractionId(): string {
  contador += 1;
  return `fb-${Date.now()}-${contador}`;
}

/**
 * Cria o snapshot de uma resposta — correção pura (seção 5 item 1) já
 * calculada pelo chamador, aqui só a mensagem é escolhida, UMA vez. `pickMessage`
 * é injetável pra teste determinístico (docs/20 §5, "seletor de mensagem injetável").
 */
export function createFeedback(
  params: {
    exerciseId: string;
    correct: boolean;
    explanation: string;
    xpAwarded?: number;
  },
  pickMessage: (slot: VozSlot) => string = fala,
): AnswerFeedback {
  const messageId: VozSlot = params.correct ? "acertou" : "errou";
  return {
    interactionId: proximoInteractionId(),
    exerciseId: params.exerciseId,
    correct: params.correct,
    messageId,
    messageText: pickMessage(messageId),
    explanation: params.explanation,
    xpAwarded: params.xpAwarded,
  };
}
