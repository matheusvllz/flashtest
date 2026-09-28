import { probabilityCorrect, type ItemIrtLike } from "@/lib/adaptive/model";

/**
 * Aluno simulado (docs/30 §26.2/§26.3, Fase 5 T-5.8) — reaproveitado pelas
 * simulações do motor (Fase 8) e do nivelamento (Fase 13). Semente fixa:
 * mesma semente, mesma sequência de respostas, sempre.
 */

/** PRNG determinístico simples (mulberry32) — sem dependência nova. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SimulatedResponse {
  correct: boolean;
  response: "answered" | "dont-know";
}

export interface SimulateOptions {
  /** Marca "não sei" em vez de chutar quando a probabilidade prevista cair abaixo disto. */
  dontKnowBelow?: number;
  /** Fração das respostas marcadas como assistidas (dica/tutor pedidos antes). */
  assistedRate?: number;
}

/**
 * Simula UMA resposta a partir da habilidade VERDADEIRA do aluno (não a
 * estimada pelo modelo) — usa a mesma curva 3PL+escorregão de
 * `probabilityCorrect` pra gerar o dado, prática comum de validação de
 * modelo psicométrico (o modelo é "certo" se recupera algo perto de
 * `trueTheta` a partir de respostas geradas por essa mesma curva).
 */
export function simulateResponse(
  trueTheta: number,
  irt: ItemIrtLike,
  rng: () => number,
  opts: SimulateOptions = {},
): SimulatedResponse {
  const p = probabilityCorrect(trueTheta, irt);
  if (opts.dontKnowBelow !== undefined && p < opts.dontKnowBelow && rng() < 0.7) {
    return { correct: false, response: "dont-know" };
  }
  return { correct: rng() < p, response: "answered" };
}

export function isAssisted(rng: () => number, assistedRate = 0): boolean {
  return assistedRate > 0 && rng() < assistedRate;
}
