import { beforeEach, describe, expect, test } from "bun:test";
import {
  applyCheckpointRecalibration,
  clearExpiredFocusSession,
  commitPlan,
  completeJourneyActivity,
  discardJourneyActivity,
  getState,
  invalidateJourneyPlan,
  reset,
  setActiveActivity,
  startJourneyActivity,
  syncJourneyWithCompletions,
} from "@/lib/store";
import { PLANNER_VERSION } from "@/lib/adaptive/constants";
import type { PlannedActivity } from "@/lib/adaptive/types";

/**
 * Ações "burras" da jornada (docs/30 §14, Fase 12 F12.1) — store.ts nunca
 * decide o plano, só grava o que `journey.ts` (fora daqui) já decidiu.
 */
// `reset()` devolve o PRÓPRIO `defaultState`; vários testes abaixo mutam `getState()` direto. Sem um `setState`
// (que clona) antes, essas mutações contaminariam o estado padrão de TODOS os testes seguintes do processo do
// `bun test` (foi o que quebrava `store-placement-actions.test.ts` com a atividade "velha"). `commitPlan` clona.
beforeEach(() => {
  reset();
  commitPlan([], []);
});

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

/** Marca uma conclusão de aula/legado "agora" (depois de qualquer `startedAt` gravado até aqui). */
const agoraISO = () => new Date().toISOString();

describe("commitPlan", () => {
  test("grava committed/upcoming e atualiza planVersion (PLANNER_VERSION, não ALGO_VERSION — RP-5)", () => {
    commitPlan([atividade({ id: "a1" })], [atividade({ id: "a2" })]);
    const s = getState();
    expect(s.learning.journey.committed.map((a) => a.id)).toEqual(["a1"]);
    expect(s.learning.journey.upcoming.map((a) => a.id)).toEqual(["a2"]);
    expect(s.learning.journey.planVersion).toBe(PLANNER_VERSION);
  });

  test("grava a assinatura de foco quando informada (RF-9) e a mantém quando não", () => {
    commitPlan([], [], "todas:::|");
    expect(getState().learning.journey.focusSignature).toBe("todas:::|");
    commitPlan([], []);
    expect(getState().learning.journey.focusSignature).toBe("todas:::|");
  });
});

describe("startJourneyActivity (docs/36 RF-2, T-02.1)", () => {
  test("grava activeActivity com startedAt e emite 1 evento activity-started", () => {
    const a = atividade();
    const gravada = startJourneyActivity(a);
    const s = getState();
    expect(s.learning.journey.activeActivity?.id).toBe(a.id);
    expect(s.learning.journey.activeActivity?.startedAt).toBeTruthy();
    expect(gravada.startedAt).toBe(s.learning.journey.activeActivity?.startedAt);
    expect(s.learning.events).toHaveLength(1);
    expect(s.learning.events[0].type).toBe("activity-started");
    expect(s.learning.events[0].activityId).toBe(a.id);
  });

  test("chamar 2x na mesma atividade preserva startedAt e emite UM evento", () => {
    const a = atividade();
    const primeira = startJourneyActivity(a);
    const segunda = startJourneyActivity(a);
    expect(segunda.startedAt).toBe(primeira.startedAt);
    expect(getState().learning.events.filter((e) => e.type === "activity-started")).toHaveLength(1);
  });

  test("itemIds do argumento só entram se a atividade ativa ainda não tem itens", () => {
    const a = atividade();
    startJourneyActivity({ ...a, itemIds: ["q1", "q2"] });
    const de = startJourneyActivity({ ...a, itemIds: ["q9", "q8", "q7"] });
    expect(de.itemIds).toEqual(["q1", "q2"]);
    expect(getState().learning.journey.activeActivity?.itemIds).toEqual(["q1", "q2"]);
  });

  test("atividade ativa SEM itens recebe os itens do 2º chamado (Home só navegou, a rota escolheu)", () => {
    const a = atividade();
    startJourneyActivity(a);
    const com = startJourneyActivity({ ...a, itemIds: ["q1", "q2"] });
    expect(com.itemIds).toEqual(["q1", "q2"]);
  });

  test("outra atividade substitui a ativa e tem o próprio startedAt/evento", () => {
    startJourneyActivity(atividade({ id: "a1" }));
    startJourneyActivity(atividade({ id: "a2" }));
    expect(getState().learning.journey.activeActivity?.id).toBe("a2");
    expect(getState().learning.events.filter((e) => e.type === "activity-started")).toHaveLength(2);
  });

  test("setActiveActivity é só um alias depreciado da ação nova", () => {
    setActiveActivity(atividade({ id: "a1" }));
    expect(getState().learning.journey.activeActivity?.startedAt).toBeTruthy();
  });
});

describe("discardJourneyActivity (docs/36 RF-3, T-02.2)", () => {
  test("tira de committed e de activeActivity, avança seq, registra activity-skipped com o motivo", () => {
    commitPlan([atividade({ id: "a1" }), atividade({ id: "a2" })], []);
    startJourneyActivity(atividade({ id: "a1" }));
    const seqAntes = getState().learning.journey.seq ?? 0;
    discardJourneyActivity("a1", "sem-itens");
    const j = getState().learning.journey;
    expect(j.committed.map((a) => a.id)).toEqual(["a2"]);
    expect(j.activeActivity).toBeNull();
    expect(j.seq).toBe(seqAntes + 1);
    const ev = getState().learning.events.filter((e) => e.type === "activity-skipped");
    expect(ev).toHaveLength(1);
    expect(ev[0].activityId).toBe("a1");
    expect(ev[0].meta?.reason).toBe("sem-itens");
  });

  test("NÃO paga XP, NÃO entra no histórico, NÃO mexe em sinceCheckpoint nem no bloco do dia", () => {
    commitPlan([atividade({ id: "a1" })], []);
    const antes = getState();
    const xp = antes.progress.xp;
    const blocos = antes.progress.today.completedBlockIds.length;
    discardJourneyActivity("a1", "sem-itens");
    const depois = getState();
    expect(depois.progress.xp).toBe(xp);
    expect(depois.progress.today.completedBlockIds.length).toBe(blocos);
    expect(depois.learning.journey.history).toHaveLength(0);
    expect(depois.learning.journey.sinceCheckpoint).toBe(0);
    expect(Object.keys(depois.learning.rewardLedger)).toHaveLength(0);
  });

  test("descartar um id que já não está na fila é no-op (StrictMode/duplo disparo não conta de novo)", () => {
    commitPlan([atividade({ id: "a1" })], []);
    discardJourneyActivity("a1", "sem-itens");
    const seq = getState().learning.journey.seq;
    discardJourneyActivity("a1", "sem-itens");
    expect(getState().learning.journey.seq).toBe(seq);
    expect(getState().learning.events.filter((e) => e.type === "activity-skipped")).toHaveLength(1);
  });
});

describe("invalidateJourneyPlan (docs/36 RF-8)", () => {
  test("esvazia a fila mas PRESERVA a atividade iniciada no topo", () => {
    commitPlan([atividade({ id: "a1" }), atividade({ id: "a2" })], [atividade({ id: "a3" })]);
    startJourneyActivity(atividade({ id: "a1" }));
    invalidateJourneyPlan();
    const j = getState().learning.journey;
    expect(j.committed.map((a) => a.id)).toEqual(["a1"]);
    expect(j.committed[0].startedAt).toBeTruthy();
    expect(j.upcoming).toEqual([]);
  });

  test("sem atividade iniciada, esvazia tudo", () => {
    commitPlan([atividade({ id: "a1" })], [atividade({ id: "a2" })]);
    invalidateJourneyPlan();
    expect(getState().learning.journey.committed).toEqual([]);
  });
});

describe("clearExpiredFocusSession (docs/36 RF-9)", () => {
  test("limpa 'só hoje' de ontem sem recarregar e devolve true", () => {
    getState().learning.focusSession = { subjectIds: ["fis"], startedAt: "2026-09-27T08:00:00.000Z", expiresOn: "2026-09-27" };
    expect(clearExpiredFocusSession("2026-09-28")).toBe(true);
    expect(getState().learning.focusSession).toBeNull();
  });

  test("sessão de hoje fica; sem sessão é no-op", () => {
    getState().learning.focusSession = { subjectIds: ["fis"], startedAt: "2026-09-28T08:00:00.000Z", expiresOn: "2026-09-28" };
    expect(clearExpiredFocusSession("2026-09-28")).toBe(false);
    expect(getState().learning.focusSession).not.toBeNull();
    getState().learning.focusSession = null;
    expect(clearExpiredFocusSession("2026-09-28")).toBe(false);
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

  test("completar a MESMA tentativa 2x não paga XP de novo e devolve alreadyCompleted", () => {
    const a = atividade({ id: "a1", kind: "pratica" });
    const r1 = completeJourneyActivity(a, 5, 5);
    const r2 = completeJourneyActivity(a, 5, 5);
    expect(r1.xpAwarded).toBe(30);
    expect(r1.alreadyCompleted).toBe(false);
    expect(r2.xpAwarded).toBe(0);
    expect(r2.alreadyCompleted).toBe(true);
  });

  /**
   * Substitui o teste antigo "melhorar a faixa numa repetição paga só a DIFERENÇA"
   * (docs/37, D-4): a MESMA tentativa não pode mais ser contada duas vezes (RF-6),
   * então "melhorar a faixa reenviando a mesma tentativa" deixou de existir — o
   * reenvio é no-op e NÃO paga a diferença. A diferença de faixa em replay continua
   * valendo onde replay existe (aula/legado: `completeMicroLesson`/`completeLesson`).
   */
  test("reenviar a mesma tentativa com faixa melhor NÃO paga a diferença (RF-6)", () => {
    const a = atividade({ id: "a1", kind: "pratica" });
    const r1 = completeJourneyActivity(a, 2, 5); // 40% -> 1 estrela -> 10 XP
    const r2 = completeJourneyActivity(a, 5, 5); // mesma tentativa: no-op
    expect(r1.xpAwarded).toBe(10);
    expect(r2.xpAwarded).toBe(0);
    expect(r2.alreadyCompleted).toBe(true);
  });

  test("tentativas diferentes (startedAt distinto) pagam pelo ledger de cada uma (chave por tentativa)", () => {
    const a1 = atividade({ id: "a1", kind: "pratica", startedAt: "2026-09-28T10:00:00.000Z" });
    const a2 = atividade({ id: "a1", kind: "pratica", startedAt: "2026-09-28T11:00:00.000Z" });
    expect(completeJourneyActivity(a1, 5, 5).xpAwarded).toBe(30);
    expect(completeJourneyActivity(a2, 5, 5).xpAwarded).toBe(30);
    const ledger = getState().learning.rewardLedger;
    expect(Object.keys(ledger).filter((k) => k.startsWith("atividade:a1@"))).toHaveLength(2);
  });

  test("sem startedAt, a chave do ledger é a antiga (atividade:<id>) — preservada p/ tentativas de antes do plano", () => {
    completeJourneyActivity(atividade({ id: "a1", kind: "pratica" }), 5, 5);
    expect(getState().learning.rewardLedger["atividade:a1"]?.xp).toBe(30);
  });

  test("empilha no histórico da jornada com scorePct calculado, attemptKey e localDate", () => {
    completeJourneyActivity(atividade({ id: "a1" }), 3, 4);
    const h = getState().learning.journey.history;
    expect(h).toHaveLength(1);
    expect(h[0].activityId).toBe("a1");
    expect(h[0].scorePct).toBe(75);
    expect(h[0].attemptKey).toBe("a1@sem-inicio");
    expect(h[0].localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("avança o contador seq a cada conclusão (docs/36 RF-7)", () => {
    completeJourneyActivity(atividade({ id: "a1" }), 3, 4);
    expect(getState().learning.journey.seq).toBe(1);
    completeJourneyActivity(atividade({ id: "a2" }), 3, 4);
    expect(getState().learning.journey.seq).toBe(2);
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
    // simula conclusão via completedLessons (o que completeMicroLesson já teria feito), DEPOIS do início
    const s = getState();
    s.learning.completedLessons["licao-x"] = { version: 1, completedAt: agoraISO(), stars: 3, bestPct: 100 };
    syncJourneyWithCompletions();
    expect(getState().learning.journey.activeActivity).toBeNull();
    expect(getState().learning.journey.history).toHaveLength(1);
    expect(getState().learning.journey.history[0].attemptKey).toContain("a1@");
    expect(getState().progress.xp).toBe(xpAntes); // nenhum XP pago aqui
  });

  test("legado com lessonId JÁ concluída (progress.lessons) -> move pro histórico", () => {
    setActiveActivity(atividade({ id: "a1", kind: "legado", lessonId: "licao-legada", subjectId: "red" }));
    const s = getState();
    s.progress.lessons["licao-legada"] = { lessonId: "licao-legada", stars: 3, bestPct: 100, completedAt: agoraISO() };
    syncJourneyWithCompletions();
    expect(getState().learning.journey.activeActivity).toBeNull();
    expect(getState().learning.journey.history).toHaveLength(1);
  });

  // docs/36 RF-4 (C4c, T-02.3)
  test("(a) reforço de aula concluída ONTEM + iniciado hoje + sync sem estudar -> continua ativo", () => {
    getState().learning.completedLessons["licao-x"] = { version: 1, completedAt: "2026-09-27T10:00:00.000Z", stars: 3, bestPct: 100 };
    commitPlan([atividade({ id: "r1", kind: "reforco", lessonId: "licao-x" })], []);
    startJourneyActivity(atividade({ id: "r1", kind: "reforco", lessonId: "licao-x" }));
    syncJourneyWithCompletions();
    const j = getState().learning.journey;
    expect(j.activeActivity?.id).toBe("r1");
    expect(j.committed[0]?.id).toBe("r1");
    expect(j.history).toHaveLength(0);
  });

  test("(b) concluir o reforço (completedAt novo, >= startedAt) -> sai da fila e vai pro histórico", () => {
    getState().learning.completedLessons["licao-x"] = { version: 1, completedAt: "2026-09-27T10:00:00.000Z", stars: 3, bestPct: 100 };
    commitPlan([atividade({ id: "r1", kind: "reforco", lessonId: "licao-x" })], []);
    startJourneyActivity(atividade({ id: "r1", kind: "reforco", lessonId: "licao-x" }));
    // replay: completeMicroLesson regrava completedAt
    getState().learning.completedLessons["licao-x"].completedAt = agoraISO();
    syncJourneyWithCompletions();
    const j = getState().learning.journey;
    expect(j.activeActivity).toBeNull();
    expect(j.committed).toHaveLength(0);
    expect(j.history).toHaveLength(1);
  });

  test("(c) activeActivity SEM startedAt (de antes do plano 36) -> regra antiga: existir o registro basta", () => {
    getState().learning.completedLessons["licao-x"] = { version: 1, completedAt: "2026-09-27T10:00:00.000Z", stars: 3, bestPct: 100 };
    getState().learning.journey.activeActivity = atividade({ id: "velha", kind: "aula", lessonId: "licao-x" });
    syncJourneyWithCompletions();
    expect(getState().learning.journey.activeActivity).toBeNull();
    expect(getState().learning.journey.history).toHaveLength(1);
    expect(getState().learning.journey.history[0].attemptKey).toBe("velha@sem-inicio");
  });

  test("sync 2x não duplica o histórico (idempotente por attemptKey)", () => {
    startJourneyActivity(atividade({ id: "a1", kind: "aula", lessonId: "licao-x" }));
    getState().learning.completedLessons["licao-x"] = { version: 1, completedAt: agoraISO(), stars: 3, bestPct: 100 };
    syncJourneyWithCompletions();
    // simula a atividade voltando a ser ativa (ex.: estado restaurado) e o sync rodando de novo
    const h = getState().learning.journey.history[0];
    getState().learning.journey.activeActivity = atividade({ id: "a1", kind: "aula", lessonId: "licao-x", startedAt: h.attemptKey!.split("@")[1] });
    syncJourneyWithCompletions();
    expect(getState().learning.journey.history).toHaveLength(1);
  });
});

/**
 * docs/36 RF-6 (bug C4d, T-02.5; era o vermelho intencional da T-01.5): concluir a
 * MESMA tentativa duas vezes (clique duplo, re-render, remontagem) não duplica
 * histórico, `sinceCheckpoint`, bloco do dia, evento nem XP.
 */
describe("completeJourneyActivity — idempotência de TODOS os efeitos (docs/36 RF-6, C4d)", () => {
  test("concluir a mesma tentativa 2x: 1 entrada no histórico, sinceCheckpoint +1, 1 evento activity-completed", () => {
    const a = atividade({ id: "a-idem", kind: "pratica" });
    completeJourneyActivity(a, 5, 5);
    completeJourneyActivity(a, 5, 5);
    const j = getState().learning.journey;
    expect(j.history.filter((h) => h.activityId === "a-idem")).toHaveLength(1);
    expect(j.sinceCheckpoint).toBe(1);
    expect(getState().learning.events.filter((e) => e.type === "activity-completed" && e.activityId === "a-idem")).toHaveLength(1);
  });

  test("também não duplica bloco do dia, seq nem XP (com startedAt)", () => {
    const a = atividade({ id: "a-idem2", kind: "pratica", startedAt: "2026-09-28T10:00:00.000Z" });
    const xp0 = getState().progress.xp;
    const blocos0 = getState().progress.today.completedBlockIds.length;
    completeJourneyActivity(a, 5, 5);
    const seq = getState().learning.journey.seq;
    completeJourneyActivity(a, 5, 5);
    completeJourneyActivity(a, 4, 5);
    expect(getState().progress.xp).toBe(xp0 + 30);
    expect(getState().progress.today.completedBlockIds.length).toBe(blocos0 + 1);
    expect(getState().learning.journey.seq).toBe(seq);
  });

  test("a 2ª chamada ainda higieniza se algo apontar pra atividade (sem efeito de progresso)", () => {
    const a = atividade({ id: "a1", kind: "pratica" });
    commitPlan([a, atividade({ id: "a2" })], []);
    completeJourneyActivity(a, 5, 5);
    getState().learning.journey.committed.unshift(a); // restaurou por engano (ex.: commitPlan velho)
    completeJourneyActivity(a, 5, 5);
    expect(getState().learning.journey.committed.map((x) => x.id)).toEqual(["a2"]);
    expect(getState().learning.journey.history).toHaveLength(1);
  });
});

describe("applyCheckpointRecalibration (docs/36 T-04.4, RP-4)", () => {
  const HOJE = "2026-09-28";

  test("antecipar: revisão que vencia depois passa a vencer amanhã; a que já vence antes NÃO é adiada", () => {
    const j = getState().learning;
    j.reviewSchedule["mat:a"] = { skillId: "mat:a", intervalDays: 14, dueDate: "2026-10-12", lastResult: "correct" };
    j.reviewSchedule["mat:b"] = { skillId: "mat:b", intervalDays: 1, dueDate: "2026-09-27", lastResult: "incorrect" };
    expect(applyCheckpointRecalibration({ antecipar: ["mat:a", "mat:b"], desafio: [], today: HOJE })).toBe(true);
    const r = getState().learning.reviewSchedule;
    expect(r["mat:a"].dueDate).toBe("2026-09-29");
    expect(r["mat:a"].intervalDays).toBe(14); // só a data antecipa; escada intacta
    expect(r["mat:b"].dueDate).toBe("2026-09-27"); // nunca adia
  });

  test("antecipar habilidade sem agenda cria uma de 1 dia, vencendo amanhã", () => {
    applyCheckpointRecalibration({ antecipar: ["mat:nova"], desafio: [], today: HOJE });
    expect(getState().learning.reviewSchedule["mat:nova"]).toEqual({
      skillId: "mat:nova", intervalDays: 1, dueDate: "2026-09-29", lastResult: "incorrect",
    });
  });

  test("desafio: challengeEligible = hoje + 7 dias; poda sinais vencidos e mantém os válidos", () => {
    const j = getState().learning.journey;
    j.challengeEligible = { "mat:velho": "2026-09-20", "mat:vale": "2026-10-02" };
    applyCheckpointRecalibration({ antecipar: [], desafio: ["mat:y"], today: HOJE });
    expect(getState().learning.journey.challengeEligible).toEqual({ "mat:vale": "2026-10-02", "mat:y": "2026-10-05" });
  });

  test("idempotente: 2ª chamada igual não muda datas nem sinais (só acrescenta 1 evento de auditoria)", () => {
    const args = { antecipar: ["mat:a"], desafio: ["mat:y"], today: HOJE };
    applyCheckpointRecalibration(args);
    const antes = JSON.stringify([getState().learning.reviewSchedule, getState().learning.journey.challengeEligible]);
    applyCheckpointRecalibration(args);
    expect(JSON.stringify([getState().learning.reviewSchedule, getState().learning.journey.challengeEligible])).toBe(antes);
  });

  test("evento checkpoint-recalibrated com contagens; listas vazias não fazem nada nem geram evento", () => {
    const n0 = getState().learning.events.length;
    expect(applyCheckpointRecalibration({ antecipar: [], desafio: [], today: HOJE })).toBe(false);
    expect(getState().learning.events.length).toBe(n0);
    applyCheckpointRecalibration({ antecipar: ["mat:a", "mat:a"], desafio: ["mat:y"], today: HOJE });
    const ev = getState().learning.events.filter((e) => e.type === "checkpoint-recalibrated");
    expect(ev).toHaveLength(1);
    expect(ev[0].meta).toEqual({ antecipadas: 1, desafio: 1 });
  });

  test("concluir o desafio da habilidade consome o sinal (só o dela)", () => {
    getState().learning.journey.challengeEligible = { "mat:y": "2026-10-05", "mat:z": "2026-10-05" };
    completeJourneyActivity(atividade({ id: "d1", kind: "desafio", skillIds: ["mat:y"] }), 2, 3);
    expect(getState().learning.journey.challengeEligible).toEqual({ "mat:z": "2026-10-05" });
  });
});
