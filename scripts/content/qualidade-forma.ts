/**
 * Sinais de forma de uma questão de múltipla escolha (docs/36 §G.7, T-07.1/T-07.2) — funções
 * PURAS, sem I/O e sem importar nada de `src/`. Usadas por dois consumidores que precisam dar
 * o MESMO número: `validate.ts` (warnings por item, no portão de publicação) e
 * `auditar-qualidade.ts` (linha de base e estratos de revisão).
 *
 * Nada aqui bloqueia publicação: são pistas de FORMA que a revisão editorial (rubrica R4/R5/R8,
 * `docs/36` §G.6) decide caso a caso. O que é bloqueio continua em `validate.ts` (`issues`).
 */

export type Severidade = "alta" | "media" | "info";

export interface AvisoQualidade {
  regra: string;
  severidade: Severidade;
  detalhe: string;
}

/** Exceção registrada por id+regra em `content-pipeline/excecoes-qualidade.json` (§G.7). */
export interface ExcecaoQualidade {
  id: string;
  regra: string;
  motivo: string;
  registradoEm: string;
}

// Limiares iniciais (§G.7; justificativa: distribuição medida em 28/09/2026 — p90 da razão = 2,09).
export const LIMIAR_TAMANHO_ALTA = 2.0;
export const LIMIAR_TAMANHO_MEDIA = 1.5;
export const LIMIAR_CORRETA_MENOR = 0.4;
export const LIMIAR_DISPERSAO_CV = 0.6;
export const LIMIAR_POSICAO_LOTE = 0.4;
export const MIN_ITENS_POSICAO_LOTE = 20;
export const LIMIAR_QUASE_DUPLICATA = 0.4;
export const MIN_ABSOLUTISMOS_DISTRATORES = 2;

/** `nunca|sempre|apenas|somente|todas?|todos|nenhum[a]?|jamais` (§G.7) — palavra inteira, sem `g` (usa `.test`). */
export const RE_ABSOLUTISMO = /\b(nunca|sempre|apenas|somente|todas?|todos|nenhum[a]?|jamais)\b/i;
const RE_TRAVESSAO = /[—–]/;

/** Comprimento em caracteres depois de trim e colapso de espaços (definição de `len`, §G.7). */
export function comprimento(texto: string): number {
  return texto.replace(/\s+/g, " ").trim().length;
}

export interface MetricasForma {
  lenCorreta: number;
  maiorIncorreta: number;
  menorIncorreta: number;
  /** `len(correta) / max(len(incorretas))`; `null` se não há incorreta com texto. */
  razaoMaior: number | null;
  /** `len(correta) / min(len(incorretas))`; `null` se a menor incorreta é vazia. */
  razaoMenor: number | null;
  /** Coeficiente de variação (desvio populacional / média) dos comprimentos de TODAS as alternativas. */
  cv: number;
  /** A correta é estritamente maior que TODAS as incorretas (o que "acaso" daria ~25 % com 4 opções). */
  corretaMaisLongaEstrita: boolean;
  corretaTemAbsolutismo: boolean;
  /** Quantas incorretas contêm absolutismo. */
  incorretasComAbsolutismo: number;
  /** Alternativas com `—` ou `–`. */
  alternativasComTravessao: number;
}

/** `null` quando não há como medir (menos de 2 alternativas ou gabarito fora do intervalo). */
export function metricasForma(opcoes: string[], correta: number): MetricasForma | null {
  if (opcoes.length < 2 || correta < 0 || correta >= opcoes.length) return null;
  const lens = opcoes.map(comprimento);
  const incorretasLens = lens.filter((_, i) => i !== correta);
  const lenCorreta = lens[correta];
  const maiorIncorreta = Math.max(...incorretasLens);
  const menorIncorreta = Math.min(...incorretasLens);
  const media = lens.reduce((a, b) => a + b, 0) / lens.length;
  const variancia = lens.reduce((a, l) => a + (l - media) ** 2, 0) / lens.length;
  const incorretasTexto = opcoes.filter((_, i) => i !== correta);
  return {
    lenCorreta,
    maiorIncorreta,
    menorIncorreta,
    razaoMaior: maiorIncorreta > 0 ? lenCorreta / maiorIncorreta : null,
    razaoMenor: menorIncorreta > 0 ? lenCorreta / menorIncorreta : null,
    cv: media > 0 ? Math.sqrt(variancia) / media : 0,
    corretaMaisLongaEstrita: lenCorreta > maiorIncorreta,
    corretaTemAbsolutismo: RE_ABSOLUTISMO.test(opcoes[correta]),
    incorretasComAbsolutismo: incorretasTexto.filter((o) => RE_ABSOLUTISMO.test(o)).length,
    alternativasComTravessao: opcoes.filter((o) => RE_TRAVESSAO.test(o)).length,
  };
}

/** Arredonda pra 3 casas (relatórios estáveis e legíveis). */
export function r3(n: number | null): number | null {
  return n === null ? null : Math.round(n * 1000) / 1000;
}

/**
 * Letras de alternativa citadas no texto ("alternativa C", "letra B", "opção (D)"), A–E. Só a
 * forma por extenso — "(B)"/"C)" soltos também aparecem como rótulo de AFIRMAÇÃO dentro do
 * enunciado (`rotulaAfirmacoes` em `verify.ts`), então não entram aqui.
 */
const RE_CITA_ALTERNATIVA = /\b(alternativas?|opç(?:ão|ões)|opcao|letras?)\s*\(?([A-E])\)?(?![A-Za-zà-ú])/g;

export function letrasCitadas(explicacao: string): string[] {
  return [...explicacao.matchAll(RE_CITA_ALTERNATIVA)].map((m) => m[2]);
}

/**
 * Avisos de forma de UM item (regras por item de §G.7; `posicao-lote` e `quase-duplicata` são
 * de lote/acervo e ficam em `avisoPosicaoLote`/`bigramasJaccard`). Não olha `id` nem exceção —
 * quem chama filtra (`filtrarExcecoes`).
 */
export function avisosDeForma(
  opcoes: string[],
  correta: number,
  explicacao?: string,
  /** `ignorarLetras`: item que rotula afirmações com (A)/(B)… (`rotulaAfirmacoes`) — as letras da explicação são do texto, não posições. */
  opts: { ignorarLetras?: boolean } = {},
): AvisoQualidade[] {
  const m = metricasForma(opcoes, correta);
  if (!m) return [];
  const avisos: AvisoQualidade[] = [];

  if (m.razaoMaior !== null && m.razaoMaior >= LIMIAR_TAMANHO_MEDIA) {
    const alta = m.razaoMaior >= LIMIAR_TAMANHO_ALTA;
    avisos.push({
      regra: "tamanho-correta-maior",
      severidade: alta ? "alta" : "media",
      detalhe: `a correta tem ${m.lenCorreta} caracteres e a maior incorreta ${m.maiorIncorreta} (razão ${m.razaoMaior.toFixed(2)}; limiar ${alta ? LIMIAR_TAMANHO_ALTA : LIMIAR_TAMANHO_MEDIA})`,
    });
  }
  if (m.razaoMenor !== null && m.razaoMenor <= LIMIAR_CORRETA_MENOR) {
    avisos.push({
      regra: "tamanho-correta-menor",
      severidade: "media",
      detalhe: `a correta tem ${m.lenCorreta} caracteres e a menor incorreta ${m.menorIncorreta} (razão ${m.razaoMenor.toFixed(2)} ≤ ${LIMIAR_CORRETA_MENOR})`,
    });
  }
  if (m.cv > LIMIAR_DISPERSAO_CV) {
    avisos.push({
      regra: "dispersao-tamanhos",
      severidade: "info",
      detalhe: `coeficiente de variação dos comprimentos ${m.cv.toFixed(2)} > ${LIMIAR_DISPERSAO_CV}`,
    });
  }
  if (m.incorretasComAbsolutismo >= MIN_ABSOLUTISMOS_DISTRATORES && !m.corretaTemAbsolutismo) {
    avisos.push({
      regra: "absolutismo-distratores",
      severidade: "media",
      detalhe: `${m.incorretasComAbsolutismo} incorretas com absolutismo (nunca/sempre/apenas/todos...) e a correta sem`,
    });
  }
  if (m.alternativasComTravessao > 0) {
    avisos.push({
      regra: "travessao-alternativa",
      severidade: "media",
      detalhe: `${m.alternativasComTravessao} alternativa(s) com travessão (regra editorial: sem — nem –)`,
    });
  }
  if (explicacao && !opts.ignorarLetras) {
    const letraGabarito = "ABCDE"[correta];
    const erradas = [...new Set(letrasCitadas(explicacao).filter((l) => l !== letraGabarito))];
    if (erradas.length > 0) {
      avisos.push({
        regra: "explicacao-cita-alternativa-errada",
        severidade: "alta",
        detalhe: `a explicação cita a(s) letra(s) ${erradas.join(", ")}, mas o gabarito é ${letraGabarito}`,
      });
    }
  }
  return avisos;
}

/** `posicao-lote` (info): num lote com ≥ 20 itens, alguma posição de gabarito acima de 40 %. */
export function avisoPosicaoLote(corretas: number[]): AvisoQualidade | null {
  if (corretas.length < MIN_ITENS_POSICAO_LOTE) return null;
  const contagem = new Map<number, number>();
  for (const c of corretas) contagem.set(c, (contagem.get(c) ?? 0) + 1);
  const [posicao, n] = [...contagem.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
  const proporcao = n / corretas.length;
  if (proporcao <= LIMIAR_POSICAO_LOTE) return null;
  return {
    regra: "posicao-lote",
    severidade: "info",
    detalhe: `${(proporcao * 100).toFixed(0)}% dos ${corretas.length} itens têm o gabarito na posição ${"ABCDE"[posicao]}`,
  };
}

function normalizarPalavras(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Bigramas de palavras normalizadas (sem acento, sem pontuação). */
export function bigramas(texto: string): Set<string> {
  const p = normalizarPalavras(texto);
  const out = new Set<string>();
  for (let i = 0; i + 2 <= p.length; i++) out.add(`${p[i]} ${p[i + 1]}`);
  if (out.size === 0 && p.length > 0) out.add(p.join(" "));
  return out;
}

export function jaccardBigramas(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const g of a) if (b.has(g)) inter++;
  const uniao = a.size + b.size - inter;
  return uniao === 0 ? 0 : inter / uniao;
}

/** Aviso `quase-duplicata` (info) se a similaridade de bigramas com um enunciado existente da mesma habilidade ≥ 0,4. */
export function avisoQuaseDuplicata(similaridade: number): AvisoQualidade | null {
  if (similaridade < LIMIAR_QUASE_DUPLICATA) return null;
  return {
    regra: "quase-duplicata",
    severidade: "info",
    detalhe: `similaridade de bigramas ${(similaridade * 100).toFixed(0)}% com item da mesma habilidade (limiar ${LIMIAR_QUASE_DUPLICATA * 100}%)`,
  };
}

/** Separa os avisos cobertos por uma exceção registrada (id + regra) dos que continuam valendo. */
export function filtrarExcecoes(
  itemId: string | undefined,
  avisos: AvisoQualidade[],
  excecoes: ExcecaoQualidade[] | undefined,
): { avisos: AvisoQualidade[]; excecoes: AvisoQualidade[] } {
  if (!itemId || !excecoes || excecoes.length === 0) return { avisos, excecoes: [] };
  const cobertas = new Set(excecoes.filter((e) => e.id === itemId).map((e) => e.regra));
  return {
    avisos: avisos.filter((a) => !cobertas.has(a.regra)),
    excecoes: avisos.filter((a) => cobertas.has(a.regra)),
  };
}

/** Lê e valida a forma de `excecoes-qualidade.json` (lista de `{id, regra, motivo, registradoEm}`). */
export function parseExcecoes(bruto: unknown): ExcecaoQualidade[] {
  if (!Array.isArray(bruto)) throw new Error("excecoes-qualidade.json deve ser uma lista");
  return bruto.map((e, i) => {
    const o = e as Partial<ExcecaoQualidade>;
    if (!o || typeof o.id !== "string" || typeof o.regra !== "string" || typeof o.motivo !== "string" || !o.motivo.trim()) {
      throw new Error(`excecoes-qualidade.json[${i}] inválida: exige id, regra e motivo não vazio`);
    }
    return { id: o.id, regra: o.regra, motivo: o.motivo, registradoEm: String(o.registradoEm ?? "") };
  });
}
