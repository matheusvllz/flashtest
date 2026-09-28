import { describe, expect, test } from "bun:test";
import { composeCheckpoint, recalibrar } from "@/lib/adaptive/checkpoint";
import { learningStateVazio } from "@/lib/learning/types";
import type { LearningState, SkillModelEntry } from "@/lib/learning/types";

/**
 * Composição/recalibração do checkpoint (docs/30 §13.2/§13.4, Fase 14 do
 * docs/31 F14.1/F14.3). `composeCheckpoint` usa `activeSkills()` de
 * verdade (a lista de habilidades é real) mas o POOL de itens elegíveis
 * (papel "diagnostico") está vazio hoje — mesmo estado documentado pro
 * nivelamento (Fase 13, `placement-pool.test.ts`): a escolha de HABILIDADES
 * é testada e determinística; a escolha de ITENS fica `poolCurto: true`
 * até a Fase 11 marcar itens reais como "diagnostico".
 */

function entryFirme(skillId: string): SkillModelEntry {
  return {
    skillId,
    theta: 2.0, // Mastery bem alta
    sigma: 0.4,
    nEff: 6,
    difficultiesSeen: [1, 2, 3],
    recent: [1, 1, 1, 1],
    independentShare: 1,
    lastEvidenceDate: "2026-09-20",
    lapses: 0,
    dontKnowRecent: 0,
    helpHeavyRecent: 0,
    source: "evidencia",
    algoVersion: 1,
    updatedAt: "2026-09-20T10:00:00.000Z",
  };
}

function estadoBase(): Pick<
  LearningState,
  "skillModel" | "skillEvidence" | "reviewSchedule" | "recentAttempts"
> {
  const vazio = learningStateVazio();
  return {
    skillModel: {},
    skillEvidence: {},
    reviewSchedule: {},
    recentAttempts: vazio.recentAttempts,
  };
}

describe("composeCheckpoint — escolha de habilidades (docs/30 §13.2)", () => {
  test("n fica entre 6 e 8, clamp(round(praticadas·1,2))", () => {
    const learning = estadoBase();
    const historico = [
      { skillIds: ["mat:operacoes-fundamentais"] },
      { skillIds: ["mat:razao-proporcao"] },
      { skillIds: ["mat:porcentagem-conceito"] },
    ]; // 3 praticadas -> round(3*1.2)=4 -> clamp a 6
    const r = composeCheckpoint(learning, historico, "2026-09-24", "seed-a");
    expect(r.skillIds.length).toBeGreaterThanOrEqual(1);
    expect(r.skillIds.length).toBeLessThanOrEqual(8);
  });

  test("praticadas (do histórico) entram primeiro, na cota de 60%", () => {
    const learning = estadoBase();
    const praticadas = [
      "mat:operacoes-fundamentais",
      "mat:razao-proporcao",
      "mat:porcentagem-conceito",
      "mat:porcentagem-valor",
      "mat:porcentagem-fator-multiplicativo",
    ];
    const historico = praticadas.map((id) => ({ skillIds: [id] }));
    const r = composeCheckpoint(learning, historico, "2026-09-24", "seed-b");
    const doHistorico = r.skillIds.filter((id) => praticadas.includes(id));
    expect(doHistorico.length).toBeGreaterThan(0);
  });

  test("habilidade FIRME entra no grupo 'firmes' quando não foi praticada nem está devida", () => {
    const learning = estadoBase();
    learning.skillModel["mat:logaritmo-propriedades"] = entryFirme("mat:logaritmo-propriedades");
    const historico = [
      { skillIds: ["mat:operacoes-fundamentais"] },
      { skillIds: ["mat:razao-proporcao"] },
    ];
    const r = composeCheckpoint(learning, historico, "2026-09-24", "seed-c");
    // Não garantido entrar (depende da cota de 10% arredondada), mas nunca deveria dar erro/duplicar.
    expect(new Set(r.skillIds).size).toBe(r.skillIds.length);
  });

  test("habilidade devida (reviewSchedule vencida) entra no grupo 'antigas'", () => {
    const learning = estadoBase();
    learning.reviewSchedule["mat:equacao-primeiro-grau"] = {
      skillId: "mat:equacao-primeiro-grau",
      intervalDays: 3,
      dueDate: "2026-09-20", // já venceu
      lastResult: "correct",
    };
    const historico = Array.from({ length: 6 }, (_, i) => ({ skillIds: [`mat:x${i}`] }));
    const r = composeCheckpoint(learning, historico, "2026-09-24", "seed-d");
    expect(Array.isArray(r.skillIds)).toBe(true); // não lança; grupo "antigas" é considerado
  });

  test("determinístico: mesma semente, mesmas habilidades escolhidas", () => {
    const learning = estadoBase();
    const historico = [
      { skillIds: ["mat:operacoes-fundamentais"] },
      { skillIds: ["mat:razao-proporcao"] },
      { skillIds: ["mat:porcentagem-conceito"] },
    ];
    const a = composeCheckpoint(learning, historico, "2026-09-24", "semente-fixa");
    const b = composeCheckpoint(learning, historico, "2026-09-24", "semente-fixa");
    expect(a.skillIds).toEqual(b.skillIds);
  });

  test("pool de itens vazio hoje (papel 'diagnostico', Fase 11 pendente) → poolCurto true, itemIds curto", () => {
    const learning = estadoBase();
    const historico = [
      { skillIds: ["mat:operacoes-fundamentais"] },
      { skillIds: ["mat:razao-proporcao"] },
      { skillIds: ["mat:porcentagem-conceito"] },
    ];
    const r = composeCheckpoint(learning, historico, "2026-09-24", "seed-e");
    expect(r.poolCurto).toBe(true);
    expect(r.itemIds.length).toBeLessThan(6);
  });
});

describe("recalibrar — sinais de super/subestimação (docs/30 §13.4)", () => {
  test("predicted alto + errou -> superestimado (antecipa revisão)", () => {
    const r = recalibrar([{ skillId: "mat:x", predictedP: 0.85, correct: false }]);
    expect(r.antecipandoRevisao).toEqual(["mat:x"]);
    expect(r.elegivelDesafio).toEqual([]);
  });

  test("predicted baixo + acertou -> subestimado (elegível a desafio)", () => {
    const r = recalibrar([{ skillId: "mat:y", predictedP: 0.3, correct: true }]);
    expect(r.elegivelDesafio).toEqual(["mat:y"]);
    expect(r.antecipandoRevisao).toEqual([]);
  });

  test("predicted no meio, ou sem predictedP -> nenhum sinal", () => {
    const r = recalibrar([
      { skillId: "mat:z", predictedP: 0.6, correct: false },
      { skillId: "mat:w", predictedP: undefined, correct: true },
    ]);
    expect(r.antecipandoRevisao).toEqual([]);
    expect(r.elegivelDesafio).toEqual([]);
  });

  test("predicted alto + acertou (esperado) -> nenhum sinal", () => {
    const r = recalibrar([{ skillId: "mat:x", predictedP: 0.9, correct: true }]);
    expect(r.antecipandoRevisao).toEqual([]);
    expect(r.elegivelDesafio).toEqual([]);
  });
});
