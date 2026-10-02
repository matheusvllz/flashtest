/**
 * Tipos do importador do INEP (spec 50 §5.9.2). Coordenadas em pontos de PDF com origem no TOPO da página
 * (y cresce para baixo), para casar com a imagem renderizada.
 */

export interface Caixa {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface ItemTexto extends Caixa {
  str: string;
  /** Linha de base (topo = 0). */
  base: number;
  /** Tamanho da fonte (altura do item no pdf.js). */
  tam: number;
  fonte: string;
  /** Texto girado (rótulo de eixo de gráfico, por exemplo). */
  girado: boolean;
}

export interface PaginaPdf {
  numero: number;
  largura: number;
  altura: number;
  itens: ItemTexto[];
}

export interface FiguraDetectada extends Caixa {
  pagina: number;
  /** Textos que ficaram dentro da figura (rótulos, falas, texto de cartaz), na ordem de leitura. */
  textos: string[];
  /**
   * Recorte de um trecho de texto com fórmula (símbolo desenhado, fração em dois andares, índice sem forma
   * Unicode): o texto extraído perderia a estrutura, então o trecho entra como imagem do original. Os `textos`
   * servem só para a conferência de similaridade, nunca como descrição.
   */
  sintetica?: boolean;
  /** Itens de texto que ficaram dentro da figura (para montar tabela). */
  itens?: ItemTexto[];
  /**
   * Tabela com fios desenhados e texto extraível, conferida contra o recorte: todo texto da figura cai numa célula
   * e não há outra tinta além dos fios. Vira `tabelas[]` no item.
   */
  tabela?: { cabecalho: string[]; linhas: string[][] };
  /** Motivo para desconfiar do recorte (texto encostado que ficou de fora). Questão com figura suspeita não entra. */
  suspeita?: string;
}

/** Elemento do fluxo de leitura de uma questão. */
export type ElementoFluxo =
  | { tipo: "linha"; pagina: number; coluna: number; linha: LinhaTexto }
  | { tipo: "figura"; pagina: number; coluna: number; figura: FiguraDetectada };

export interface LinhaTexto extends Caixa {
  texto: string;
  itens: ItemTexto[];
  base: number;
  tam: number;
  /** Itens de espaço do PDF nesta linha (para remontar trechos dela). */
  espacos: ItemTexto[];
  /** O que não deu para representar em texto (expoente sem forma Unicode, símbolo desenhado). */
  alertas: string[];
}

export type Idioma = "ingles" | "espanhol";

export interface Alternativa {
  letra: "A" | "B" | "C" | "D" | "E";
  texto: string;
  figuras: FiguraDetectada[];
}

export interface QuestaoExtraida {
  numero: number;
  idioma?: Idioma;
  /** Blocos do enunciado na ordem (texto com quebras, figura ou tabela). */
  blocos: Array<
    { tipo: "texto"; texto: string } | { tipo: "figura"; figura: FiguraDetectada; credito?: string }
  >;
  alternativas: Alternativa[];
  /** Créditos impressos achados no enunciado ("Disponível em…", "AUTOR. Obra…"). */
  creditos: string[];
  /** Páginas e caixas que a questão ocupa (para o recorte do relatório). */
  regioes: Array<{ pagina: number } & Caixa>;
  /** Todo o texto da região da questão, como o PDF entrega, para a conferência de similaridade. */
  textoBruto: string;
  problemas: string[];
}

export interface GabaritoEntrada {
  numero: number;
  /** Uma resposta; nas questões 1–5 do 1º dia vêm duas (inglês, espanhol). */
  respostas: Array<"A" | "B" | "C" | "D" | "E" | "ANULADA">;
}
