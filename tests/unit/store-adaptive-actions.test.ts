import { beforeEach, describe, expect, test } from "bun:test";
import {
  clearFocusSession,
  getState,
  recordEvent,
  reset,
  setDailyMinutes,
  setEasySubjects,
  setStudyFocus,
  startFocusSession,
} from "@/lib/store";

/**
 * Ações novas do schema v6 (docs/30 §15/§21.4, Fase 4 do docs/31) — foco
 * permanente/temporário, minutos por dia, matérias fáceis, anel de eventos.
 * Roda em memória, mesmo padrão de `record-learning-attempt.test.ts`.
 */
beforeEach(() => reset());

describe("foco de estudo (docs/30 §15)", () => {
  test("setStudyFocus grava a preferência permanente", () => {
    setStudyFocus({ mode: "materias", subjectIds: ["mat", "fis"], areas: [] });
    expect(getState().prefs.studyFocus).toEqual({ mode: "materias", subjectIds: ["mat", "fis"], areas: [] });
  });

  test("startFocusSession grava sessão 'só hoje' e um evento focus-changed", () => {
    startFocusSession(["fis"]);
    const s = getState();
    expect(s.learning.focusSession?.subjectIds).toEqual(["fis"]);
    expect(s.learning.focusSession?.expiresOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(s.learning.events).toHaveLength(1);
    expect(s.learning.events[0].type).toBe("focus-changed");
  });

  test("clearFocusSession volta a sessão temporária pra null sem mexer na permanente", () => {
    setStudyFocus({ mode: "materias", subjectIds: ["mat"], areas: [] });
    startFocusSession(["fis"]);
    clearFocusSession();
    const s = getState();
    expect(s.learning.focusSession).toBeNull();
    expect(s.prefs.studyFocus.subjectIds).toEqual(["mat"]); // permanente intacta
  });
});

describe("ritmo declarado (docs/30 §12.2)", () => {
  test("setEasySubjects / setDailyMinutes gravam os campos certos", () => {
    setEasySubjects(["Matemática"]);
    setDailyMinutes(20);
    const s = getState();
    expect(s.prefs.easySubjects).toEqual(["Matemática"]);
    expect(s.prefs.dailyMinutes).toBe(20);
  });
});

describe("recordEvent (docs/30 §21.4)", () => {
  test("grava tipo/data local/extra", () => {
    recordEvent("ai-help-opened", { skillId: "mat:porcentagem-valor", meta: { nivel: 3 } });
    const evento = getState().learning.events[0];
    expect(evento.type).toBe("ai-help-opened");
    expect(evento.skillId).toBe("mat:porcentagem-valor");
    expect(evento.meta).toEqual({ nivel: 3 });
    expect(evento.localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("poda o anel em 300 (mantém os mais recentes)", () => {
    for (let i = 0; i < 305; i++) recordEvent("plan-fallback", { meta: { i } });
    const eventos = getState().learning.events;
    expect(eventos).toHaveLength(300);
    expect(eventos[eventos.length - 1].meta?.i).toBe(304);
    expect(eventos[0].meta?.i).toBe(5); // os 5 primeiros (0..4) já saíram
  });
});
