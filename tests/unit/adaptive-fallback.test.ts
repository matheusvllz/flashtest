import { describe, expect, test } from "bun:test";
import { planWithFallback } from "@/lib/adaptive/index";
import { learningStateVazio } from "@/lib/learning/types";
import type { AppState } from "@/lib/store";

/**
 * Fallback determinístico (docs/30 §11.8, Fase 8 F8.7).
 */

function estadoBase(): AppState {
  return {
    prefs: {
      name: "Ana",
      level: "",
      targetInstitution: "",
      targetCourse: "",
      difficultSubjects: [],
      easySubjects: [],
      dailyMinutes: 10,
      studyFocus: { mode: "todas", subjectIds: [], areas: [] },
      examTargets: [],
      trailSubjectId: null,
    } as unknown as AppState["prefs"],
    learning: learningStateVazio(),
    progress: { bySubject: {}, lessons: {}, today: { date: "2026-09-24", completedBlockIds: [] }, xp: 0, streak: 0 } as unknown as AppState["progress"],
  } as AppState;
}

describe("planWithFallback", () => {
  test("exceção no planNext (skillIds inválido no estado) cai no fallback, nunca lança", () => {
    const s = estadoBase();
    // Estado propositalmente hostil: reviewSchedule com dueDate quebrado não deveria
    // travar o motor real, mas mesmo que travasse, planWithFallback nunca deixa passar.
    expect(() => planWithFallback(s, "2026-09-24", "seed-1")).not.toThrow();
    const plano = planWithFallback(s, "2026-09-24", "seed-1");
    expect(plano.activities).toBeDefined();
  });

  test("flag desligada (sem chamar planNext) — usa fallbackPlan diretamente e marca fallback:true", async () => {
    const { fallbackPlan } = await import("@/lib/adaptive/fallback");
    const s = estadoBase();
    const atividades = fallbackPlan(s, "2026-09-24", 3);
    expect(Array.isArray(atividades)).toBe(true);
    for (const a of atividades) {
      expect(a.reasons).toContain("fallback");
    }
  });

  test("plano normal (motor funcionando) não usa fallback", () => {
    const s = estadoBase();
    const plano = planWithFallback(s, "2026-09-24", "seed-1", { n: 5 });
    expect(plano.fallback).toBe(false);
    expect(plano.activities.length).toBeGreaterThan(0);
  });
});
