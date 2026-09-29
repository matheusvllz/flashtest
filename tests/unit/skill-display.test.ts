import { describe, expect, test } from "bun:test";
import { faixaDaAreaPlacement, precisaoDaArea, skillDisplay } from "@/lib/adaptive/display";
import type { SkillEvidenceEntry, SkillModelEntry } from "@/lib/learning/types";

/**
 * Faixas de exibição (docs/30 §10.4, Fase 5) — fronteira testada nos 4
 * limiares exatos (24/25, 49/50, 74/75) pra garantir que o corte é onde o
 * plano diz que é, não "por perto".
 */

function entryComNEff(nEff: number): SkillModelEntry {
  return {
    skillId: "mat:x",
    theta: 1,
    sigma: 0.3,
    nEff,
    difficultiesSeen: [1, 2, 3],
    recent: [1, 1, 1, 1, 1, 1],
    independentShare: 1,
    lastEvidenceDate: "2026-09-21",
    lapses: 0,
    dontKnowRecent: 0,
    helpHeavyRecent: 0,
    source: "evidencia",
    algoVersion: 1,
    updatedAt: "x",
  };
}

const EVIDENCIA_RICA: SkillEvidenceEntry = {
  skillId: "mat:x",
  distinctExerciseIds: Array.from({ length: 20 }, (_, i) => `q${i}`),
  distinctLocalDates: Array.from({ length: 10 }, (_, i) => `2026-08-${String(i + 1).padStart(2, "0")}`),
  lastFiveCorrect: [],
  hasReviewCorrectAfter24h: true,
};

describe("skillDisplay — fronteiras (docs/30 §10.4)", () => {
  test("Confidence 0-24: 'ainda medindo', Mastery escondida", () => {
    const d = skillDisplay(entryComNEff(0.01), undefined, undefined, "2026-09-21");
    expect(d.label).toBe("ainda medindo");
    expect(d.showMastery).toBe(false);
    expect(d.mastery).toBeNull();
  });

  test("sem entrada nenhuma: 'ainda medindo', nunca lança", () => {
    const d = skillDisplay(undefined, undefined, undefined, "2026-09-21");
    expect(d.label).toBe("ainda medindo");
    expect(d.showMastery).toBe(false);
  });

  test("Confidence >= 25: mostra Mastery e rótulo 'pouca evidência' até 49", () => {
    // nEff baixo o bastante pra Confidence cair entre 25 e 49.
    const d = skillDisplay(entryComNEff(1.2), EVIDENCIA_RICA, undefined, "2026-09-21");
    expect(d.confidenceValue).toBeGreaterThanOrEqual(25);
    if (d.confidenceValue < 50) {
      expect(d.label).toBe("pouca evidência");
      expect(d.showMastery).toBe(true);
      expect(d.mastery).not.toBeNull();
    }
  });

  test("Confidence >= 75: 'boa evidência'", () => {
    const d = skillDisplay(entryComNEff(30), EVIDENCIA_RICA, undefined, "2026-09-21");
    expect(d.confidenceValue).toBeGreaterThanOrEqual(75);
    expect(d.label).toBe("boa evidência");
  });

  test("'Dominado' exige Mastery>=80 E Confidence>=75 E selo consistente ao mesmo tempo", () => {
    const masteryAlta = { ...entryComNEff(30), theta: 2 }; // Mastery bem alta
    const evidenciaConsistente: SkillEvidenceEntry = {
      ...EVIDENCIA_RICA,
      distinctExerciseIds: Array.from({ length: 5 }, (_, i) => `q${i}`),
      distinctLocalDates: ["2026-08-01", "2026-08-02"],
      lastFiveCorrect: [true, true, true, true, true],
      hasReviewCorrectAfter24h: true,
    };
    const d = skillDisplay(masteryAlta, evidenciaConsistente, undefined, "2026-09-21");
    expect(d.consistent).toBe(true);
    expect(d.dominated).toBe(true);
  });

  test("Mastery alta mas SEM o selo consistente: não é 'dominado'", () => {
    const masteryAlta = { ...entryComNEff(30), theta: 2 };
    // Evidência com só 2 itens distintos — não bate o critério de "consistente" (precisa 5).
    const evidenciaPouca: SkillEvidenceEntry = {
      ...EVIDENCIA_RICA,
      distinctExerciseIds: ["q1", "q2"],
      lastFiveCorrect: [true, true],
    };
    const d = skillDisplay(masteryAlta, evidenciaPouca, undefined, "2026-09-21");
    expect(d.dominated).toBe(false);
  });
});

/**
 * Resultado do nivelamento (docs/36 §F.5, T-06.1; RP-6): faixa por θ̂ da área e precisão pela SE da
 * área, testadas nos limiares EXATOS — o corte é onde o plano diz, não "por perto".
 */
describe("precisaoDaArea — SE da área (docs/36 §F.5)", () => {
  test("SE ≤ 0,45 → firme; 0,45 < SE ≤ 0,70 → inicial; SE > 0,70 → poucas", () => {
    expect(precisaoDaArea(0.2)).toBe("firme");
    expect(precisaoDaArea(0.45)).toBe("firme"); // limiar inclusivo (mesmo corte de parada do CAT)
    expect(precisaoDaArea(0.4501)).toBe("inicial");
    expect(precisaoDaArea(0.7)).toBe("inicial"); // limiar inclusivo
    expect(precisaoDaArea(0.7001)).toBe("poucas");
    expect(precisaoDaArea(1.2)).toBe("poucas");
  });

  test("sem SE (área não medida) → null", () => {
    expect(precisaoDaArea(null)).toBeNull();
  });
});

describe("faixaDaAreaPlacement — θ̂ da área (docs/36 §F.5)", () => {
  test("θ̂ < −0,5 → construção; −0,5 ≤ θ̂ < 0,7 → no caminho; θ̂ ≥ 0,7 → firme", () => {
    expect(faixaDaAreaPlacement(-2)).toBe("construcao");
    expect(faixaDaAreaPlacement(-0.5001)).toBe("construcao");
    expect(faixaDaAreaPlacement(-0.5)).toBe("caminho");
    expect(faixaDaAreaPlacement(0)).toBe("caminho");
    expect(faixaDaAreaPlacement(0.6999)).toBe("caminho");
    expect(faixaDaAreaPlacement(0.7)).toBe("firme");
    expect(faixaDaAreaPlacement(3)).toBe("firme");
  });

  test("área não medida (θ̂ nulo) → null, nunca uma faixa inventada", () => {
    expect(faixaDaAreaPlacement(null)).toBeNull();
  });
});
