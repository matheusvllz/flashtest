import { getState } from "@/lib/store";

/**
 * Háptico (docs/16-gamificacao-e-dopamina.md §4). Reforça o som e funciona
 * com o celular no silencioso — onde o público-alvo passa metade do dia.
 * `navigator.vibrate` não existe no iOS Safari: degrada em silêncio, sem
 * try/catch barulhento. Toggle próprio (`prefs.haptics`) — tem gente que
 * quer vibração sem som exatamente por estar em aula.
 */
export type PadraoHaptico = "acerto" | "erro" | "fim" | "marco";

const PADRAO: Record<PadraoHaptico, number | number[]> = {
  acerto: 30,
  erro: [25, 40, 25],
  fim: 60,
  marco: [30, 50, 40, 50, 60],
};

export function vibrar(padrao: PadraoHaptico) {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    if (!getState().prefs.haptics) return;
    navigator.vibrate(PADRAO[padrao]);
  } catch {
    // Nunca deixar vibração quebrar a UI.
  }
}
