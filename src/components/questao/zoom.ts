/**
 * Contas do visualizador de imagem da questão (spec 50 §5.9.3): zoom de 1× a 4×, deslocamento limitado
 * à área visível e zoom em torno de um ponto (pinça, roda, duplo toque). Funções puras, testadas em
 * `tests/unit/questao-zoom.test.ts`; o componente só guarda o estado e mede a tela.
 */

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 4;
/** Passo dos botões −/+ e das teclas +/−. */
export const ZOOM_PASSO = 0.5;
/** Atalhos de zoom exibidos como botões. */
export const ZOOM_ATALHOS = [1, 2, 3] as const;

/** Proporção largura/altura a partir da qual a imagem conta como "larga" (aviso de girar o celular). */
export const PROPORCAO_LARGA = 1.6;

export interface Ponto {
  x: number;
  y: number;
}

export interface Tamanho {
  w: number;
  h: number;
}

export interface EstadoZoom {
  zoom: number;
  /** Deslocamento da imagem em px, a partir do centro da área. */
  x: number;
  y: number;
}

export const ZOOM_INICIAL: EstadoZoom = { zoom: 1, x: 0, y: 0 };

export function limitarZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return ZOOM_MIN;
  // Arredonda a 2 casas para o rótulo não mostrar 2,0000001×.
  return Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom)) * 100) / 100;
}

/**
 * Deslocamento máximo em cada eixo: metade do que a imagem ampliada passa da área. Imagem menor que a
 * área (ou em 1×) fica centralizada, sem deslocamento.
 */
export function limitarDeslocamento(
  estado: EstadoZoom,
  imagem: Tamanho,
  area: Tamanho,
): EstadoZoom {
  const maxX = Math.max(0, (imagem.w * estado.zoom - area.w) / 2);
  const maxY = Math.max(0, (imagem.h * estado.zoom - area.h) / 2);
  const x = Math.min(maxX, Math.max(-maxX, estado.x));
  const y = Math.min(maxY, Math.max(-maxY, estado.y));
  // `+ 0` normaliza -0 (o teste compara com 0).
  return { zoom: estado.zoom, x: x + 0, y: y + 0 };
}

/**
 * Novo zoom mantendo parado o ponto `foco` (coordenadas a partir do centro da área): o que está sob o
 * dedo ou o cursor continua sob ele. Sem `foco`, amplia em torno do centro da área.
 */
export function zoomEmTorno(
  estado: EstadoZoom,
  novoZoom: number,
  foco: Ponto = { x: 0, y: 0 },
): EstadoZoom {
  const zoom = limitarZoom(novoZoom);
  const razao = zoom / estado.zoom;
  return {
    zoom,
    x: foco.x - (foco.x - estado.x) * razao,
    y: foco.y - (foco.y - estado.y) * razao,
  };
}

/** Um passo de zoom (botões e teclado): `+1` amplia, `-1` reduz. Volta ao centro ao chegar em 1×. */
export function passoDeZoom(estado: EstadoZoom, direcao: 1 | -1): EstadoZoom {
  const novo = zoomEmTorno(estado, estado.zoom + direcao * ZOOM_PASSO);
  return novo.zoom === ZOOM_MIN ? ZOOM_INICIAL : novo;
}

/** Distância entre dois ponteiros (pinça). */
export function distancia(a: Ponto, b: Ponto): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Ponto médio entre dois ponteiros. */
export function pontoMedio(a: Ponto, b: Ponto): Ponto {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Rótulo do nível de zoom em pt-BR: "1×", "1,5×", "2,25×". */
export function formatarZoom(zoom: number): string {
  const arredondado = Math.round(zoom * 100) / 100;
  return `${String(arredondado).replace(".", ",")}×`;
}

/** Imagem larga (proporção > 1,6) pede o aviso de girar o celular. Sem dimensões, não dá para saber: `false`. */
export function ehImagemLarga(largura?: number, altura?: number): boolean {
  if (!largura || !altura || largura <= 0 || altura <= 0) return false;
  return largura / altura > PROPORCAO_LARGA;
}
