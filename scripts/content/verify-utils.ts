/**
 * Compara `number | number[]` — usado por `verify.ts`. Igualdade POSICIONAL
 * (nunca ordenada): em "ordenar", a ordem da sequência É a resposta; em
 * "parear", cada posição é um par índice→índice. Sortear pra comparar
 * mudaria o significado da resposta nos dois casos.
 */
export function respostasIguais(a: number | number[], b: number | number[]): boolean {
  const arrA = Array.isArray(a) ? a : [a];
  const arrB = Array.isArray(b) ? b : [b];
  if (arrA.length !== arrB.length) return false;
  return arrA.every((v, i) => v === arrB[i]);
}
