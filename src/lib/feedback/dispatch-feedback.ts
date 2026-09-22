import { playClosingSound, playFeedbackSound, type SoundEvent } from "@/lib/audio/engine";
import { vibrar, type PadraoHaptico } from "@/lib/haptics";
import { getState } from "@/lib/store";
import type { AnswerFeedback } from "./types";

export type { SoundEvent } from "@/lib/audio/engine";

function somHabilitado(): boolean {
  try {
    return getState().prefs.sound;
  } catch {
    return true;
  }
}

/**
 * Despacha som/háptico para UMA resposta nova (docs/20 §5/§6, nível 1). Só o
 * chamador decide QUANDO isto roda — sempre em reação a um evento de domínio
 * (`submit`/`verify` já validado), nunca dentro de um efeito de montagem, que
 * repetiria o som numa remontagem (Strict Mode, fast refresh).
 */
export function dispatchAnswerFeedback(feedback: AnswerFeedback): void {
  if (somHabilitado()) {
    void playFeedbackSound(feedback.correct ? "resposta-correta" : "resposta-incorreta");
  }
  vibrar(feedback.correct ? "acerto" : "erro");
}

/**
 * Despacha o som/háptico de FECHAMENTO (fim de aula/lição/meta), escolhendo
 * só o mais alto da hierarquia entre os eventos que realmente aconteceram
 * nesta conclusão (docs/20 §5: "selecionar apenas o som de maior
 * prioridade"). Chamar uma única vez por conclusão — o chamador garante isso
 * com guarda própria (mesmo princípio de `submittingRef`/`verifyingRef`).
 */
export function dispatchClosingFeedback(eventos: SoundEvent[]): void {
  // Toda conclusão tem um som de base ("conclusao-licao"); os eventos extras
  // só sobem a prioridade quando presentes — nunca fica em silêncio.
  const todos: SoundEvent[] = [...eventos, "conclusao-licao"];
  if (somHabilitado()) void playClosingSound(todos);
  const padraoHaptico: PadraoHaptico =
    eventos.includes("level-up") || eventos.includes("marco-streak") ? "marco" : "fim";
  vibrar(padraoHaptico);
}
