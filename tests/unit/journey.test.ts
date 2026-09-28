import { describe, expect, test } from "bun:test";
import { ensurePlan, navigationTargetFor, needsItemSelection } from "@/lib/adaptive/journey";
import { ALGO_VERSION } from "@/lib/adaptive/constants";
import { journeyVazia, learningStateVazio } from "@/lib/learning/types";
import type { PlannedActivity } from "@/lib/adaptive/types";
import type { AppState } from "@/lib/store";

/**
 * Orquestração da jornada (docs/30 §14, Fase 12 F12.1).
 */

function estadoBase(journeyOverrides: Partial<ReturnType<typeof journeyVazia>> = {}): Pick<AppState, "prefs" | "learning" | "progress"> {
  const learning = learningStateVazio();
  learning.journey = { ...journeyVazia(), ...journeyOverrides };
  return {
    prefs: {
      difficultSubjects: [],
      easySubjects: [],
      studyFocus: { mode: "todas", subjectIds: [], areas: [] },
    } as unknown as AppState["prefs"],
    learning,
    progress: { bySubject: {} } as unknown as AppState["progress"],
  };
}

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

describe("ensurePlan", () => {
  test("committed vazio -> replaneja (devolve resultado, nunca null)", () => {
    const s = estadoBase();
    const r = ensurePlan(s, "2026-09-24", "seed-1");
    expect(r).not.toBeNull();
    expect(r!.committed.length).toBeGreaterThan(0);
  });

  test("committed com 3 e planVersion atual -> não replaneja (null)", () => {
    const s = estadoBase({
      committed: [atividade({ id: "a1" }), atividade({ id: "a2" }), atividade({ id: "a3" })],
      planVersion: ALGO_VERSION,
    });
    const r = ensurePlan(s, "2026-09-24", "seed-1");
    expect(r).toBeNull();
  });

  test("committed curto (só 1, uma atividade concluída sem reposição) -> replaneja", () => {
    const s = estadoBase({ committed: [atividade({ id: "a1" })], planVersion: ALGO_VERSION });
    const r = ensurePlan(s, "2026-09-24", "seed-1");
    expect(r).not.toBeNull();
  });

  test("planVersion desatualizado -> replaneja mesmo com 3 comprometidas", () => {
    const s = estadoBase({
      committed: [atividade({ id: "a1" }), atividade({ id: "a2" }), atividade({ id: "a3" })],
      planVersion: ALGO_VERSION - 1,
    });
    const r = ensurePlan(s, "2026-09-24", "seed-1");
    expect(r).not.toBeNull();
  });

  test("resultado tem no máximo 3 comprometidas e 5 a seguir", () => {
    const s = estadoBase();
    const r = ensurePlan(s, "2026-09-24", "seed-1")!;
    expect(r.committed.length).toBeLessThanOrEqual(3);
    expect(r.upcoming.length).toBeLessThanOrEqual(5);
  });

  test("é determinístico — mesma entrada e semente dão o mesmo plano", () => {
    const s = estadoBase();
    const a = ensurePlan(s, "2026-09-24", "seed-x")!;
    const b = ensurePlan(s, "2026-09-24", "seed-x")!;
    expect(a.committed.map((x) => x.id)).toEqual(b.committed.map((x) => x.id));
  });
});

describe("navigationTargetFor", () => {
  test("aula com lessonId -> /learn/$lessonId", () => {
    const r = navigationTargetFor(atividade({ kind: "aula", lessonId: "licao-1" }));
    expect(r).toEqual({ kind: "aula", lessonId: "licao-1" });
  });

  test("reforço COM aula própria -> /learn/$lessonId", () => {
    const r = navigationTargetFor(atividade({ kind: "reforco", lessonId: "licao-1" }));
    expect(r).toEqual({ kind: "aula", lessonId: "licao-1" });
  });

  test("reforço SEM aula própria -> /atividade/$activityId", () => {
    const r = navigationTargetFor(atividade({ kind: "reforco", lessonId: undefined, id: "atv-9" }));
    expect(r).toEqual({ kind: "atividade", activityId: "atv-9" });
  });

  test("legado -> /redacao/$licaoId", () => {
    const r = navigationTargetFor(atividade({ kind: "legado", lessonId: "licao-legada-1" }));
    expect(r).toEqual({ kind: "legado", lessonId: "licao-legada-1" });
  });

  test("prática/revisão/desafio/checkpoint -> /atividade/$activityId", () => {
    for (const kind of ["pratica", "revisao", "desafio", "checkpoint"] as const) {
      const r = navigationTargetFor(atividade({ kind, id: `atv-${kind}` }));
      expect(r).toEqual({ kind: "atividade", activityId: `atv-${kind}` });
    }
  });
});

describe("needsItemSelection", () => {
  test("pratica/revisao/desafio/checkpoint precisam de seleção de itens", () => {
    for (const kind of ["pratica", "revisao", "desafio", "checkpoint"] as const) {
      expect(needsItemSelection(atividade({ kind }))).toBe(true);
    }
  });

  test("aula/legado NUNCA precisam (usam os passos da própria lição)", () => {
    expect(needsItemSelection(atividade({ kind: "aula", lessonId: "x" }))).toBe(false);
    expect(needsItemSelection(atividade({ kind: "legado", lessonId: "x" }))).toBe(false);
  });

  test("reforço: precisa só quando NÃO tem aula própria", () => {
    expect(needsItemSelection(atividade({ kind: "reforco", lessonId: "x" }))).toBe(false);
    expect(needsItemSelection(atividade({ kind: "reforco", lessonId: undefined }))).toBe(true);
  });
});
