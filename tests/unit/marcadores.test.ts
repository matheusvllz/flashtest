import { describe, expect, test } from "bun:test";
import {
  dividirPorMarcadores,
  indicesCitados,
  marcadoresDe,
  semMarcadores,
} from "@/lib/lessons/marcadores";

/** Marcadores de posição de imagem e tabela no enunciado (spec 50 §5.9.3). Texto sintético. */
describe("dividirPorMarcadores", () => {
  test("intercala texto, imagem e tabela na ordem do original", () => {
    const texto =
      "Primeiro parágrafo.\n\n[[imagem:0]]\n\nSegundo parágrafo.\n[[tabela:0]]\nComando final?";
    expect(dividirPorMarcadores(texto)).toEqual([
      { tipo: "texto", texto: "Primeiro parágrafo." },
      { tipo: "imagem", indice: 0 },
      { tipo: "texto", texto: "Segundo parágrafo." },
      { tipo: "tabela", indice: 0 },
      { tipo: "texto", texto: "Comando final?" },
    ]);
  });

  test("sem marcador devolve um trecho só, com as quebras de linha preservadas", () => {
    expect(dividirPorMarcadores("verso um\nverso dois")).toEqual([
      { tipo: "texto", texto: "verso um\nverso dois" },
    ]);
  });

  test("marcador no meio da linha não divide (o validador recusa esse formato)", () => {
    const segs = dividirPorMarcadores("veja [[imagem:0]] aqui");
    expect(segs).toEqual([{ tipo: "texto", texto: "veja [[imagem:0]] aqui" }]);
  });

  test("marcadores seguidos e espaços em volta", () => {
    expect(dividirPorMarcadores("  [[imagem:1]]  \n[[imagem:0]]")).toEqual([
      { tipo: "imagem", indice: 1 },
      { tipo: "imagem", indice: 0 },
    ]);
  });
});

describe("marcadoresDe / semMarcadores / indicesCitados", () => {
  test("lista os marcadores e diz se estão em linha própria", () => {
    expect(marcadoresDe("a\n[[imagem:2]]\nb [[tabela:0]]")).toEqual([
      { tipo: "imagem", indice: 2, linhaPropria: true },
      { tipo: "tabela", indice: 0, linhaPropria: false },
    ]);
  });

  test("semMarcadores tira os marcadores e o excesso de linhas em branco", () => {
    expect(semMarcadores("Texto.\n\n[[imagem:0]]\n\nComando?")).toBe("Texto.\n\nComando?");
  });

  test("indicesCitados junta os índices de vários textos", () => {
    const r = indicesCitados(["[[imagem:0]]", undefined, "x\n[[tabela:1]]\n[[imagem:2]]"]);
    expect([...r.imagens]).toEqual([0, 2]);
    expect([...r.tabelas]).toEqual([1]);
  });
});
