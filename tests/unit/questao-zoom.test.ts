import { describe, expect, test } from "bun:test";
import {
  ehImagemLarga,
  formatarZoom,
  limitarDeslocamento,
  limitarZoom,
  passoDeZoom,
  ZOOM_INICIAL,
  ZOOM_MAX,
  zoomEmTorno,
} from "../../src/components/questao/zoom";

/** Contas do visualizador de imagem da questão (spec 50 §5.9.3, T-50.9.2). */
describe("zoom do visualizador", () => {
  test("limita o zoom entre 1× e 4× e ignora valor inválido", () => {
    expect(limitarZoom(0.3)).toBe(1);
    expect(limitarZoom(9)).toBe(ZOOM_MAX);
    expect(limitarZoom(2.004)).toBe(2);
    expect(limitarZoom(Number.NaN)).toBe(1);
  });

  test("passo de 0,5× nos botões e no teclado; volta ao centro ao chegar em 1×", () => {
    let e = passoDeZoom(ZOOM_INICIAL, 1);
    expect(e.zoom).toBe(1.5);
    e = passoDeZoom({ zoom: 1.5, x: 40, y: -20 }, -1);
    expect(e).toEqual(ZOOM_INICIAL);
    expect(passoDeZoom({ zoom: 4, x: 0, y: 0 }, 1).zoom).toBe(4);
  });

  test("zoom em torno de um ponto mantém o ponto parado", () => {
    // Ponto 100 px à direita do centro; em 1× a imagem está centrada.
    const e = zoomEmTorno(ZOOM_INICIAL, 2, { x: 100, y: 0 });
    expect(e.zoom).toBe(2);
    // O pixel da imagem que estava sob o ponto (100 px do centro da imagem) agora está a 200 px; desloca -100.
    expect(e.x).toBe(-100);
    expect(e.y).toBe(0);
  });

  test("deslocamento limitado à sobra da imagem ampliada; sem sobra, centralizada", () => {
    const imagem = { w: 300, h: 150 };
    const area = { w: 400, h: 600 };
    // 2× → 600 de largura, sobra 200 → no máximo ±100 na horizontal; altura 300 < 600, sem deslocamento vertical.
    expect(limitarDeslocamento({ zoom: 2, x: 500, y: 80 }, imagem, area)).toEqual({
      zoom: 2,
      x: 100,
      y: 0,
    });
    expect(limitarDeslocamento({ zoom: 2, x: -500, y: -80 }, imagem, area)).toEqual({
      zoom: 2,
      x: -100,
      y: 0,
    });
    expect(limitarDeslocamento({ zoom: 1, x: 30, y: 30 }, imagem, area)).toEqual({
      zoom: 1,
      x: 0,
      y: 0,
    });
  });

  test("rótulo em pt-BR", () => {
    expect(formatarZoom(1)).toBe("1×");
    expect(formatarZoom(1.5)).toBe("1,5×");
    expect(formatarZoom(2.25)).toBe("2,25×");
  });

  test("imagem larga: proporção acima de 1,6; sem dimensões, não", () => {
    expect(ehImagemLarga(960, 480)).toBe(true);
    expect(ehImagemLarga(800, 500)).toBe(false); // 1,6 exato não conta
    expect(ehImagemLarga(400, 400)).toBe(false);
    expect(ehImagemLarga(undefined, 400)).toBe(false);
    expect(ehImagemLarga(400, 0)).toBe(false);
  });
});
