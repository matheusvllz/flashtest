import { describe, expect, test } from "bun:test";
import { dificuldadeNaAula, escolherQuestoes, montarAula, type ItemPublicado } from "../../scripts/content/aulas";
import { validateLessonSteps } from "@/lib/learning/validate";

const item = (id: string, difficulty: number, roles: string[] = ["pratica"]): ItemPublicado =>
  ({
    id,
    exercise: { id, type: "multipla-escolha", pergunta: "p", opcoes: ["a", "b", "c", "d"], correta: 0, explicacao: "e" },
    meta: { id, version: 1, skillIds: ["mat:x"], difficulty, roles, irt: { a: 1, b: 0, c: 0.2, source: "estimado" } },
  }) as unknown as ItemPublicado;

const ensino = {
  skillId: "mat:x",
  title: "Aula X",
  objective: "Resolver X",
  intro: { title: "X", body: "Hoje: X." },
  teach: [
    { type: "concept", title: "O que é", body: "X é isso." },
    { type: "concept", title: "Como fazer", body: "Faça assim." },
  ],
  tip: { body: "Cuidado com Y." },
  recap: "X feito.",
} as const;

describe("aulas geradas (docs/31 F11.3)", () => {
  test("item retirado (docs/36 T-07.6) nunca entra numa aula nova: com ele fora sobram < 6 → null; com sobra, ele não é escolhido", () => {
    const oito = [3, 3, 4, 4, 5, 3, 4, 3].map((d, i) => item(`i${i}`, d));
    // 8 itens usáveis, 3 retirados → 5 → não dá aula.
    const comRetirados = oito.map((it, i) => (i < 3 ? ({ ...it, retired: true } as ItemPublicado) : it));
    expect(escolherQuestoes(comRetirados)).toBeNull();
    // 10 itens, 2 retirados: escolhe normalmente e nenhum dos retirados aparece (nem em questões, nem em revisão).
    const dez = [3, 3, 4, 4, 5, 3, 4, 3, 3, 4].map((d, i) => item(`j${i}`, d));
    const retirados = new Set(["j0", "j4"]);
    const e = escolherQuestoes(dez.map((it) => (retirados.has(it.id) ? ({ ...it, retired: true } as ItemPublicado) : it)))!;
    const usados = [...e.questoes.map((q) => q.exerciseId), ...e.revisao];
    for (const id of retirados) expect(usados).not.toContain(id);
  });

  test("menos de 6 itens usáveis → null (diagnóstico não conta)", () => {
    const itens = [1, 2, 3, 3, 4].map((d, i) => item(`i${i}`, d)).concat(item("d1", 2, ["diagnostico"]));
    expect(escolherQuestoes(itens)).toBeNull();
  });

  test("escolhe 5 questões + 2 revisão distintas, checkpoint primeiro, ordem não decrescente", () => {
    const itens = [3, 3, 4, 4, 5, 3, 4, 3].map((d, i) => item(`i${i}`, d));
    const e = escolherQuestoes(itens)!;
    expect(e.questoes).toHaveLength(5);
    expect(e.revisao).toHaveLength(2);
    const ids = [...e.questoes.map((q) => q.exerciseId), ...e.revisao];
    expect(new Set(ids).size).toBe(ids.length);
    expect(e.questoes[0]).toMatchObject({ role: "checkpoint", difficulty: 1 });
    const ds = e.questoes.map((q) => q.difficulty);
    expect([...ds].sort()).toEqual(ds);
    expect(ds[ds.length - 1]).toBeGreaterThanOrEqual(2);
  });

  test("dificuldade é relativa à aula; nível único vira progressão posicional", () => {
    expect(dificuldadeNaAula(3, 3, 0, 5)).toBe(1);
    expect(dificuldadeNaAula(3, 3, 1, 5)).toBe(1);
    expect(dificuldadeNaAula(3, 3, 4, 5)).toBe(2);
    expect(dificuldadeNaAula(5, 3, 2, 5)).toBe(3);
  });

  test("a aula montada passa em validateLessonSteps", () => {
    const itens = [1, 2, 3, 3, 4, 4, 5, 3].map((d, i) => item(`i${i}`, d));
    const aula = montarAula(ensino as never, escolherQuestoes(itens)!, { subjectId: "mat", topicId: "t" }, "2026-09-27T00:00:00Z");
    expect(aula.id).toBe("aula-mat-x");
    expect(aula.chapterId).toBe("gen-mat-x");
    expect(validateLessonSteps([aula])).toEqual([]);
  });
});
