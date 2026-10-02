/**
 * Marcadores de posição de mídia no enunciado (spec 50 §5.9.3).
 *
 * `pergunta`/`texto` podem ter, numa linha só deles, `[[imagem:N]]` ou `[[tabela:N]]` (N = índice em
 * `imagens`/`tabelas`). Eles marcam onde a figura ou a tabela aparece no original. Funções puras: usadas pelo
 * player (`EnunciadoComMidia`) e pelo validador do pipeline.
 */
export type SegmentoEnunciado =
  | { tipo: "texto"; texto: string }
  | { tipo: "imagem"; indice: number }
  | { tipo: "tabela"; indice: number };

/** Linha que é só um marcador (espaços em volta tolerados). */
const RE_LINHA_MARCADOR = /^\s*\[\[(imagem|tabela):(\d+)\]\]\s*$/;
/** Qualquer marcador, inclusive no meio de uma linha (o validador recusa esse caso). */
const RE_MARCADOR_GLOBAL = /\[\[(imagem|tabela):(\d+)\]\]/g;

export interface MarcadorEncontrado {
  tipo: "imagem" | "tabela";
  indice: number;
  /** `true` quando o marcador ocupa a linha inteira (o único formato aceito). */
  linhaPropria: boolean;
}

/** Todos os marcadores do texto, na ordem. */
export function marcadoresDe(texto: string): MarcadorEncontrado[] {
  const out: MarcadorEncontrado[] = [];
  for (const linha of texto.split("\n")) {
    const propria = RE_LINHA_MARCADOR.test(linha);
    for (const m of linha.matchAll(RE_MARCADOR_GLOBAL)) {
      out.push({ tipo: m[1] as "imagem" | "tabela", indice: Number(m[2]), linhaPropria: propria });
    }
  }
  return out;
}

/** Texto sem os marcadores (para contar palavras, comparar e ler em voz alta). */
export function semMarcadores(texto: string): string {
  return texto
    .split("\n")
    .filter((linha) => !RE_LINHA_MARCADOR.test(linha))
    .join("\n")
    .replace(RE_MARCADOR_GLOBAL, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Divide o texto pelos marcadores em linha própria, intercalando trechos de texto e mídia. Trechos vazios
 * somem; quebras de linha dentro de um trecho ficam como estão. Marcador no meio de uma linha não divide
 * (o validador já recusa esse formato).
 */
export function dividirPorMarcadores(texto: string): SegmentoEnunciado[] {
  const out: SegmentoEnunciado[] = [];
  let buffer: string[] = [];
  const despejar = () => {
    const t = buffer.join("\n").replace(/^\n+|\n+$/g, "");
    if (t.trim()) out.push({ tipo: "texto", texto: t });
    buffer = [];
  };
  for (const linha of texto.split("\n")) {
    const m = RE_LINHA_MARCADOR.exec(linha);
    if (m) {
      despejar();
      out.push({ tipo: m[1] as "imagem" | "tabela", indice: Number(m[2]) });
    } else buffer.push(linha);
  }
  despejar();
  return out;
}

/** Índices de imagens/tabelas que algum marcador cita (nos textos dados). */
export function indicesCitados(textos: Array<string | undefined>): {
  imagens: Set<number>;
  tabelas: Set<number>;
} {
  const imagens = new Set<number>();
  const tabelas = new Set<number>();
  for (const t of textos) {
    if (!t) continue;
    for (const m of marcadoresDe(t)) (m.tipo === "imagem" ? imagens : tabelas).add(m.indice);
  }
  return { imagens, tabelas };
}
