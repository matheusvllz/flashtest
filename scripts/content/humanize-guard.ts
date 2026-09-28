/**
 * Guarda de invariantes do Humanizer (docs/30 §19.4, Fase 9 do docs/31
 * F9.7) — o Humanizer muda a FORMA, nunca o CONTEÚDO. Compara antes/depois
 * e descarta a versão humanizada se qualquer invariante mudar. Só roda em
 * `explicacao`/`explanationLayers`/corpo de ensino — nunca em enunciado nem
 * alternativa (quem chama garante isso, não esta função).
 */

/** Números (inteiro/decimal com vírgula OU ponto), frações escritas "a/b", percentuais, unidades comuns. */
const RE_NUMERO = /-?\d+(?:[.,]\d+)?%?/g;
const RE_FRACAO = /\b\d+\s*\/\s*\d+\b/g;
const RE_UNIDADE = /\b\d+(?:[.,]\d+)?\s?(km\/h|km|m\/s|m²|m³|m|cm|mm|mol|g|kg|L|mL|°C|°|R\$|h|min|s)\b/gi;
/** Fórmulas: sequência com operador matemático entre tokens (não pega hífen de palavra composta por exigir espaço/dígito ao redor). */
const RE_FORMULA = /[a-zA-Zà-ú0-9)]\s*[=+×÷^√]\s*[a-zA-Zà-ú0-9(]|(?<=\d)\s*-\s*(?=\d)|(?<=\d)\s*\*\s*(?=\d)|(?<=\d)\s*\/\s*(?=\d)/g;
/** Nome próprio: palavra capitalizada que NÃO está no início de frase (aproximação — falso positivo é aceitável aqui, é melhor rejeitar humanização de mais do que deixar passar uma mudança real). */
const RE_NOME_PROPRIO = /(?<=[a-zà-ú,;]\s)[A-ZÀ-Ú][a-zà-ú]+/g;
/** Datas: DD/MM/AAAA, "de 2019", "ENEM 2020". */
const RE_DATA = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b(19|20)\d{2}\b/g;
const NEGACOES = ["não", "nunca", "exceto", "jamais", "nenhum", "nenhuma", "nem"];

export interface InvariantesExtraidos {
  numeros: string[];
  fracoes: string[];
  unidades: string[];
  formulas: string[];
  nomesProprios: string[];
  datas: string[];
  negacoes: string[];
}

function normalizarNumero(s: string): string {
  return s.replace(",", ".").replace(/\s+/g, "");
}

export function extractInvariants(texto: string): InvariantesExtraidos {
  // \W do JS é ASCII-only — "não"/"é" quebrariam no acento sem \p{L} (unicode).
  const palavrasLower = texto.toLowerCase().split(/[^\p{L}\p{N}]+/u);
  return {
    numeros: [...texto.matchAll(RE_NUMERO)].map((m) => normalizarNumero(m[0])),
    fracoes: [...texto.matchAll(RE_FRACAO)].map((m) => m[0].replace(/\s+/g, "")),
    unidades: [...texto.matchAll(RE_UNIDADE)].map((m) => m[0].toLowerCase().replace(/\s+/g, "")),
    formulas: [...texto.matchAll(RE_FORMULA)].map((m) => m[0].replace(/\s+/g, "")),
    nomesProprios: [...texto.matchAll(RE_NOME_PROPRIO)].map((m) => m[0]),
    datas: [...texto.matchAll(RE_DATA)].map((m) => m[0]),
    negacoes: NEGACOES.filter((n) => palavrasLower.includes(n)),
  };
}

function multisetIgual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const contagemA = new Map<string, number>();
  for (const x of a) contagemA.set(x, (contagemA.get(x) ?? 0) + 1);
  for (const x of b) {
    const n = contagemA.get(x) ?? 0;
    if (n === 0) return false;
    contagemA.set(x, n - 1);
  }
  return true;
}

export interface HumanizeGuardResult {
  accepted: boolean;
  rejectedBecause?: string[];
}

/**
 * `humanizeGuard(before, after)` (§19.4). Compara multiset de cada
 * categoria de invariante — mudar a ORDEM dos números não é rejeitado (só
 * mudar QUAIS existem), mudar a QUANTIDADE de negações ou trocar/remover um
 * nome próprio é.
 */
export function humanizeGuard(before: string, after: string): HumanizeGuardResult {
  const antes = extractInvariants(before);
  const depois = extractInvariants(after);

  const categorias: Array<[keyof InvariantesExtraidos, string]> = [
    ["numeros", "números"],
    ["fracoes", "frações"],
    ["unidades", "unidades"],
    ["formulas", "fórmulas"],
    ["nomesProprios", "nomes próprios"],
    ["datas", "datas"],
    ["negacoes", "negações"],
  ];

  const motivos: string[] = [];
  for (const [chave, rotulo] of categorias) {
    if (!multisetIgual(antes[chave], depois[chave])) motivos.push(rotulo);
  }

  if (motivos.length > 0) return { accepted: false, rejectedBecause: motivos };
  return { accepted: true };
}
