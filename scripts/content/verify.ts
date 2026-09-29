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
 *
 * Item que rotula AFIRMAÇÕES com (A)/(B)/(C)/(D) no enunciado (`rotulaAfirmacoes`) gira as
 * alternativas do mesmo jeito, mas NÃO remapeia letras da explicação: ali "A", "C e D" são
 * rótulos do TEXTO, não posições (achado real da repescagem, docs/32 L365; o conserto original
 * nunca chegou ao repo — portado na T-07.6 do docs/36).
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
    exercise.explicacao === undefined
      ? undefined
      : rotulaAfirmacoes(exercise as { pergunta?: string; opcoes: string[] })
        ? exercise.explicacao
        : remapearLetras(exercise.explicacao, rotacao);
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

/** Rótulo de afirmação no enunciado: "(A)", "(B)"… */
const RE_ROTULO_NO_ENUNCIADO = /\(([A-E])\)/g;
/**
 * Alternativa que só cita rótulos de afirmações: "Somente A", "Apenas B", "C e D", "A, B e C",
 * "As afirmativas A e C.", "Só a alternativa B"… (letras maiúsculas isoladas; case-insensitive só
 * nas palavras de ligação).
 */
const RE_ALTERNATIVA_SO_ROTULOS =
  /^\s*(?:(?:somente|apenas|s[oó])\s+)?(?:(?:as?|os)\s+(?:afirmativas?|afirma(?:ç|c)(?:ão|ões|ao|oes)|senten(?:ç|c)as?|frases?|alternativas?|itens?|op(?:ç|c)(?:ão|ões|ao|oes))\s+)?[A-E](?:\s*(?:,|e|ou)\s*[A-E])*\s*\.?\s*$/i;

/**
 * O item rotula afirmações com (A)/(B)/… no enunciado E responde por rótulos ("Somente A", "C e D")?
 * Nesse formato as letras do enunciado, das alternativas e da explicação são do TEXTO — girar as
 * alternativas não muda o que elas significam, e `remapearLetras` estragaria a explicação.
 * Exige as duas marcas (≥ 2 rótulos distintos no enunciado e ≥ 1 alternativa só de rótulos) pra
 * não pegar enunciado comum que cita "(A)" de passagem.
 */
export function rotulaAfirmacoes(exercise: { pergunta?: string; opcoes: string[] }): boolean {
  const rotulos = new Set([...(exercise.pergunta ?? "").matchAll(RE_ROTULO_NO_ENUNCIADO)].map((m) => m[1]));
  if (rotulos.size < 2) return false;
  return exercise.opcoes.some((o) => RE_ALTERNATIVA_SO_ROTULOS.test(o));
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
