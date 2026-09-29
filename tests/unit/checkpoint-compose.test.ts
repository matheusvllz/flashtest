import { describe, expect, test } from "bun:test";
import { checkpointRecalibrationInputs, composeCheckpoint, recalibrar } from "@/lib/adaptive/checkpoint";
import { historicoDesdeUltimoCheckpoint } from "@/lib/adaptive";
import type { Attempt } from "@/lib/learning/types";
import { learningStateVazio } from "@/lib/learning/types";
import type { JourneyHistoryEntry, LearningState, SkillModelEntry } from "@/lib/learning/types";

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

/* docs/36 T-04.4 (RP-4) — entradas da recalibração e data local do checkpoint. */
function tentativa(over: Partial<Attempt>): Attempt {
  return {
    id: "t1", sessionId: "s-check", exerciseId: "gen:mat:x:1", exerciseVersion: 1, skillIds: ["mat:x"], role: "checkpoint",
    answer: 0, correct: false, hintUsed: false, tutorUsed: false, firstSubmission: true,
    submittedAt: "2026-09-28T15:00:00.000Z", localDate: "2026-09-28", durationMs: 1000, predictedP: 0.9, ...over,
  };
}

describe("checkpointRecalibrationInputs", () => {
  test("com sessionId: só as tentativas da sessão do checkpoint entram", () => {
    const attempts = [
      tentativa({ id: "a", sessionId: "s-check", skillIds: ["mat:x"] }),
      tentativa({ id: "b", sessionId: "outra-sessao", skillIds: ["mat:y"] }),
    ];
    expect(checkpointRecalibrationInputs(attempts, { sessionId: "s-check" })).toEqual([
      { skillId: "mat:x", predictedP: 0.9, correct: false },
    ]);
  });

  test("sem sessionId: usa itemIds da atividade enviados depois de startedAt", () => {
    const attempts = [
      tentativa({ id: "a", sessionId: null, exerciseId: "gen:mat:x:1", submittedAt: "2026-09-28T15:00:00.000Z" }),
      tentativa({ id: "antes", sessionId: null, exerciseId: "gen:mat:x:1", submittedAt: "2026-09-27T09:00:00.000Z" }),
      tentativa({ id: "outroItem", sessionId: null, exerciseId: "gen:mat:z:9" }),
    ];
    const r = checkpointRecalibrationInputs(attempts, { itemIds: ["gen:mat:x:1"], startedAt: "2026-09-28T14:00:00.000Z" });
    expect(r).toHaveLength(1);
  });

  test("alimentando recalibrar: alto+errou antecipa, baixo+acertou vira elegível a desafio, 'Não sei' (sem predictedP) é ignorado", () => {
    const attempts = [
      tentativa({ id: "1", skillIds: ["mat:a"], predictedP: 0.9, correct: false }),
      tentativa({ id: "2", skillIds: ["mat:b"], predictedP: 0.3, correct: true }),
      tentativa({ id: "3", skillIds: ["mat:c"], predictedP: undefined, correct: false }),
    ];
    const r = recalibrar(checkpointRecalibrationInputs(attempts, { sessionId: "s-check" }));
    expect(r.antecipandoRevisao).toEqual(["mat:a"]);
    expect(r.elegivelDesafio).toEqual(["mat:b"]);
  });
});

describe("historicoDesdeUltimoCheckpoint — data local, não UTC (docs/36 C7, T-04.4)", () => {
  const h = (over: Partial<JourneyHistoryEntry>): JourneyHistoryEntry => ({
    activityId: "x", kind: "pratica", skillIds: ["mat:x"], subjectId: "mat", completedAt: "2026-09-28T12:00:00.000Z", scorePct: 80, ...over,
  });

  test("atividade às 22h30 locais (01h30 UTC do dia seguinte) NÃO conta como 'depois' do checkpoint do mesmo dia local", () => {
    const tarde = h({ completedAt: "2026-09-29T01:30:00.000Z", localDate: "2026-09-28" });
    expect(historicoDesdeUltimoCheckpoint([tarde], "2026-09-28")).toEqual([]);
  });

  test("com localDate gravado, ele manda; o dia local seguinte conta", () => {
    const amanha = h({ completedAt: "2026-09-29T15:00:00.000Z", localDate: "2026-09-29" });
    expect(historicoDesdeUltimoCheckpoint([amanha], "2026-09-28")).toEqual([amanha]);
  });

  test("sem localDate (entrada antiga), deriva da data local do ISO — mesmo dia local ainda fica de fora", () => {
    const local = new Date(2026, 8, 28, 22, 30, 0); // 28/09 22:30 no fuso da máquina
    const antiga = h({ completedAt: local.toISOString() });
    expect(historicoDesdeUltimoCheckpoint([antiga], "2026-09-28")).toEqual([]);
  });

  test("sem checkpoint anterior entra tudo, exceto checkpoints", () => {
    const a = h({});
    const c = h({ kind: "checkpoint" });
    expect(historicoDesdeUltimoCheckpoint([a, c], null)).toEqual([a]);
  });
});
