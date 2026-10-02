/**
 * "Pular para cá" — regras puras (spec 50 §5.7.1, T-50.12.1): onde o teste aparece, a composição (6 a 10 questões
 * inéditas, pelo menos 1 por habilidade) e a avaliação (≥ 80% de primeira e nenhuma habilidade zerada).
 */
import { describe, expect, test } from "bun:test";
import type { CurriculumChapter, CurriculumSubject } from "@/content/curriculum-tree";
import { CURRICULUM_TREE } from "@/content/curriculum-tree";
import {
  PULO,
  alvoDoPulo,
  avaliarPulo,
  bloqueioDoPulo,
  comporTestePulo,
  type ItemDoPool,
} from "@/lib/learning/pulo";

function cap(id: string, lessonIds: string[], skillIds: string[], legado = false): CurriculumChapter {
  return { id, title: `Cap ${id}`, lessonIds, prerequisiteChapterIds: [], skillIds, ...(legado ? { trilhaId: id } : {}) };
}

const MAT: CurriculumSubject = {
  id: "mat",
  name: "Matemática",
  sections: [
    { id: "s1", title: "S1", chapters: [cap("a", ["a1", "a2"], ["h:a"]), cap("b", ["b1", "b2"], ["h:b1", "h:b2"])] },
    { id: "s2", title: "S2", chapters: [cap("c", ["c1"], ["h:c"], true), cap("d", ["d1"], ["h:d"])] },
  ],
};

const feitas = (...ids: string[]) => {
  const set = new Set(ids);
  return (id: string) => set.has(id);
};

describe("onde aparece", () => {
  test("aluno novo: o alvo é o 2º capítulo, o caminho é o 1º inteiro", () => {
    const a = alvoDoPulo(MAT, feitas());
    expect(a?.capituloId).toBe("b");
    expect(a?.caminho).toEqual(["a"]);
    expect(a?.licoes).toEqual([
      { id: "a1", tipo: "micro", capituloId: "a" },
      { id: "a2", tipo: "micro", capituloId: "a" },
    ]);
    expect(a?.habilidades).toEqual(["h:a", "h:b1", "h:b2"]);
  });

  test("lição feita fica fora do caminho; o alvo anda com a posição do aluno", () => {
    expect(alvoDoPulo(MAT, feitas("a1"))?.licoes.map((l) => l.id)).toEqual(["a2"]);
    const depois = alvoDoPulo(MAT, feitas("a1", "a2"));
    expect(depois?.capituloId).toBe("c");
    expect(depois?.caminho).toEqual(["b"]);
  });

  test("capítulo já começado à frente vira caminho, não alvo (o alvo é o primeiro ainda não tocado)", () => {
    const a = alvoDoPulo(MAT, feitas("b1"));
    expect(a?.capituloId).toBe("c");
    expect(a?.caminho).toEqual(["a", "b"]);
    expect(a?.licoes.map((l) => l.id)).toEqual(["a1", "a2", "b2"]);
  });

  test("lição de capítulo legado leva o tipo redacao", () => {
    const a = alvoDoPulo(MAT, feitas("a1", "a2", "b1", "b2"));
    expect(a?.capituloId).toBe("d");
    expect(a?.licoes).toEqual([{ id: "c1", tipo: "redacao", capituloId: "c" }]);
  });

  test("sem capítulo à frente, ou trilha toda feita: não aparece", () => {
    expect(alvoDoPulo(MAT, feitas("a1", "a2", "b1", "b2", "c1"))).toBeNull();
    expect(alvoDoPulo(MAT, feitas("a1", "a2", "b1", "b2", "c1", "d1"))).toBeNull();
  });

  test("nunca na trilha de redação", () => {
    expect(alvoDoPulo({ ...MAT, id: "red" }, feitas())).toBeNull();
    const red = CURRICULUM_TREE.subjects.find((s) => s.id === "red");
    expect(red && alvoDoPulo(red, feitas())).toBeNull();
  });

  test("na árvore real, um aluno novo vê o pulo no 2º capítulo de Português", () => {
    const por = CURRICULUM_TREE.subjects.find((s) => s.id === "por")!;
    const a = alvoDoPulo(por, feitas());
    expect(a?.capituloId).toBe(por.sections[0].chapters[1].id);
  });
});

function pool(): ItemDoPool[] {
  const itens: ItemDoPool[] = [];
  for (const h of ["h:a", "h:b1", "h:b2"]) for (let i = 0; i < 6; i++) itens.push({ id: `${h}-${i}`, skills: [h], difficulty: ((i % 5) + 1) as 1 });
  return itens;
}

describe("composição do teste", () => {
  test("pelo menos 1 por habilidade, entre 6 e 10, sem repetir e sem item já visto", () => {
    const vistos = new Set(["h:a-0", "h:a-1"]);
    const r = comporTestePulo(["h:a", "h:b1", "h:b2"], pool(), vistos, "semente");
    expect(r).not.toBeNull();
    const ids = r!.itens.map((i) => i.itemId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(PULO.MIN_ITENS);
    expect(ids.length).toBeLessThanOrEqual(PULO.MAX_ITENS);
    for (const h of ["h:a", "h:b1", "h:b2"]) expect(r!.itens.some((i) => i.skillId === h)).toBe(true);
    expect(ids.some((id) => vistos.has(id))).toBe(false);
    expect(r!.semQuestao).toEqual([]);
  });

  test("mesma semente, mesmo teste; semente diferente pode trocar os itens", () => {
    const a = comporTestePulo(["h:a", "h:b1", "h:b2"], pool(), new Set(), "x");
    const b = comporTestePulo(["h:a", "h:b1", "h:b2"], pool(), new Set(), "x");
    expect(a).toEqual(b);
  });

  test("ordem do mais fácil para o mais difícil", () => {
    const r = comporTestePulo(["h:a", "h:b1", "h:b2"], pool(), new Set(), "y")!;
    const dif = r.itens.map((i) => pool().find((p) => p.id === i.itemId)!.difficulty);
    expect([...dif].sort((x, y) => x - y)).toEqual(dif);
  });

  test("habilidade sem item inédito fica fora do teste e é devolvida em semQuestao", () => {
    const r = comporTestePulo(["h:a", "h:b1", "h:z"], pool(), new Set(), "s")!;
    expect(r.semQuestao).toEqual(["h:z"]);
    expect(r.itens.some((i) => i.skillId === "h:z")).toBe(false);
  });

  test("mais de 10 habilidades: só 10 entram, as outras ficam em semQuestao", () => {
    const hs = Array.from({ length: 12 }, (_, i) => `h:${i}`);
    const p = hs.map((h) => ({ id: `${h}-x`, skills: [h], difficulty: 2 as const }));
    const r = comporTestePulo(hs, p, new Set(), "s")!;
    expect(r.itens).toHaveLength(10);
    expect(r.semQuestao).toEqual(["h:10", "h:11"]);
  });

  test("menos de 6 questões possíveis: sem teste", () => {
    const p = pool().filter((i) => i.skills[0] === "h:a").slice(0, 5);
    expect(comporTestePulo(["h:a"], p, new Set(), "s")).toBeNull();
    expect(comporTestePulo(["h:a"], [], new Set(), "s")).toBeNull();
  });

  test("item cuja habilidade principal é a procurada vem antes de item que só a tem como secundária", () => {
    const p: ItemDoPool[] = [
      { id: "sec", skills: ["h:outra", "h:a"], difficulty: 1 },
      ...Array.from({ length: 6 }, (_, i) => ({ id: `pri-${i}`, skills: ["h:a"], difficulty: 2 as const })),
    ];
    const r = comporTestePulo(["h:a"], p, new Set(), "s")!;
    expect(r.itens.map((i) => i.itemId)).not.toContain("sec");
  });
});

describe("avaliação", () => {
  const itens = [
    { itemId: "1", skillId: "h:a" },
    { itemId: "2", skillId: "h:a" },
    { itemId: "3", skillId: "h:b" },
    { itemId: "4", skillId: "h:b" },
    { itemId: "5", skillId: "h:c" },
  ];

  test("passa com 80% e todas as habilidades com acerto", () => {
    const r = avaliarPulo(itens, new Map([["1", true], ["2", true], ["3", true], ["4", false], ["5", true]]));
    expect(r).toMatchObject({ passou: true, acertos: 4, total: 5 });
    expect(r.valeRevisar).toEqual(["h:b"]);
  });

  test("abaixo de 80% não passa", () => {
    const r = avaliarPulo(itens, new Map([["1", true], ["2", false], ["3", true], ["4", false], ["5", true]]));
    expect(r.passou).toBe(false);
    expect(r.valeRevisar).toEqual(["h:a", "h:b"]);
  });

  test("uma habilidade zerada reprova mesmo com 80% no total, e vem primeiro em valeRevisar", () => {
    const dez = [...itens, ...Array.from({ length: 5 }, (_, i) => ({ itemId: `x${i}`, skillId: "h:a" }))];
    const corretas = new Map(dez.map((i) => [i.itemId, i.skillId !== "h:c"]));
    const r = avaliarPulo(dez, corretas);
    expect(r.acertos / r.total).toBeGreaterThanOrEqual(0.8);
    expect(r.passou).toBe(false);
    expect(r.valeRevisar[0]).toBe("h:c");
  });

  test("resposta ausente conta como erro", () => {
    expect(avaliarPulo(itens, new Map()).acertos).toBe(0);
  });
});

describe("limites", () => {
  test("1 tentativa por capítulo por dia e 3 testes por dia", () => {
    expect(bloqueioDoPulo([], "a")).toBeNull();
    expect(bloqueioDoPulo([{ capituloId: "a", concluido: true }], "a")).toBe("CAPITULO_HOJE");
    expect(bloqueioDoPulo([{ capituloId: "a", concluido: false }], "a")).toBeNull(); // retomada do mesmo teste
    const tres = ["x", "y", "z"].map((capituloId) => ({ capituloId, concluido: true }));
    expect(bloqueioDoPulo(tres, "a")).toBe("LIMITE_DO_DIA");
    expect(bloqueioDoPulo([...tres.slice(0, 2), { capituloId: "a", concluido: false }], "a")).toBeNull();
  });
});
