/**
 * Verificador (docs/30 §19.2 estágio 4, Fase 9 do docs/31 F9.6) —
 * determinístico: compara o gabarito do gerador (depois da crítica) com a
 * resposta do solucionador independente (que NUNCA recebeu o gabarito).
 */
import { respostasIguais } from "./verify-utils";

export const CONFIANCA_MINIMA = 0.8;

export type VerifyOutcome =
  | { agree: true; escalated: false; finalAnswer: number | number[] }
  | { agree: false; escalated: true };

export function verify(
  gabaritoGerador: number | number[],
  respostaSolucionador: number | number[],
  confiancaSolucionador: number,
): VerifyOutcome {
  if (respostasIguais(gabaritoGerador, respostaSolucionador) && confiancaSolucionador >= CONFIANCA_MINIMA) {
    return { agree: true, escalated: false, finalAnswer: gabaritoGerador };
  }
  return { agree: false, escalated: true };
}

function hashMod4(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 4;
}

/**
 * Rebalanceia a posição da alternativa certa (achado real da Onda 1: o gerador
 * punha >90% dos gabaritos na alternativa A em 5 de 8 lotes). Gira `opcoes` pra
 * que a certa caia numa posição-alvo determinística (hash do `candidateId`) —
 * mesmo conteúdo, mesma alternativa certa, só muda a ordem. Roda DEPOIS da
 * verificação: o solucionador respondeu sobre a ordem original.
 */
export function balancearPosicaoGabarito<
  T extends { opcoes: string[]; correta: number; explicacao?: string },
>(exercise: T, candidateId: string): T {
  if (exercise.opcoes.length !== 4) return exercise;
  const alvo = hashMod4(candidateId);
  const rotacao = (alvo - exercise.correta + 4) % 4;
  if (rotacao === 0) return exercise;
  const opcoes = [0, 1, 2, 3].map((k) => exercise.opcoes[(k - rotacao + 4) % 4]);
  const explicacao =
    exercise.explicacao === undefined ? undefined : remapearLetras(exercise.explicacao, rotacao);
  return { ...exercise, opcoes, correta: alvo, ...(explicacao === undefined ? {} : { explicacao }) };
}

/**
 * Letras de alternativa citadas no texto ("alternativa A", "(B)", "C)") acompanham o
 * giro das opções (achado real, lote onda1-12: depois do rebalanceamento, a explicação
 * dizia "a opção A está certa" apontando pra alternativa que tinha virado C). Só casa
 * referência explícita — "C = cinzento" (alelo) não é alternativa.
 */
const RE_LETRA_ALTERNATIVA =
  /\b(alternativas?|opç(?:ão|ões)|opcao|letras?)\s*\(?([A-D])\)?(?![A-Za-zà-ú])|\(([A-D])\)(?!\s*=)|\b([A-D])\)(?!\s*=)/g;

export function remapearLetras(texto: string, rotacao: number): string {
  const L = "ABCD";
  return texto.replace(RE_LETRA_ALTERNATIVA, (trecho, _rotulo, a, b, c) => {
    const letra = (a ?? b ?? c) as string;
    return trecho.replace(letra, L[(L.indexOf(letra) + rotacao) % 4]);
  });
}

export type EscalationVerdict =
  | { finalAnswer: number | number[]; judge: string; note?: string }
  | { rejected: true; note: string };

/**
 * Estágio 4b (§19.2) — juiz (SONNET) recebe o item + as duas respostas +
 * raciocínios e confirma UMA delas. "Ambíguo" rejeita o item. Esta função
 * só encapsula a DECISÃO estruturada — quem chama já correu o modelo e
 * traz o veredito em texto livre normalizado para um destes 3 valores.
 */
export function resolveEscalation(
  veredito: "gerador" | "solucionador" | "ambiguo",
  gabaritoGerador: number | number[],
  respostaSolucionador: number | number[],
  judge: string,
  note?: string,
): EscalationVerdict {
  if (veredito === "ambiguo") {
    return { rejected: true, note: note ?? "juiz considerou o item ambíguo" };
  }
  const finalAnswer = veredito === "gerador" ? gabaritoGerador : respostaSolucionador;
  return { finalAnswer, judge, note };
}
