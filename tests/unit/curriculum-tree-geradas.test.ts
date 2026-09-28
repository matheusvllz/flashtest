import { describe, expect, test } from "bun:test";
import { comAulasGeradas, type Curriculum } from "@/content/curriculum-tree";

const base: Curriculum = {
  courseId: "enem",
  subjects: [
    {
      id: "mat",
      name: "Matemática",
      sections: [{ id: "mat-numeros", title: "Números", chapters: [{ id: "c1", title: "C1", lessonIds: ["l1"], prerequisiteChapterIds: [] }] }],
    },
  ],
};

describe("comAulasGeradas (docs/30 §21.3, docs/31 F11.3)", () => {
  test("sem aula gerada, devolve a mesma árvore", () => {
    expect(comAulasGeradas(base, [])).toBe(base);
  });

  test("aula de matéria existente entra numa seção 'Mais aulas' da própria matéria", () => {
    const arvore = comAulasGeradas(base, [
      { lessonId: "aula-mat-x", chapterId: "gen-mat-x", subjectId: "mat", skillIds: ["mat:x"], title: "Aula X" },
    ]);
    const mat = arvore.subjects.find((s) => s.id === "mat")!;
    const secao = mat.sections.find((s) => s.id === "mat-mais-aulas")!;
    expect(secao.chapters).toEqual([
      { id: "gen-mat-x", title: "Aula X", lessonIds: ["aula-mat-x"], prerequisiteChapterIds: [], skillIds: ["mat:x"] },
    ]);
    // a seção autoral continua intacta e primeiro
    expect(mat.sections[0].id).toBe("mat-numeros");
  });

  test("matéria nova é criada no fim, sem mexer na original", () => {
    const arvore = comAulasGeradas(base, [
      { lessonId: "aula-fis-y", chapterId: "gen-fis-y", subjectId: "fis", skillIds: ["fis:y"], title: "Aula Y" },
    ]);
    expect(arvore.subjects.map((s) => s.id)).toEqual(["mat", "fis"]);
    expect(base.subjects).toHaveLength(1); // pura: não muta a árvore de entrada
  });
});
