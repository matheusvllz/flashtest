import { describe, expect, test } from "bun:test";
import { planBatch, planEntriesForSkill, META_ONDA_1 } from "../../scripts/content/plan-batch";
import type { SkillCoverage } from "../../scripts/content/pipeline-types";

/**
 * Plano de lote (docs/30 §18.1/§19.2, Fase 9 F9.4).
 */

function coberturaVazia(skillId: string): SkillCoverage {
  return {
    skillId,
    hasLesson: false,
    itemsByDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    itemsByRole: { pratica: 0, revisao: 0, desafio: 0, diagnostico: 0 },
    diagnosticReviewed: 0,
  };
}

describe("planEntriesForSkill", () => {
  test("habilidade sem nada gera aula + fácil + médio + difícil + revisão + diagnóstico", () => {
    const entries = planEntriesForSkill(coberturaVazia("mat:x"));
    expect(entries.map((e) => e.kind)).toEqual(["aula", "item", "item", "item", "item", "item"]);
    expect(entries[0].quantity).toBe(META_ONDA_1.aula);
    const diagnostico = entries.find((e) => e.role === "diagnostico");
    expect(diagnostico?.quantity).toBe(META_ONDA_1.diagnostico);
  });

  test("habilidade já com o mínimo de diagnóstico não pede mais", () => {
    const c: SkillCoverage = {
      ...coberturaVazia("mat:x"),
      itemsByRole: { pratica: 0, revisao: 0, desafio: 0, diagnostico: META_ONDA_1.diagnostico },
    };
    expect(planEntriesForSkill(c).some((e) => e.role === "diagnostico")).toBe(false);
  });

  test("habilidade já com aula não pede aula de novo", () => {
    const c = { ...coberturaVazia("mat:x"), hasLesson: true };
    const entries = planEntriesForSkill(c);
    expect(entries.some((e) => e.kind === "aula")).toBe(false);
  });

  test("habilidade já na meta em todas as faixas não gera nada", () => {
    const c: SkillCoverage = {
      skillId: "mat:x",
      hasLesson: true,
      itemsByDifficulty: { 1: 2, 2: 2, 3: 4, 4: 2, 5: 2 },
      itemsByRole: { pratica: 8, revisao: 4, desafio: 4, diagnostico: META_ONDA_1.diagnostico },
      diagnosticReviewed: 0,
    };
    expect(planEntriesForSkill(c)).toEqual([]);
  });

  test("faixa parcialmente coberta pede só o que falta", () => {
    const c: SkillCoverage = {
      ...coberturaVazia("mat:x"),
      hasLesson: true,
      itemsByDifficulty: { 1: 1, 2: 1, 3: 0, 4: 0, 5: 0 }, // fácil: 2 de 4
    };
    const entries = planEntriesForSkill(c);
    const facil = entries.find((e) => e.difficulty === 1);
    expect(facil?.quantity).toBe(2); // faltam 2
  });
});

describe("planBatch", () => {
  test("sem --max, inclui tudo", () => {
    const plano = planBatch(
      [coberturaVazia("mat:a"), coberturaVazia("mat:b")],
      "lote-1",
      "2026-09-24T00:00:00.000Z",
    );
    expect(plano.totalCandidates).toBeGreaterThan(0);
    expect(plano.loteId).toBe("lote-1");
  });

  test("com --max, corta no total exato, sem passar", () => {
    const plano = planBatch(
      [coberturaVazia("mat:a"), coberturaVazia("mat:b")],
      "lote-1",
      "2026-09-24T00:00:00.000Z",
      3,
    );
    expect(plano.totalCandidates).toBe(3);
  });

  test("max=0 devolve plano vazio, sem lançar", () => {
    const plano = planBatch([coberturaVazia("mat:a")], "lote-1", "2026-09-24T00:00:00.000Z", 0);
    expect(plano.totalCandidates).toBe(0);
    expect(plano.entries).toEqual([]);
  });

  test("max maior que o total disponível devolve tudo, sem entradas fantasma", () => {
    const plano = planBatch([coberturaVazia("mat:a")], "lote-1", "2026-09-24T00:00:00.000Z", 9999);
    const semLimite = planBatch([coberturaVazia("mat:a")], "lote-1", "2026-09-24T00:00:00.000Z");
    expect(plano.totalCandidates).toBe(semLimite.totalCandidates);
  });
});
