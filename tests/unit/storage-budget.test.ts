import { describe, expect, test } from "bun:test";
import { computeAdditiveFields } from "@/lib/state-migrations";

/**
 * Orçamento de armazenamento (docs/30 §21.1, Fase 4 do docs/31) — um estado
 * "pesado" sintético (400 habilidades no modelo, 500 tentativas, 200 de
 * histórico de jornada, 300 eventos — os limites máximos de cada estrutura
 * batendo ao mesmo tempo) precisa caber com folga no limite prático do
 * `localStorage` (~5 MB) e a migração sobre ele precisa ser rápida.
 */

function estadoPesadoBruto(): Record<string, unknown> {
  const skillModel: Record<string, unknown> = {};
  for (let i = 0; i < 400; i++) {
    skillModel[`mat:habilidade-sintetica-${i}`] = {
      skillId: `mat:habilidade-sintetica-${i}`,
      theta: 0.3,
      sigma: 0.6,
      nEff: 12,
      difficultiesSeen: [1, 2, 3],
      recent: [1, 1, 0, 1, 2],
      independentShare: 0.8,
      lastEvidenceDate: "2026-09-20",
      lapses: 1,
      dontKnowRecent: 0,
      helpHeavyRecent: 0,
      source: "evidencia",
      algoVersion: 1,
      updatedAt: "2026-09-20T10:00:00.000Z",
    };
  }

  const recentAttempts = Array.from({ length: 500 }, (_, i) => ({
    id: `at-${i}`,
    sessionId: `ls-${i}`,
    exerciseId: `mc:teste:${i}`,
    exerciseVersion: 1,
    subjectId: "mat",
    topicId: "porc",
    skillIds: [`mat:habilidade-sintetica-${i % 400}`],
    role: "pratica",
    answer: i % 4,
    correct: i % 2 === 0,
    hintUsed: false,
    tutorUsed: false,
    firstSubmission: true,
    submittedAt: "2026-09-20T10:00:00.000Z",
    localDate: "2026-09-20",
    durationMs: 4000,
    response: "answered",
    helpLevel: 0,
    assisted: false,
    itemDifficulty: 2,
    predictedP: 0.7,
    source: "microlicao",
  }));

  const journeyHistory = Array.from({ length: 200 }, (_, i) => ({
    activityId: `atv-${i}`,
    kind: "pratica",
    skillIds: [`mat:habilidade-sintetica-${i % 400}`],
    subjectId: "mat",
    completedAt: "2026-09-20T10:00:00.000Z",
    scorePct: 80,
  }));

  const events = Array.from({ length: 300 }, (_, i) => ({
    type: "activity-completed",
    at: "2026-09-20T10:00:00.000Z",
    localDate: "2026-09-20",
    skillId: `mat:habilidade-sintetica-${i % 400}`,
    activityId: `atv-${i}`,
    meta: { scorePct: 80 },
  }));

  return {
    schemaVersion: 5,
    prefs: { name: "Aluno Sintético", dailyLessons: 3 },
    learning: {
      skillModel,
      recentAttempts,
      journey: {
        committed: [],
        upcoming: [],
        history: journeyHistory,
        activeActivity: null,
        sinceCheckpoint: 5,
        lastCheckpointDate: "2026-09-19",
        planVersion: 1,
      },
      events,
      placement: null,
      focusSession: null,
      modelMeta: { algoVersion: 1, bootstrappedAt: "2026-09-01T00:00:00.000Z" },
    },
  };
}

describe("orçamento de armazenamento — estado pesado (docs/30 §21.1)", () => {
  test("serializa em menos de 1 MB", () => {
    const bruto = estadoPesadoBruto();
    const campos = computeAdditiveFields(bruto, "2026-09-21");
    const tamanho = new Blob([JSON.stringify({ ...bruto, learning: campos.learning })]).size;
    expect(tamanho).toBeLessThan(1024 * 1024);
  });

  test("migração roda em menos de 50ms mesmo no estado pesado", () => {
    const bruto = estadoPesadoBruto();
    const inicio = performance.now();
    computeAdditiveFields(bruto, "2026-09-21");
    const duracao = performance.now() - inicio;
    expect(duracao).toBeLessThan(50);
  });

  test("preserva a contagem das estruturas no limite (nada é cortado além do já documentado)", () => {
    const bruto = estadoPesadoBruto();
    const campos = computeAdditiveFields(bruto, "2026-09-21");
    expect(Object.keys(campos.learning.skillModel)).toHaveLength(400);
    expect(campos.learning.recentAttempts).toHaveLength(500);
    expect(campos.learning.journey.history).toHaveLength(200);
    expect(campos.learning.events).toHaveLength(300);
  });
});
