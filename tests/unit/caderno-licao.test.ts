import { describe, expect, test } from "bun:test";
import { QUESTIONS } from "@/data/questions";
import { SKILLS } from "@/content/taxonomy";
import { MAX_POR_REVISAO, itensRevisaveis, licaoDoCaderno } from "@/lib/caderno";
import { dominioPorArea } from "@/lib/dominio-por-area";

/** Caderno de erros e cronograma (spec 49 T-49.9.1, T-49.9.2) — partes puras do cliente. */
describe("revisão do caderno", () => {
  test("monta uma lição de revisão com as questões do dia (no máximo 8) e ignora id que o app não conhece", () => {
    const ids = QUESTIONS.slice(0, 10).map((q) => q.id);
    expect(itensRevisaveis([...ids.slice(0, 2), "nao-existe"])).toEqual(ids.slice(0, 2));
    const l = licaoDoCaderno([...ids, "nao-existe"], "2026-10-15");
    const perguntas = l.steps.filter((s) => s.kind === "question");
    expect(perguntas).toHaveLength(MAX_POR_REVISAO);
    expect(perguntas.every((s) => s.kind === "question" && s.role === "revisao")).toBe(true);
    expect(l.id).toBe("caderno--2026-10-15");
    expect(l.steps[0].kind).toBe("intro");
    expect(l.steps.at(-1)?.kind).toBe("recap");
    expect(() => licaoDoCaderno(["nao-existe"], "2026-10-15")).toThrow();
  });
});

describe("domínio por área", () => {
  test("média do domínio das habilidades medidas; área sem medida fica null", () => {
    const mt = SKILLS.find((s) => s.subjectId === "mat");
    if (!mt) throw new Error("sem habilidade de matemática na taxonomia");
    const d = dominioPorArea({ [mt.id]: { theta: 0 } as never });
    expect(d.MT).toBe(50);
    expect(d.LC).toBeNull();
  });
});
