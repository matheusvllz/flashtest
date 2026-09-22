import { describe, expect, test } from "bun:test";
import {
  CURRICULUM_TREE,
  TRAIL_ORDER,
  chapterById,
  chapterOfLesson,
  sectionOfChapter,
} from "@/content/curriculum-tree";
import { MICROLICOES } from "@/content/microlicoes";
import { TRILHAS } from "@/content/trilhas";

/**
 * Testes da árvore de currículo (docs/25 §7.2/§18 T-05, critérios de
 * aceite): `TRAIL_ORDER` na ordem exata do documento, `MICROLICOES` seguindo
 * essa ordem, navegação lição -> capítulo -> seção, e as 15 trilhas legadas
 * aparecendo cada uma exatamente uma vez na árvore.
 */

describe("TRAIL_ORDER (docs/25 §18 T-05, critério de aceite)", () => {
  test("é exatamente a lista de lições micro na ordem matéria -> seção -> capítulo -> lição", () => {
    expect(TRAIL_ORDER).toEqual([
      "porcentagem-valor",
      "porcentagem-aumento-desconto",
      "crase-quando-usar",
      "crase-proibida",
      "citologia-membrana",
      "citologia-organelas",
    ]);
  });
});

describe("MICROLICOES segue a ordem de TRAIL_ORDER", () => {
  test("MICROLICOES.map(id) é igual a TRAIL_ORDER", () => {
    expect(MICROLICOES.map((l) => l.id)).toEqual(TRAIL_ORDER);
  });
});

describe("chapterOfLesson / sectionOfChapter / chapterById", () => {
  test("chapterOfLesson encontra o capítulo micro certo pra uma lição", () => {
    expect(chapterOfLesson("crase-proibida")?.id).toBe("por-crase");
    expect(chapterOfLesson("citologia-membrana")?.id).toBe("bio-citologia");
    expect(chapterOfLesson("porcentagem-valor")?.id).toBe("mat-porcentagem");
  });

  test("chapterOfLesson devolve undefined pra uma lição que não existe em nenhum capítulo", () => {
    expect(chapterOfLesson("nao-existe")).toBeUndefined();
  });

  test("sectionOfChapter encontra a seção de um capítulo legado", () => {
    const encontrado = sectionOfChapter("crase");
    expect(encontrado?.section.id).toBe("por-gramatica");
    expect(encontrado?.subject.id).toBe("por");
  });

  test("sectionOfChapter encontra a seção de um capítulo micro", () => {
    const encontrado = sectionOfChapter("mat-porcentagem");
    expect(encontrado?.section.id).toBe("mat-numeros");
    expect(encontrado?.subject.id).toBe("mat");
  });

  test("chapterById encontra tanto capítulo micro quanto legado", () => {
    expect(chapterById("por-crase")?.title).toBe("Crase");
    expect(chapterById("crase")?.trilhaId).toBe("crase");
    expect(chapterById("nao-existe")).toBeUndefined();
  });
});

describe("capítulos legados cobrem todas as 15 trilhas, cada uma exatamente uma vez", () => {
  test("todo trilhaId de TRILHAS aparece como id de algum capítulo legado, sem repetição", () => {
    const todosCapitulos = CURRICULUM_TREE.subjects.flatMap((s) => s.sections.flatMap((sec) => sec.chapters));
    const trilhaIdsNaArvore = todosCapitulos.filter((c) => c.trilhaId).map((c) => c.trilhaId as string);

    expect(trilhaIdsNaArvore.length).toBe(15);
    expect(new Set(trilhaIdsNaArvore).size).toBe(15);

    for (const trilha of TRILHAS) {
      expect(trilhaIdsNaArvore.filter((id) => id === trilha.id).length).toBe(1);
    }
  });

  test("capítulo legado tem lessonIds derivado da trilha (buildLegacyChapter)", () => {
    const crase = chapterById("crase");
    const trilhaCrase = TRILHAS.find((t) => t.id === "crase");
    expect(crase?.lessonIds).toEqual(trilhaCrase?.licoes.map((l) => l.id));
    expect(crase?.title).toBe(trilhaCrase?.nome);
  });
});

describe("estrutura declarada (docs/25 §7.2)", () => {
  test("4 matérias na ordem mat, por, red, bio", () => {
    expect(CURRICULUM_TREE.subjects.map((s) => s.id)).toEqual(["mat", "por", "red", "bio"]);
  });

  test("por tem as 4 seções esperadas", () => {
    const por = CURRICULUM_TREE.subjects.find((s) => s.id === "por");
    expect(por?.sections.map((s) => s.id)).toEqual([
      "por-gramatica",
      "por-palavras",
      "por-sintaxe",
      "por-leitura",
    ]);
  });

  test("todos os prerequisiteChapterIds estão vazios nesta entrega", () => {
    const todosCapitulos = CURRICULUM_TREE.subjects.flatMap((s) => s.sections.flatMap((sec) => sec.chapters));
    for (const c of todosCapitulos) {
      expect(c.prerequisiteChapterIds).toEqual([]);
    }
  });
});
