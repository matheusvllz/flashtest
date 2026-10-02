/**
 * Separação das questões a partir do texto já extraído (spec 50 §5.9.2 passo 2). Funções puras: recebem as
 * páginas (itens de texto que não foram absorvidos por figura), as figuras e a faixa útil de cada página, e
 * devolvem as questões com enunciado em blocos, alternativas A–E e créditos impressos.
 *
 * Ordem de leitura: em cada página, blocos de largura total (que cruzam a calha) separam faixas; dentro de cada
 * faixa lê-se a coluna da esquerda e depois a da direita.
 */
import type { Faixa } from "./figuras";
import { formulaSemIndice } from "./formula";
import { RE_MARCADOR_QUESTAO } from "./figuras";
import type {
  Alternativa,
  Caixa,
  ElementoFluxo,
  FiguraDetectada,
  Idioma,
  ItemTexto,
  LinhaTexto,
  QuestaoExtraida,
} from "./tipos";

export interface PaginaParaLer {
  numero: number;
  largura: number;
  altura: number;
  itens: ItemTexto[];
  figuras: FiguraDetectada[];
  faixa: Faixa;
  calha: number | null;
  /** Tinta pequena fora de texto e de figura (`figuras.ts`): a linha que encosta nela não é texto puro. */
  marcas?: Caixa[];
}

const LETRAS = ["A", "B", "C", "D", "E"] as const;

const SOBRESCRITO: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "−": "⁻",
  "–": "⁻",
  "(": "⁽",
  ")": "⁾",
  "=": "⁼",
  a: "ᵃ",
  b: "ᵇ",
  c: "ᶜ",
  d: "ᵈ",
  e: "ᵉ",
  f: "ᶠ",
  g: "ᵍ",
  h: "ʰ",
  i: "ⁱ",
  j: "ʲ",
  k: "ᵏ",
  l: "ˡ",
  m: "ᵐ",
  n: "ⁿ",
  o: "ᵒ",
  p: "ᵖ",
  r: "ʳ",
  s: "ˢ",
  t: "ᵗ",
  u: "ᵘ",
  v: "ᵛ",
  w: "ʷ",
  x: "ˣ",
  y: "ʸ",
  z: "ᶻ",
  A: "ᴬ",
  B: "ᴮ",
  D: "ᴰ",
  E: "ᴱ",
  G: "ᴳ",
  H: "ᴴ",
  I: "ᴵ",
  J: "ᴶ",
  K: "ᴷ",
  L: "ᴸ",
  M: "ᴹ",
  N: "ᴺ",
  O: "ᴼ",
  P: "ᴾ",
  R: "ᴿ",
  T: "ᵀ",
  U: "ᵁ",
  V: "ⱽ",
  W: "ᵂ",
};
const SUBSCRITO: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "−": "₋",
  "(": "₍",
  ")": "₎",
  "=": "₌",
  a: "ₐ",
  e: "ₑ",
  h: "ₕ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  x: "ₓ",
};

function converter(str: string, mapa: Record<string, string>): string | null {
  let out = "";
  for (const ch of str) {
    if (ch === " ") continue;
    const m = mapa[ch];
    if (!m) return null;
    out += m;
  }
  return out;
}

/** Remove itens duplicados (o PDF desenha a letra da alternativa duas vezes no mesmo lugar). */
export function semDuplicados(itens: ItemTexto[]): ItemTexto[] {
  const out: ItemTexto[] = [];
  for (const it of itens) {
    const igual = out.find(
      (o) => o.str === it.str && Math.abs(o.x0 - it.x0) < 1 && Math.abs(o.base - it.base) < 1,
    );
    if (!igual) out.push(it);
  }
  return out;
}

/** Agrupa itens em linhas pela linha de base; itens menores deslocados (índice, expoente) ficam na linha da vizinha. */
export function montarLinhas(
  itens: ItemTexto[],
  problemas?: string[],
  espacosDaPagina?: ItemTexto[],
): LinhaTexto[] {
  const validos = itens.filter((i) => i.str.length > 0 && !i.girado);
  // Itens de espaço (altura 0 no pdf.js) dizem onde o PDF pôs espaço entre palavras.
  const espacos = espacosDaPagina ?? validos.filter((i) => !i.str.trim());
  const temEspacoEntre = (a: ItemTexto, b: ItemTexto) =>
    // Espaço de largura zero é artefato do PDF (aparece colado em aspas e itálico), não separa palavras.
    espacos.some(
      (s) =>
        s.x1 - s.x0 > 0.1 &&
        Math.abs(s.base - b.base) < Math.max(2, b.tam * 0.5) &&
        s.x0 >= (a.tam < b.tam * 0.85 ? a.x0 - 6 : Math.min(a.x0 + 0.5, a.x1 - 1.5)) &&
        s.x0 <= b.x0 + 0.5,
    );
  const principais = validos.filter((i) => i.str.trim()).sort((a, b) => b.tam - a.tam);
  // Linhas-semente com os itens de fonte "normal" (os maiores), depois os pequenos procuram a linha vizinha.
  const grupos: ItemTexto[][] = [];
  const tamMediano = mediana(principais.map((i) => i.tam)) || 10;
  const ordenados = [...validos].sort((a, b) => a.base - b.base || a.x0 - b.x0);
  for (const it of ordenados) {
    if (!it.str.trim()) continue;
    if (it.tam < tamMediano * 0.85) continue;
    const g = grupos.find((gr) => Math.abs(gr[0].base - it.base) <= Math.max(1.5, it.tam * 0.3));
    if (g) g.push(it);
    else grupos.push([it]);
  }
  for (const it of ordenados) {
    if (!it.str.trim() || it.tam >= tamMediano * 0.85) continue;
    // Item pequeno: entra na linha cuja faixa vertical o contém e que tenha vizinho horizontal próximo.
    // Expoente sobe até ~0,6 do corpo; índice desce até ~0,45.
    // A comparação é com o vizinho colado (a linha pode juntar as duas colunas, com bases um pouco diferentes).
    const g = grupos.find((gr) =>
      gr.some((x) => {
        if (!(it.x0 - x.x1 < 4 && x.x0 - it.x1 < 4) || x.tam < it.tam) return false;
        const delta = x.base - it.base;
        return delta >= -0.45 * x.tam && delta <= 0.7 * x.tam;
      }),
    );
    if (g) g.push(it);
    else grupos.push([it]);
  }
  const linhas: LinhaTexto[] = [];
  for (const g of grupos) {
    const ord = semDuplicados(g).sort((a, b) => a.x0 - b.x0);
    const ref = ord.reduce((a, b) => (b.tam > a.tam ? b : a), ord[0]);
    let texto = "";
    let ant: ItemTexto | null = null;
    const alertas: string[] = [];
    const gx0 = Math.min(...ord.map((i) => i.x0));
    const gx1 = Math.max(...ord.map((i) => i.x1));
    const linhaComEspacos = espacos.some(
      (s) => s.x1 - s.x0 > 0.1 && Math.abs(s.base - ref.base) < 2 && s.x0 >= gx0 && s.x0 <= gx1,
    );
    for (const it of ord) {
      // Ligadura "fi"/"fl" que o mapa do PDF devolve com um espaço depois ("fi la", "fl uxo"): o impresso é "fila".
      let s = it.str.replace(/(^|[^A-Za-zÀ-ÿ])(ffi|ffl|ff|fi|fl) (?=[a-zà-ÿ])/g, "$1$2");
      const deslocUp = ref.base - it.base;
      if (
        it !== ref &&
        it.tam < ref.tam * 0.85 &&
        Math.abs(deslocUp) > ref.tam * 0.18 &&
        /\S/.test(s)
      ) {
        const conv = converter(s.trim(), deslocUp > 0 ? SOBRESCRITO : SUBSCRITO);
        if (conv !== null) s = conv;
        else {
          const alerta = `${deslocUp > 0 ? "sobrescrito" : "subscrito"} sem forma em texto: "${s.trim()}"`;
          alertas.push(alerta);
          problemas?.push(alerta);
        }
      }
      if (ant) {
        const folga = it.x0 - ant.x1;
        // Se o PDF marca os espaços com itens próprios, só eles (ou um vão grande) separam palavras: o vão de
        // ligadura ("fi" + "la") não pode virar espaço.
        const limiar = linhaComEspacos ? 0.45 : 0.2;
        const precisaEspaco =
          (folga > Math.min(ant.tam, it.tam) * limiar ||
            (folga > -0.5 && temEspacoEntre(ant, it))) &&
          !/\s$/.test(texto) &&
          !/^\s/.test(s);
        if (precisaEspaco) texto += " ";
      }
      texto += s;
      ant = it;
    }
    texto = texto.replace(/\s+/g, " ").trim();
    if (!texto) continue;
    // Fórmula química com dígito comum ("SiO2", "CO2"): alguns PDFs desenham o índice com deslocamento dentro do
    // mesmo item de texto, e o pdf.js entrega o dígito na linha. O impresso tem índice; a linha vira recorte.
    const formula = formulaSemIndice(texto);
    if (formula) alertas.push(`fórmula química sem índice no texto extraído: "${formula}"`);
    const x0 = Math.min(...ord.map((i) => i.x0));
    const x1 = Math.max(...ord.map((i) => i.x1));
    linhas.push({
      texto,
      itens: ord,
      espacos: espacos.filter(
        (s) => Math.abs(s.base - ref.base) < 2 && s.x0 >= x0 - 1 && s.x0 <= x1 + 1,
      ),
      alertas,
      base: ref.base,
      tam: ref.tam,
      x0: Math.min(...ord.map((i) => i.x0)),
      x1: Math.max(...ord.map((i) => i.x1)),
      y0: Math.min(...ord.map((i) => i.y0)),
      y1: Math.max(...ord.map((i) => i.y1)),
    });
  }
  return linhas.sort((a, b) => a.base - b.base || a.x0 - b.x0);
}

function mediana(v: number[]): number {
  if (!v.length) return 0;
  const s = [...v].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/** Coluna de uma caixa: 0 (esquerda), 1 (direita) ou -1 (largura total / cruza a calha). */
function colunaDe(c: Caixa, calha: number | null): number {
  if (calha === null) return -1;
  // Tolerância de 8 pt: borda clara de figura ou rótulo que passa um pouco da calha não faz a figura ser
  // de largura total (o que bagunçaria a ordem de leitura das duas colunas).
  if (c.x1 <= calha + 8) return 0;
  if (c.x0 >= calha - 8) return 1;
  return -1;
}

/**
 * Parte linhas que juntam as duas colunas na mesma altura (as colunas costumam ter a mesma linha de base):
 * corta onde a folga entre itens contém a calha.
 */
function partirNaCalha(itens: ItemTexto[], calha: number | null): ItemTexto[][] {
  if (calha === null) return [itens];
  const esq = itens.filter((i) => i.x1 <= calha + 2);
  const dir = itens.filter((i) => i.x0 >= calha - 2);
  const cruz = itens.filter((i) => i.x1 > calha + 2 && i.x0 < calha - 2);
  if (cruz.length) return [itens];
  return [esq, dir].filter((g) => g.length);
}

/** Fluxo de leitura de uma página: linhas e figuras na ordem. */
export function fluxoDaPagina(p: PaginaParaLer): ElementoFluxo[] {
  const dentro = p.itens.filter(
    (i) =>
      i.y0 >= p.faixa.topo - 1 &&
      i.y1 <= p.faixa.base + 1 &&
      i.x0 >= p.faixa.esq - 1 &&
      i.x1 <= p.faixa.dir + 1,
  );
  // Linhas brutas por base, depois partidas na calha.
  const espacos = dentro.filter((i) => !i.str.trim());
  const brutas = montarLinhas(dentro, undefined, espacos);
  const linhas: LinhaTexto[] = [];
  for (const l of brutas) {
    const partes = partirNaCalha(l.itens, p.calha);
    if (partes.length === 1) linhas.push(l);
    else for (const parte of partes) linhas.push(...montarLinhas(parte, undefined, espacos));
  }
  for (const l of linhas) {
    const toca = (p.marcas ?? []).some(
      (mc) => mc.x0 < l.x1 + 1.5 && l.x0 - 1.5 < mc.x1 && mc.y0 < l.y1 + 2 && l.y0 - 2 < mc.y1,
    );
    if (toca)
      l.alertas.push("símbolo ou traço desenhado junto do texto (fórmula, fração ou sublinhado)");
  }
  const elementos: ElementoFluxo[] = [
    ...linhas.map((linha) => ({
      tipo: "linha" as const,
      pagina: p.numero,
      coluna: colunaDe(linha, p.calha),
      linha,
    })),
    ...p.figuras.map((figura) => ({
      tipo: "figura" as const,
      pagina: p.numero,
      coluna: colunaDe(figura, p.calha),
      figura,
    })),
  ];
  const caixa = (e: ElementoFluxo): Caixa => (e.tipo === "linha" ? e.linha : e.figura);
  const largos = elementos.filter((e) => e.coluna === -1).sort((a, b) => caixa(a).y0 - caixa(b).y0);
  const estreitos = elementos.filter((e) => e.coluna !== -1);
  const out: ElementoFluxo[] = [];
  let topo = -Infinity;
  const despejar = (ate: number) => {
    const faixa = estreitos.filter((e) => {
      const c = caixa(e);
      const meio = (c.y0 + c.y1) / 2;
      return meio >= topo && meio < ate;
    });
    for (const col of [0, 1]) {
      out.push(...faixa.filter((e) => e.coluna === col).sort((a, b) => caixa(a).y0 - caixa(b).y0));
    }
  };
  for (const l of largos) {
    const c = caixa(l);
    despejar((c.y0 + c.y1) / 2);
    out.push(l);
    topo = (c.y0 + c.y1) / 2;
  }
  despejar(Infinity);
  return out;
}

const RE_CABECALHO_AREA = [
  /^(LINGUAGENS, CÓDIGOS|CIÊNCIAS HUMANAS|CIÊNCIAS DA NATUREZA|MATEMÁTICA)( E SUAS TECNOLOGIAS)?$/i,
  /^E SUAS TECNOLOGIAS$/i,
  /^Questões de \d{1,3} a \d{1,3}( \(opção:? ?(inglês|espanhol)\))?$/i,
];
const RE_OPCAO = /\(opção:? ?(inglês|espanhol)\)/i;
const RE_TEXTO_COMPARTILHADO = /^Texto para as questões de (\d{1,3}) a (\d{1,3})\.?$/i;
const RE_CREDITO =
  /(Disponível em|Acesso em|\((adaptado|fragmento|adaptada)\)|^[A-ZÀ-Ý][A-ZÀ-Ý'’\- ]+, [A-ZÀ-Ý]\.|In: )/;

function numeroDoMarcador(texto: string): number | null {
  if (!RE_MARCADOR_QUESTAO.test(texto)) return null;
  const m = texto.match(/(\d{1,3})\s*$/);
  return m ? Number(m[1]) : null;
}

interface Trecho {
  numero: number;
  idioma?: Idioma;
  elementos: ElementoFluxo[];
}

/** Corta o fluxo do caderno em trechos por questão; texto "para as questões X a Y" vira trecho compartilhado. */
export function trechosPorQuestao(fluxo: ElementoFluxo[]): {
  trechos: Trecho[];
  compartilhados: Map<number, ElementoFluxo[]>;
} {
  const trechos: Trecho[] = [];
  const compartilhados = new Map<number, ElementoFluxo[]>();
  let idioma: Idioma | undefined;
  let atual: Trecho | null = null;
  let compart: { de: number; ate: number; elementos: ElementoFluxo[] } | null = null;
  const fecharCompart = () => {
    if (compart)
      for (let n = compart.de; n <= compart.ate; n++) compartilhados.set(n, compart.elementos);
    compart = null;
  };
  for (const e of fluxo) {
    if (e.tipo === "linha") {
      const t = e.linha.texto;
      const op = t.match(RE_OPCAO);
      if (op && /^Questões de/i.test(t))
        idioma = op[1].toLowerCase().startsWith("ingl") ? "ingles" : "espanhol";
      if (RE_CABECALHO_AREA.some((re) => re.test(t))) {
        if (/^Questões de (0?6|46|91|136) /i.test(t)) idioma = undefined;
        continue;
      }
      const tc = t.match(RE_TEXTO_COMPARTILHADO);
      if (tc) {
        fecharCompart();
        atual = null;
        compart = { de: Number(tc[1]), ate: Number(tc[2]), elementos: [] };
        continue;
      }
      const n = numeroDoMarcador(t);
      if (n !== null) {
        fecharCompart();
        if (n > 5) idioma = undefined;
        atual = { numero: n, idioma: n <= 5 ? idioma : undefined, elementos: [] };
        trechos.push(atual);
        continue;
      }
    }
    if (compart) compart.elementos.push(e);
    else if (atual) atual.elementos.push(e);
  }
  fecharCompart();
  return { trechos, compartilhados };
}

function terminaFrase(t: string): boolean {
  return /[.!?:;”"»)]$/.test(t.trim());
}

/** Junta linhas de texto em parágrafos (prosa justificada vira parágrafo; verso e lista mantêm a quebra). */
export function textoDasLinhas(linhas: LinhaTexto[]): string {
  if (!linhas.length) return "";
  const esq = Math.min(...linhas.map((l) => l.x0));
  const dir = Math.max(...linhas.map((l) => l.x1));
  const gaps: number[] = [];
  for (let i = 1; i < linhas.length; i++) {
    const g = linhas[i].base - linhas[i - 1].base;
    if (g > 0) gaps.push(g);
  }
  const passo = mediana(gaps) || linhas[0].tam * 1.2;
  // Bloco justificado: boa parte das linhas chega à margem direita. Em verso ou lista, nenhuma linha é "cheia".
  const chegam = linhas.filter((l) => l.x1 >= dir - 8).length;
  const justificado =
    linhas.length < 3 || chegam / linhas.length >= 0.4 || (chegam >= 1 && linhas.length <= 4);
  let out = linhas[0].texto;
  for (let i = 1; i < linhas.length; i++) {
    const a = linhas[i - 1];
    const b = linhas[i];
    const gap = b.base - a.base;
    const cheia = justificado && a.x1 >= dir - 8;
    const recuada = b.x0 > a.x0 + 6; // recuo de primeira linha em relação à linha de cima
    const pequenaMudou = Math.abs(a.tam - b.tam) > 1;
    let sep: string;
    if (gap < 0 || gap > passo * 1.2 || pequenaMudou) sep = "\n\n";
    else if (cheia && !recuada) sep = " ";
    else if (recuada && terminaFrase(a.texto)) sep = "\n\n";
    else sep = "\n";
    if (sep === " " && /[A-Za-zÀ-ÿ]-$/.test(out) && /^[a-zà-ÿ]/.test(b.texto)) {
      out = out.slice(0, -1) + b.texto; // hifenização de fim de linha
    } else out += sep + b.texto;
  }
  return out;
}

/** Texto de um conjunto de itens na ordem de leitura (para a conferência de similaridade). */
function brutoDe(elementos: ElementoFluxo[], letras: Set<string>): string {
  return elementos
    .map((e) =>
      e.tipo === "linha"
        ? e.linha.itens
            .filter((i) => !(letras.has(i.fonte) && /^[A-E]$/.test(i.str.trim())))
            .map((i) => i.str)
            .join("")
        : e.figura.textos.join(""),
    )
    .join("");
}

/** Do fluxo das páginas às questões. */
export function extrairQuestoes(paginas: PaginaParaLer[], letras: Set<string>): QuestaoExtraida[] {
  const fluxo = paginas.flatMap(fluxoDaPagina);
  const { trechos, compartilhados } = trechosPorQuestao(fluxo);
  const marcasPorPagina = new Map(paginas.map((p) => [p.numero, p.marcas ?? []]));
  return trechos.map((t) =>
    montarQuestao(t, letras, compartilhados.get(t.numero), marcasPorPagina),
  );
}

/**
 * Tinta que não é texto nem figura dentro da área da questão (coluna por coluna): texto desenhado como contorno,
 * símbolo, traço de fração. O texto extraído não teria esse pedaço, então a questão fica fora.
 */
function temMarcaNaArea(
  elementos: ElementoFluxo[],
  marcasPorPagina: Map<number, Caixa[]>,
): boolean {
  const areas = new Map<string, Caixa & { pagina: number }>();
  for (const e of elementos) {
    const c = e.tipo === "linha" ? e.linha : e.figura;
    const k = `${e.pagina}:${e.coluna}`;
    const a = areas.get(k);
    areas.set(
      k,
      a
        ? {
            pagina: e.pagina,
            x0: Math.min(a.x0, c.x0),
            y0: Math.min(a.y0, c.y0),
            x1: Math.max(a.x1, c.x1),
            y1: Math.max(a.y1, c.y1),
          }
        : { pagina: e.pagina, x0: c.x0, y0: c.y0, x1: c.x1, y1: c.y1 },
    );
  }
  return [...areas.values()].some((a) =>
    (marcasPorPagina.get(a.pagina) ?? []).some(
      (m) => m.x0 >= a.x0 - 2 && m.x1 <= a.x1 + 2 && m.y0 >= a.y0 - 2 && m.y1 <= a.y1 + 2,
    ),
  );
}

interface MarcadorAlt {
  letra: (typeof LETRAS)[number];
  item: ItemTexto;
  elemento: number;
}

/** Monta a questão a partir do trecho do fluxo. */
export function montarQuestao(
  trecho: Trecho,
  letras: Set<string>,
  compartilhado: ElementoFluxo[] | undefined,
  marcasPorPagina: Map<number, Caixa[]> = new Map(),
): QuestaoExtraida {
  const problemas: string[] = [];
  const els = trecho.elementos;
  // Marcadores A–E (fonte própria das letras), em ordem de leitura.
  const marcadores: MarcadorAlt[] = [];
  els.forEach((e, idx) => {
    if (e.tipo !== "linha") return;
    e.linha.itens.forEach((it, k) => {
      if (!letras.has(it.fonte) || !/^[A-E]$/.test(it.str.trim())) return;
      // Letra de alternativa abre a linha ou vem depois de um vão (alternativas lado a lado).
      const ant = e.linha.itens
        .slice(0, k)
        .filter((x) => !(letras.has(x.fonte) && x.str === it.str && Math.abs(x.x0 - it.x0) < 1));
      const vao = ant.length === 0 || it.x0 - Math.max(...ant.map((x) => x.x1)) >= 8;
      if (vao)
        marcadores.push({ letra: it.str.trim() as MarcadorAlt["letra"], item: it, elemento: idx });
    });
  });
  // Última sequência completa A,B,C,D,E.
  let seq: MarcadorAlt[] | null = null;
  for (let i = 0; i + 5 <= marcadores.length; i++) {
    const s = marcadores.slice(i, i + 5);
    if (s.every((m, k) => m.letra === LETRAS[k])) seq = s;
  }
  // Alternativas em grade (A e D na mesma altura): a ordem de leitura não é A–E, mas cada letra aparece uma vez.
  if (
    !seq &&
    marcadores.length === 5 &&
    LETRAS.every((l) => marcadores.filter((m) => m.letra === l).length === 1)
  ) {
    seq = LETRAS.map((l) => marcadores.find((m) => m.letra === l)!);
  }
  const regioes = new Map<number, Caixa>();
  for (const e of [...(compartilhado ?? []), ...els]) {
    const c = e.tipo === "linha" ? e.linha : e.figura;
    const r = regioes.get(e.pagina);
    regioes.set(
      e.pagina,
      r
        ? {
            x0: Math.min(r.x0, c.x0),
            y0: Math.min(r.y0, c.y0),
            x1: Math.max(r.x1, c.x1),
            y1: Math.max(r.y1, c.y1),
          }
        : { x0: c.x0, y0: c.y0, x1: c.x1, y1: c.y1 },
    );
  }
  const base: QuestaoExtraida = {
    numero: trecho.numero,
    idioma: trecho.idioma,
    blocos: [],
    alternativas: [],
    creditos: [],
    regioes: [...regioes].map(([pagina, c]) => ({ pagina, ...c })),
    textoBruto: brutoDe([...(compartilhado ?? []), ...els], letras),
    problemas,
  };
  if (!seq) {
    problemas.push("alternativas A–E não encontradas");
    return base;
  }

  // Figuras de alternativa: à direita da letra, na faixa vertical dela.
  const usadas = new Set<FiguraDetectada>();
  const alternativas: Alternativa[] = LETRAS.map((letra) => ({ letra, texto: "", figuras: [] }));
  const inicioAlternativas = Math.min(...seq.map((m) => m.elemento));
  const figurasDaQuestao = els.filter(
    (e): e is Extract<ElementoFluxo, { tipo: "figura" }> => e.tipo === "figura",
  );
  for (const fe of figurasDaQuestao) {
    const f = fe.figura;
    const aEsquerda = seq.filter(
      (m) =>
        els[m.elemento].pagina === fe.pagina &&
        f.x0 >= m.item.x1 - 2 &&
        m.item.y1 >= f.y0 - 4 &&
        m.item.y0 <= f.y1 + 4 &&
        colunaIgual(els[m.elemento], fe),
    );
    if (!aEsquerda.length) continue;
    // Só as letras da coluna de letras mais próxima da figura (em grade, a letra D está mais perto que a A).
    const xMaisPerto = Math.max(...aEsquerda.map((m) => m.item.x1));
    const candidatos = aEsquerda.filter((m) => m.item.x1 >= xMaisPerto - 5);
    const cobertas = candidatos.filter((m) => {
      const c = (m.item.y0 + m.item.y1) / 2;
      return c > f.y0 && c < f.y1;
    });
    if (cobertas.length > 1)
      problemas.push(`uma figura cobre as alternativas ${cobertas.map((m) => m.letra).join(", ")}`);
    // Letra cujo centro está mais perto do centro da figura.
    const cy = (f.y0 + f.y1) / 2;
    const m = candidatos.reduce((a, b) =>
      Math.abs((b.item.y0 + b.item.y1) / 2 - cy) < Math.abs((a.item.y0 + a.item.y1) / 2 - cy)
        ? b
        : a,
    );
    alternativas[LETRAS.indexOf(m.letra)].figuras.push(f);
    usadas.add(f);
  }

  // Texto das alternativas: depois da letra, até a próxima letra; linhas de continuação alinhadas ao texto.
  let fimUsado = Math.max(...seq.map((m) => m.elemento));
  for (let k = 0; k < 5; k++) {
    const m = seq[k];
    const prox = seq[k + 1];
    const linhaIni = els[m.elemento] as Extract<ElementoFluxo, { tipo: "linha" }>;
    const partes: string[] = [];
    // Corta na próxima letra da mesma linha (alternativas lado a lado).
    const vizinha = seq
      .filter((o) => o !== m && o.elemento === m.elemento && o.item.x0 > m.item.x0)
      .reduce<number>((min, o) => Math.min(min, o.item.x0), Infinity);
    const itensDepois = linhaIni.linha.itens.filter(
      (i) =>
        i.x0 > m.item.x0 + 0.5 &&
        i.x0 < vizinha - 0.5 &&
        !(letras.has(i.fonte) && /^[A-E]$/.test(i.str.trim())),
    );
    if (itensDepois.length)
      partes.push(montarLinhas(itensDepois, undefined, linhaIni.linha.espacos)[0]?.texto ?? "");
    const xTexto = itensDepois.length ? Math.min(...itensDepois.map((i) => i.x0)) : m.item.x1 + 4;
    let anterior: LinhaTexto = linhaIni.linha;
    const fim = prox && prox.elemento > m.elemento ? prox.elemento : els.length;
    for (let j = m.elemento + 1; j < fim; j++) {
      const e = els[j];
      if (e.tipo !== "linha") continue;
      const l = e.linha;
      const mesmaColuna = e.pagina === linhaIni.pagina && e.coluna === linhaIni.coluna;
      const continua =
        mesmaColuna &&
        Math.abs(l.x0 - xTexto) <= 4 &&
        l.base - anterior.base > 0 &&
        l.base - anterior.base <= anterior.tam * 1.9;
      if (!continua) break;
      partes.push(l.texto);
      anterior = l;
      fimUsado = Math.max(fimUsado, j);
    }
    let texto = "";
    for (const p of partes) {
      if (!p) continue;
      if (texto && /[A-Za-zÀ-ÿ]-$/.test(texto) && /^[a-zà-ÿ]/.test(p))
        texto = texto.slice(0, -1) + p;
      else texto = texto ? `${texto} ${p}` : p;
    }
    alternativas[k].texto = texto.trim();
  }

  // Enunciado: elementos antes da letra A (menos figuras de alternativa), com o texto compartilhado na frente.
  const blocos: QuestaoExtraida["blocos"] = [];
  const creditos: string[] = [];
  const doEnunciadoBruto = [...(compartilhado ?? []), ...els.slice(0, inicioAlternativas)].filter(
    (e) => !(e.tipo === "figura" && usadas.has(e.figura)),
  );
  const {
    elementos: doEnunciado,
    recortes,
    convertidas,
  } = trechosDeFormula(doEnunciadoBruto, marcasPorPagina);
  const tamCorpo =
    mediana(
      doEnunciado
        .filter((e): e is Extract<ElementoFluxo, { tipo: "linha" }> => e.tipo === "linha")
        .map((e) => e.linha.tam),
    ) || 10;
  let buffer: LinhaTexto[] = [];
  let ultimaFigura: { tipo: "figura"; figura: FiguraDetectada; credito?: string } | null = null;
  const despejar = () => {
    if (!buffer.length) return;
    // Crédito logo abaixo da figura vira legenda dela.
    if (ultimaFigura && !ultimaFigura.credito) {
      const cred: LinhaTexto[] = [];
      while (
        buffer.length &&
        buffer[0].tam < tamCorpo * 0.88 &&
        (cred.length || RE_CREDITO.test(buffer[0].texto))
      )
        cred.push(buffer.shift()!);
      if (cred.length) {
        ultimaFigura.credito = textoDasLinhas(cred).replace(/\n+/g, " ");
        creditos.push(ultimaFigura.credito);
      }
    }
    ultimaFigura = null;
    if (!buffer.length) return;
    // Grupos por coluna/página (não junta linhas de colunas diferentes no mesmo parágrafo).
    const t = textoPorBlocosDeColuna(buffer);
    for (const l of buffer)
      if (l.tam < tamCorpo * 0.88 && RE_CREDITO.test(l.texto)) creditos.push(l.texto);
    if (t.trim()) blocos.push({ tipo: "texto", texto: t });
    buffer = [];
  };
  for (const e of doEnunciado) {
    if (e.tipo === "linha") buffer.push(e.linha);
    else {
      despejar();
      const bloco = { tipo: "figura" as const, figura: e.figura };
      blocos.push(bloco);
      ultimaFigura = bloco;
    }
  }
  despejar();

  // Conferência de similaridade só sobre o que pertence à questão (sem o que vem depois da alternativa E).
  const usadosNoFim = els
    .slice(0, fimUsado + 1)
    .filter((e) => e.tipo === "linha" || usadas.has(e.figura) || doEnunciadoBruto.includes(e));
  base.textoBruto = brutoDe([...(compartilhado ?? []), ...usadosNoFim], letras);
  // Recorte do relatório: por página e coluna, só o que é da questão.
  const porColuna = new Map<string, Caixa & { pagina: number }>();
  for (const e of [...(compartilhado ?? []), ...usadosNoFim]) {
    const c = e.tipo === "linha" ? e.linha : e.figura;
    const k = `${e.pagina}:${e.coluna}`;
    const r = porColuna.get(k);
    porColuna.set(
      k,
      r
        ? {
            pagina: e.pagina,
            x0: Math.min(r.x0, c.x0),
            y0: Math.min(r.y0, c.y0),
            x1: Math.max(r.x1, c.x1),
            y1: Math.max(r.y1, c.y1),
          }
        : { pagina: e.pagina, x0: c.x0, y0: c.y0, x1: c.x1, y1: c.y1 },
    );
  }
  base.regioes = [...porColuna.values()];
  for (const e of [...(compartilhado ?? []), ...usadosNoFim]) {
    if (e.tipo === "linha" && !convertidas.has(e.linha))
      for (const a of e.linha.alertas) if (!problemas.includes(a)) problemas.push(a);
  }
  // Marca coberta por um recorte de fórmula já está na imagem.
  const marcasRestantes = new Map(
    [...marcasPorPagina].map(([p, ms]) => [
      p,
      ms.filter(
        (m) =>
          !recortes.some(
            (r) =>
              r.pagina === p &&
              m.x0 < r.x1 + 1 &&
              r.x0 - 1 < m.x1 &&
              m.y0 < r.y1 + 1 &&
              r.y0 - 1 < m.y1,
          ),
      ),
    ]),
  );
  const semConvertidas = [...(compartilhado ?? []), ...usadosNoFim].filter(
    (e) => !(e.tipo === "linha" && convertidas.has(e.linha)),
  );
  if (
    temMarcaNaArea(semConvertidas, marcasRestantes) &&
    !problemas.some((p) => p.startsWith("símbolo"))
  ) {
    problemas.push("símbolo ou traço desenhado junto do texto (fórmula, fração ou sublinhado)");
  }
  for (const e of doEnunciado)
    if (e.tipo === "figura" && e.figura.suspeita)
      problemas.push(`recorte incompleto: ${e.figura.suspeita}`);
  // Linha curtinha sem palavra (índice "2", sinal) logo junto de uma figura: pedaço de fórmula que escapou do recorte.
  const figurasEnun = doEnunciado.filter(
    (e): e is Extract<ElementoFluxo, { tipo: "figura" }> => e.tipo === "figura",
  );
  for (const e of doEnunciado) {
    if (e.tipo !== "linha" || convertidas.has(e.linha)) continue;
    const t = e.linha.texto.replace(/\s/g, "");
    if (t.length > 6 || /[A-Za-zÀ-ÿ]{3}/.test(t)) continue;
    const perto = figurasEnun.some(
      (f) =>
        f.pagina === e.pagina &&
        e.linha.x0 < f.figura.x1 + 8 &&
        f.figura.x0 - 8 < e.linha.x1 &&
        e.linha.y0 < f.figura.y1 + 8 &&
        f.figura.y0 - 8 < e.linha.y1,
    );
    if (perto) {
      problemas.push(
        `texto solto "${e.linha.texto}" junto de uma figura (pedaço de fórmula fora do recorte)`,
      );
      break;
    }
  }
  for (const f of usadas) if (f.suspeita) problemas.push(`recorte incompleto: ${f.suspeita}`);
  const semLugar = els
    .slice(inicioAlternativas, fimUsado + 1)
    .filter((e) => e.tipo === "figura" && !usadas.has(e.figura));
  if (semLugar.length) problemas.push("figura entre as alternativas sem alternativa dona");
  // Linhas encavaladas (fração ou expressão em dois andares): o texto corrido perderia a estrutura.
  const linhasUsadas = semConvertidas.filter(
    (e): e is Extract<ElementoFluxo, { tipo: "linha" }> => e.tipo === "linha",
  );
  for (let i = 1; i < linhasUsadas.length; i++) {
    const a = linhasUsadas[i - 1];
    const b = linhasUsadas[i];
    if (a.pagina !== b.pagina || a.coluna !== b.coluna) continue;
    const gap = b.linha.base - a.linha.base;
    if (gap > 0 && gap < Math.min(a.linha.tam, b.linha.tam) * 0.9) {
      problemas.push("linhas encavaladas (fração ou fórmula em dois andares)");
      break;
    }
  }
  base.blocos = blocos;
  base.alternativas = alternativas;
  base.creditos = creditos;
  if (!blocos.length) problemas.push("enunciado vazio");
  return base;
}

/**
 * Trechos de fórmula do enunciado viram recorte (spec 50 §5.9.2 passo 3: "fórmulas ficam em texto ou, se não
 * extraíveis, como imagem do trecho"). Linha com alerta (índice sem forma Unicode, símbolo desenhado), linhas
 * encavaladas (fração em dois andares) e linha encostada numa marca de tinta são agrupadas em sequência e
 * trocadas por uma figura sintética com a caixa delas — os pixels do original, sem retoque.
 */
export function trechosDeFormula(
  elementos: ElementoFluxo[],
  marcasPorPagina: Map<number, Caixa[]>,
): { elementos: ElementoFluxo[]; recortes: FiguraDetectada[]; convertidas: Set<LinhaTexto> } {
  const formula = new Set<LinhaTexto>();
  const linhas = elementos.filter(
    (e): e is Extract<ElementoFluxo, { tipo: "linha" }> => e.tipo === "linha",
  );
  for (const e of linhas) if (e.linha.alertas.length) formula.add(e.linha);
  for (let i = 1; i < linhas.length; i++) {
    const a = linhas[i - 1];
    const b = linhas[i];
    if (a.pagina !== b.pagina || a.coluna !== b.coluna) continue;
    // Sem exigir sobreposição horizontal: numerador e denominador ficam à direita do "R =" da mesma linha.
    const gap = b.linha.base - a.linha.base;
    if (gap > 0 && gap < Math.min(a.linha.tam, b.linha.tam) * 0.9) {
      formula.add(a.linha);
      formula.add(b.linha);
    }
  }
  const marcasDe = (e: Extract<ElementoFluxo, { tipo: "linha" }>) =>
    (marcasPorPagina.get(e.pagina) ?? []).filter(
      (m) =>
        m.x0 < e.linha.x1 + 2 &&
        e.linha.x0 - 2 < m.x1 &&
        m.y0 < e.linha.y1 + 5 &&
        e.linha.y0 - 5 < m.y1,
    );
  for (const e of linhas) if (marcasDe(e).length) formula.add(e.linha);

  const out: ElementoFluxo[] = [];
  const recortes: FiguraDetectada[] = [];
  let grupo: Array<Extract<ElementoFluxo, { tipo: "linha" }>> = [];
  const fechar = () => {
    if (!grupo.length) return;
    // Caixa justa na altura da linha (sem pegar pedaço da linha de cima ou de baixo).
    const caixas: Caixa[] = grupo.flatMap((e) => [
      {
        x0: e.linha.x0,
        x1: e.linha.x1,
        y0: e.linha.base - 0.92 * e.linha.tam,
        y1: e.linha.base + 0.28 * e.linha.tam,
      },
      ...marcasDe(e),
    ]);
    const f: FiguraDetectada = {
      pagina: grupo[0].pagina,
      x0: Math.min(...caixas.map((c) => c.x0)) - 1,
      y0: Math.min(...caixas.map((c) => c.y0)),
      x1: Math.max(...caixas.map((c) => c.x1)) + 1,
      y1: Math.max(...caixas.map((c) => c.y1)),
      textos: [grupo.map((e) => e.linha.itens.map((i) => i.str).join("")).join("")],
      sintetica: true,
    };
    recortes.push(f);
    out.push({ tipo: "figura", pagina: f.pagina, coluna: grupo[0].coluna, figura: f });
    grupo = [];
  };
  for (const e of elementos) {
    if (e.tipo === "linha" && formula.has(e.linha)) {
      const ant = grupo[grupo.length - 1];
      if (ant && (ant.pagina !== e.pagina || ant.coluna !== e.coluna)) fechar();
      grupo.push(e);
      continue;
    }
    fechar();
    out.push(e);
  }
  fechar();
  return { elementos: out, recortes, convertidas: formula };
}

function colunaIgual(a: ElementoFluxo, b: ElementoFluxo): boolean {
  return a.pagina === b.pagina && (a.coluna === b.coluna || a.coluna === -1 || b.coluna === -1);
}

/** Parágrafos por bloco contínuo; mudança de coluna/página continua o parágrafo se a linha anterior era cheia. */
function textoPorBlocosDeColuna(linhas: LinhaTexto[]): string {
  const grupos: LinhaTexto[][] = [];
  for (const l of linhas) {
    const g = grupos[grupos.length - 1];
    const ant = g?.[g.length - 1];
    // Nova coluna: a linha sobe em relação à anterior.
    if (!ant || l.base < ant.base - 1) grupos.push([l]);
    else g.push(l);
  }
  let out = "";
  for (const g of grupos) {
    const t = textoDasLinhas(g);
    if (!out) out = t;
    else {
      const ultimaLinha = out.split("\n").pop() ?? "";
      out += terminaFrase(ultimaLinha) ? `\n\n${t}` : ` ${t}`;
    }
  }
  return out;
}

/** Caracteres que indicam extração quebrada (fonte sem mapa Unicode). */
export function caracteresQuebrados(texto: string): string | null {
  // eslint-disable-next-line no-control-regex -- caractere de controle = fonte quebrada
  const m = texto.match(/[�\u0000-\u0008\u000B\u000C\u000E-\u001F-]/);
  return m
    ? `caractere inválido U+${m[0].codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`
    : null;
}

/**
 * Texto ilegível: PDF com fonte sem mapa Unicode devolve lixo como "H  x (  8  (". Em português, palavra de
 * um caractere quase sempre é artigo, preposição ou conjunção (a, e, o, é, à) ou número; no lixo, não.
 */
export function textoIlegivel(texto: string): boolean {
  const tokens = texto.split(/\s+/).filter(Boolean);
  if (tokens.length < 8) return false;
  const estranhos = tokens.filter(
    (t) => t.length === 1 && !/^[aeoéàAEOÉÀyY0-9–—•-]$/.test(t),
  ).length;
  const semLetra = tokens.filter(
    (t) => !/[\p{L}\p{N}]/u.test(t) && !/^[–—•\-…"“”'’()[\].,;:!?/%=+×÷<>≤≥]+$/.test(t),
  ).length;
  return (estranhos + semLetra) / tokens.length > 0.2;
}

/** Dice de bigramas de caracteres, ignorando espaço e caixa. */
export function similaridade(a: string, b: string): number {
  const volta = new Map<string, string>();
  for (const [k, v] of Object.entries(SOBRESCRITO)) volta.set(v, k);
  for (const [k, v] of Object.entries(SUBSCRITO)) volta.set(v, k);
  const norm = (s: string) =>
    [...s.replace(/\s+/g, "").toLowerCase()].map((ch) => volta.get(ch) ?? ch).join("");
  const bi = (s: string) => {
    const m = new Map<string, number>();
    for (let i = 0; i + 1 < s.length; i++) {
      const k = s.slice(i, i + 2);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };
  const x = bi(norm(a));
  const y = bi(norm(b));
  let comum = 0;
  let total = 0;
  for (const [k, v] of x) {
    comum += Math.min(v, y.get(k) ?? 0);
    total += v;
  }
  for (const v of y.values()) total += v;
  return total === 0 ? 1 : (2 * comum) / total;
}
