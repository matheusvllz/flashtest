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
 *
 * `dontKnow` (docs/30 §16.1, Fase 6): quando `true`, força `correct: false`
 * e `kind: "dont-know"` independente do que veio em `params.correct` — o
 * botão "Não sei" nunca é lido como chute certo por acidente.
 */
export function createFeedback(
  params: {
    exerciseId: string;
    correct: boolean;
    explanation: string;
    xpAwarded?: number;
    dontKnow?: boolean;
  },
  pickMessage: (slot: VozSlot) => string = fala,
): AnswerFeedback {
  const kind: AnswerFeedback["kind"] = params.dontKnow ? "dont-know" : params.correct ? "correct" : "incorrect";
  const messageId: VozSlot = kind === "dont-know" ? "naosei" : kind === "correct" ? "acertou" : "errou";
  return {
    interactionId: proximoInteractionId(),
    exerciseId: params.exerciseId,
    correct: kind === "dont-know" ? false : params.correct,
    kind,
    messageId,
    messageText: pickMessage(messageId),
    explanation: params.explanation,
    xpAwarded: params.xpAwarded,
  };
}
