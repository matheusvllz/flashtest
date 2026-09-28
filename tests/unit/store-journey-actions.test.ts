import { beforeEach, describe, expect, test } from "bun:test";
import {
  commitPlan,
  completeJourneyActivity,
  getState,
  reset,
  setActiveActivity,
  syncJourneyWithCompletions,
} from "@/lib/store";
import { ALGO_VERSION } from "@/lib/adaptive/constants";
import type { PlannedActivity } from "@/lib/adaptive/types";

/**
 * Ações "burras" da jornada (docs/30 §14, Fase 12 F12.1) — store.ts nunca
 * decide o plano, só grava o que `journey.ts` (fora daqui) já decidiu.
 */
beforeEach(() => reset());

function atividade(overrides: Partial<PlannedActivity> = {}): PlannedActivity {
  return {
    id: "atv-1",
    kind: "pratica",
    skillIds: ["mat:x"],
    subjectId: "mat",
    estimatedMinutes: 5,
    reasons: ["consolidar"],
    score: 0.5,
    scoreBreakdown: {},
    ...overrides,
  };
}

describe("commitPlan", () => {
  test("grava committed/upcoming e atualiza planVersion", () => {
    commitPlan([atividade({ id: "a1" })], [atividade({ id: "a2" })]);
    const s = getState();
    expect(s.learning.journey.committed.map((a) => a.id)).toEqual(["a1"]);
    expect(s.learning.journey.upcoming.map((a) => a.id)).toEqual(["a2"]);
    expect(s.learning.journey.planVersion).toBe(ALGO_VERSION);
  });
});

describe("setActiveActivity", () => {
  test("grava activeActivity e um evento activity-started", () => {
    const a = atividade();
    setActiveActivity(a);
    const s = getState();
    expect(s.learning.journey.activeActivity?.id).toBe(a.id);
    expect(s.learning.events).toHaveLength(1);
    expect(s.learning.events[0].type).toBe("activity-started");
    expect(s.learning.events[0].activityId).toBe(a.id);
  });
});

describe("completeJourneyActivity", () => {
  test("prática com 90%+ paga 30 XP (3 estrelas)", () => {
    commitPlan([atividade({ id: "a1", kind: "pratica" })], []);
    const antes = getState().progress.xp;
    const { xpAwarded, stars } = completeJourneyActivity(atividade({ id: "a1", kind: "pratica" }), 5, 5);
    expect(xpAwarded).toBe(30);
    expect(stars).toBe(3);
    expect(getState().progress.xp).toBe(antes + 30);
  });

  test("stars é null quando total é 0 (checkpoint sem questão pontuada, por exemplo)", () => {
    const { stars } = completeJourneyActivity(atividade({ id: "a1", kind: "checkpoint" }), 0, 0);
    expect(stars).toBeNull();
  });

  test("revisão sempre paga 5 XP fixo, independente do acerto", () => {
    const { xpAwarded } = completeJourneyActivity(atividade({ id: "a1", kind: "revisao" }), 2, 4);
    expect(xpAwarded).toBe(5);
  });

  test("checkpoint sempre paga 20 XP fixo, independente do acerto", () => {
    const { xpAwarded } = completeJourneyActivity(atividade({ id: "a1", kind: "checkpoint" }), 0, 8);
    expect(xpAwarded).toBe(20);
  });

  test("idempotente por ledger — completar a MESMA atividade 2x não paga XP de novo", () => {
    const a = atividade({ id: "a1", kind: "pratica" });
    const r1 = completeJourneyActivity(a, 5, 5);
    const r2 = completeJourneyActivity(a, 5, 5);
    expect(r1.xpAwarded).toBe(30);
    expect(r2.xpAwarded).toBe(0);
  });

  test("melhorar a faixa numa repetição paga só a DIFERENÇA", () => {
    const a = atividade({ id: "a1", kind: "pratica" });
    completeJourneyActivity(a, 2, 5); // 40% -> 1 estrela -> 10 XP
    const r2 = completeJourneyActivity(a, 5, 5); // 100% -> 3 estrelas -> 30 XP, já pagou 10
    expect(r2.xpAwarded).toBe(20);
  });

  test("empilha no histórico da jornada com scorePct calculado", () => {
    completeJourneyActivity(atividade({ id: "a1" }), 3, 4);
    const h = getState().learning.journey.history;
    expect(h).toHaveLength(1);
    expect(h[0].activityId).toBe("a1");
    expect(h[0].scorePct).toBe(75);
  });

  test("tira do topo de committed SÓ se for a mesma atividade", () => {
    commitPlan([atividade({ id: "a1" }), atividade({ id: "a2" })], []);
    completeJourneyActivity(atividade({ id: "a1" }), 5, 5);
    expect(getState().learning.journey.committed.map((a) => a.id)).toEqual(["a2"]);
  });

  test("NÃO tira do committed se a atividade concluída não é a do topo", () => {
    commitPlan([atividade({ id: "a1" }), atividade({ id: "a2" })], []);
    completeJourneyActivity(atividade({ id: "a2" }), 5, 5); // concluiu fora de ordem
    expect(getState().learning.journey.committed.map((a) => a.id)).toEqual(["a1", "a2"]);
  });

  test("checkpoint zera sinceCheckpoint e grava lastCheckpointDate; outras atividades incrementam", () => {
    completeJourneyActivity(atividade({ id: "a1", kind: "pratica" }), 5, 5);
    expect(getState().learning.journey.sinceCheckpoint).toBe(1);
    completeJourneyActivity(atividade({ id: "a2", kind: "checkpoint" }), 5, 5);
    expect(getState().learning.journey.sinceCheckpoint).toBe(0);
    expect(getState().learning.journey.lastCheckpointDate).not.toBeNull();
  });

  test("limpa activeActivity se era a atividade concluída", () => {
    const a = atividade({ id: "a1" });
    setActiveActivity(a);
    completeJourneyActivity(a, 5, 5);
    expect(getState().learning.journey.activeActivity).toBeNull();
  });

  test("grava evento activity-completed", () => {
    completeJourneyActivity(atividade({ id: "a1" }), 4, 4);
    const eventos = getState().learning.events;
    expect(eventos.some((e) => e.type === "activity-completed" && e.activityId === "a1")).toBe(true);
  });
});

describe("syncJourneyWithCompletions", () => {
  test("sem activeActivity, não faz nada", () => {
    expect(() => syncJourneyWithCompletions()).not.toThrow();
    expect(getState().learning.journey.history).toHaveLength(0);
  });

  test("activeActivity sem lessonId (prática/revisão/desafio), não faz nada", () => {
    setActiveActivity(atividade({ id: "a1", kind: "pratica" }));
    syncJourneyWithCompletions();
    expect(getState().learning.journey.history).toHaveLength(0);
    expect(getState().learning.journey.activeActivity).not.toBeNull();
  });

  test("aula com lessonId AINDA não concluída, não move nada", () => {
    setActiveActivity(atividade({ id: "a1", kind: "aula", lessonId: "licao-x" }));
    syncJourneyWithCompletions();
    expect(getState().learning.journey.activeActivity).not.toBeNull();
  });

  test("aula com lessonId JÁ concluída (completedLessons) -> move pro histórico, sem pagar XP", () => {
    setActiveActivity(atividade({ id: "a1", kind: "aula", lessonId: "licao-x" }));
    const xpAntes = getState().progress.xp;
    // simula conclusão via completedLessons (o que completeMicroLesson já teria feito)
    const s = getState();
    s.learning.completedLessons["licao-x"] = { version: 1, completedAt: "2026-09-24T10:00:00.000Z", stars: 3, bestPct: 100 };
    syncJourneyWithCompletions();
    expect(getState().learning.journey.activeActivity).toBeNull();
    expect(getState().learning.journey.history).toHaveLength(1);
    expect(getState().progress.xp).toBe(xpAntes); // nenhum XP pago aqui
  });

  test("legado com lessonId JÁ concluída (progress.lessons) -> move pro histórico", () => {
    setActiveActivity(atividade({ id: "a1", kind: "legado", lessonId: "licao-legada", subjectId: "red" }));
    const s = getState();
    s.progress.lessons["licao-legada"] = { stars: 3 } as never;
    syncJourneyWithCompletions();
    expect(getState().learning.journey.activeActivity).toBeNull();
    expect(getState().learning.journey.history).toHaveLength(1);
  });
});
