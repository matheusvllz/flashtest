import { describe, expect, test } from "bun:test";
import { confidence } from "@/lib/adaptive/confidence";
import type { SkillEvidenceEntry, SkillModelEntry } from "@/lib/learning/types";

/**
 * Casos derivados dos exemplos numéricos do docs/30 §10.3 — reconstruídos a
 * partir das PARTES (Q/D/R/T/S/I) documentadas, não copiados às cegas: a
 * conta de cada linha está reproduzida no comentário, então o teste também
 * serve de prova de que a fórmula bate com o que o plano promete.
 */

function entry(overrides: Partial<SkillModelEntry> = {}): SkillModelEntry {
  return {
    skillId: "mat:x",
    theta: 0,
    sigma: 1,
    nEff: 0,
    difficultiesSeen: [],
    recent: [],
    independentShare: 1,
    lastEvidenceDate: "2026-09-21",
    lapses: 0,
    dontKnowRecent: 0,
    helpHeavyRecent: 0,
    source: "evidencia",
    algoVersion: 1,
    updatedAt: "2026-09-21T10:00:00.000Z",
    ...overrides,
  };
}

function evidence(overrides: Partial<SkillEvidenceEntry> = {}): SkillEvidenceEntry {
  return {
    skillId: "mat:x",
    distinctExerciseIds: [],
    distinctLocalDates: [],
    lastFiveCorrect: [],
    hasReviewCorrectAfter24h: false,
    ...overrides,
  };
}

describe("confidence — casos de referência (docs/30 §10.3)", () => {
  test("2 acertos fáceis no mesmo dia, sem ajuda: Confidence ≈ 18", () => {
    // Q=1-e^(-2/4)=0,39 · D: 2 itens/1 data/1 dificuldade = 0,4*0,4+0,3*0,333+0,3*0,333=0,36
    // R=0,75 (sem retenção) · T=1 · S=1 (sem volatilidade) · I=1
    const e = entry({ nEff: 2, difficultiesSeen: [1], recent: [1, 1], independentShare: 1 });
    const ev = evidence({ distinctExerciseIds: ["a", "b"], distinctLocalDates: ["2026-09-21"] });
    const r = confidence(e, ev, "2026-09-21");
    expect(r.parts.Q).toBeCloseTo(0.39, 2);
    expect(r.parts.D).toBeCloseTo(0.36, 2);
    expect(r.parts.R).toBe(0.75);
    expect(r.value).toBeGreaterThanOrEqual(15);
    expect(r.value).toBeLessThanOrEqual(21);
  });

  test("5 itens, 2 datas, 2 dificuldades, revisão ok, 4/5 corretos: Confidence ≈ 53", () => {
    // Q=1-e^(-5/4)=0,71 · D: 5/5·0,4 + 2/3·0,3 + 2/3·0,3 = 0,8 · R=1 (retenção ok)
    // T=1 · S=1-0,3·(2 trocas/4)=0,85 (sequência 1,1,0,1,1) · I=1
    const e = entry({
      nEff: 5,
      difficultiesSeen: [1, 2],
      recent: [1, 1, 0, 1, 1],
      independentShare: 1,
    });
    const ev = evidence({
      distinctExerciseIds: ["a", "b", "c", "d", "e"],
      distinctLocalDates: ["2026-09-19", "2026-09-21"],
      hasReviewCorrectAfter24h: true,
    });
    const r = confidence(e, ev, "2026-09-21");
    expect(r.parts.Q).toBeCloseTo(0.71, 2);
    expect(r.parts.D).toBeCloseTo(0.8, 2);
    expect(r.parts.R).toBe(1);
    expect(r.parts.S).toBeCloseTo(0.85, 2);
    expect(r.value).toBeGreaterThanOrEqual(50);
    expect(r.value).toBeLessThanOrEqual(56);
  });

  test("12 itens, 4 datas, 3 dificuldades, estável: Confidence ≈ 89", () => {
    // Q=1-e^(-12/4)=0,95 · D=1 (todos os alvos batidos) · R=1 · T=1
    // S=1-0,3·(1 troca/5)=0,94 (1 blip nos últimos 6) · I=1
    const e = entry({
      nEff: 12,
      difficultiesSeen: [1, 2, 3],
      recent: [1, 1, 1, 1, 1, 0],
      independentShare: 1,
    });
    const ev = evidence({
      distinctExerciseIds: Array.from({ length: 12 }, (_, i) => `q${i}`),
      distinctLocalDates: ["2026-09-01", "2026-09-08", "2026-09-15", "2026-09-21"],
      hasReviewCorrectAfter24h: true,
    });
    const r = confidence(e, ev, "2026-09-21");
    expect(r.parts.Q).toBeCloseTo(0.95, 2);
    expect(r.parts.D).toBeCloseTo(1, 2);
    expect(r.parts.S).toBeCloseTo(0.94, 2);
    expect(r.value).toBeGreaterThanOrEqual(86);
    expect(r.value).toBeLessThanOrEqual(92);
  });

  test("mesmo aluno acima, 67 dias sem estudar a habilidade: T ≈ 0,37, Confidence ≈ 33", () => {
    const e = entry({
      nEff: 12,
      difficultiesSeen: [1, 2, 3],
      recent: [1, 1, 1, 1, 1, 0],
      independentShare: 1,
      lastEvidenceDate: "2026-07-16", // 67 dias antes de 2026-09-21
    });
    const ev = evidence({
      distinctExerciseIds: Array.from({ length: 12 }, (_, i) => `q${i}`),
      distinctLocalDates: ["2026-07-01", "2026-07-08", "2026-07-15", "2026-07-16"],
      hasReviewCorrectAfter24h: true,
    });
    const r = confidence(e, ev, "2026-09-21");
    expect(r.parts.T).toBeCloseTo(0.368, 2);
    expect(r.value).toBeGreaterThanOrEqual(30);
    expect(r.value).toBeLessThanOrEqual(36);
  });

  test("metade das tentativas assistidas: I = 0,8 (piso 0,6 + 0,4 × 0,5)", () => {
    const e = entry({ nEff: 5, independentShare: 0.5 });
    const r = confidence(e, evidence(), "2026-09-21");
    expect(r.parts.I).toBeCloseTo(0.8, 5);
  });
});

describe("confidence — casos extremos (docs/30 §10.6)", () => {
  test("sem entrada: 0, sem lançar", () => {
    const r = confidence(undefined, undefined, "2026-09-21");
    expect(r.value).toBe(0);
  });

  test("nEff = 0: 0, mesmo com entry presente", () => {
    const r = confidence(entry({ nEff: 0 }), evidence(), "2026-09-21");
    expect(r.value).toBe(0);
  });

  test("nunca passa de 100", () => {
    const e = entry({ nEff: 1000, difficultiesSeen: [1, 2, 3, 4, 5], recent: [1, 1, 1, 1, 1, 1], independentShare: 1 });
    const ev = evidence({
      distinctExerciseIds: Array.from({ length: 100 }, (_, i) => `q${i}`),
      distinctLocalDates: Array.from({ length: 20 }, (_, i) => `2026-01-${String(i + 1).padStart(2, "0")}`),
      hasReviewCorrectAfter24h: true,
    });
    const r = confidence(e, ev, "2026-09-21");
    expect(r.value).toBeLessThanOrEqual(100);
  });

  test("evidência só de checagem de aula (checkpoint) não sobe Confidence sozinha — nEff baixo e sem diversidade", () => {
    // checkpoint pesa 0,5 no modelo (constants.ts); aqui simulamos o reflexo:
    // 1 checkpoint só dá nEff=0,5, bem menos que uma prática independente.
    const e = entry({ nEff: 0.5, difficultiesSeen: [1], recent: [1], independentShare: 1 });
    const r = confidence(e, evidence({ distinctExerciseIds: ["a"], distinctLocalDates: ["2026-09-21"] }), "2026-09-21");
    expect(r.value).toBeLessThan(15);
  });
});
