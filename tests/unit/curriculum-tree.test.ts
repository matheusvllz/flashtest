import { describe, expect, test } from "bun:test";
import {
  ARVORE_AUTORAL,
  CURRICULUM_TREE,
  TRAIL_ORDER,
  chapterById,
  chapterOfLesson,
  sectionOfChapter,
  trailOrderOf,
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
  // Sobre a árvore AUTORAL, não `TRAIL_ORDER` bruto: desde a Fase 11 (docs/30/31, F11.3),
  // `TRAIL_ORDER` roda sobre a árvore EM TEMPO DE EXECUÇÃO e ganha os ids das aulas geradas
  // (achado real: quebrou ao publicar as primeiras aulas) — a lista declarada continua exata.
  test("é exatamente a lista de lições micro na ordem matéria -> seção -> capítulo -> lição", () => {
    expect(trailOrderOf(ARVORE_AUTORAL)).toEqual([
      "porcentagem-valor",
      "porcentagem-aumento-desconto",
      "crase-quando-usar",
      "crase-proibida",
      "citologia-membrana",
      "citologia-organelas",
    ]);
  });

  test("TRAIL_ORDER em tempo de execução preserva a ordem relativa da árvore autoral", () => {
    const autorais = new Set(trailOrderOf(ARVORE_AUTORAL));
    expect(TRAIL_ORDER.filter((id) => autorais.has(id))).toEqual(trailOrderOf(ARVORE_AUTORAL));
  });
});

describe("MICROLICOES segue a ordem de TRAIL_ORDER", () => {
  test("MICROLICOES.map(id) é igual à posição relativa em TRAIL_ORDER", () => {
    // MICROLICOES só tem lição estática (nunca aula gerada, que vive nos pacotes) — TRAIL_ORDER
    // filtrado a esses ids preserva a ordem declarada mesmo com aulas geradas misturadas.
    const idsEstaticos = new Set(MICROLICOES.map((l) => l.id));
    expect(MICROLICOES.map((l) => l.id)).toEqual(TRAIL_ORDER.filter((id) => idsEstaticos.has(id)));
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
  // Testado sobre ARVORE_AUTORAL, não CURRICULUM_TREE: desde a Fase 11 (docs/30/31, F11.3),
  // `pacotesConteudo` liga de verdade e `comAulasGeradas` acrescenta matérias/seções "Mais
  // aulas" — a estrutura DECLARADA continua as 4 matérias originais, a árvore em TEMPO DE
  // EXECUÇÃO é maior (achado real: este teste quebrou ao publicar as primeiras aulas geradas).
  test("4 matérias na ordem mat, por, red, bio", () => {
    expect(ARVORE_AUTORAL.subjects.map((s) => s.id)).toEqual(["mat", "por", "red", "bio"]);
  });

  test("por tem as 4 seções esperadas", () => {
    const por = ARVORE_AUTORAL.subjects.find((s) => s.id === "por");
    expect(por?.sections.map((s) => s.id)).toEqual([
      "por-gramatica",
      "por-palavras",
      "por-sintaxe",
      "por-leitura",
    ]);
  });

  test("todos os prerequisiteChapterIds estão vazios nesta entrega", () => {
    const todosCapitulos = ARVORE_AUTORAL.subjects.flatMap((s) => s.sections.flatMap((sec) => sec.chapters));
    for (const c of todosCapitulos) {
      expect(c.prerequisiteChapterIds).toEqual([]);
    }
  });
});

describe("CURRICULUM_TREE com aulas geradas (docs/30 §21.3, F11.3)", () => {
  test("com pacotesConteudo ligada e aulas publicadas, ganha matérias/seções extras sem perder a árvore autoral", () => {
    const idsAutorais = new Set(ARVORE_AUTORAL.subjects.map((s) => s.id));
    const idsAtuais = CURRICULUM_TREE.subjects.map((s) => s.id);
    expect(idsAutorais.size).toBeGreaterThan(0);
    for (const id of idsAutorais) expect(idsAtuais).toContain(id);
    // pelo menos uma matéria nova (fis/qui/geo/his/fil/soc/ing) apareceu com as aulas da Onda 1.
    expect(idsAtuais.length).toBeGreaterThan(idsAutorais.size);
  });
});
