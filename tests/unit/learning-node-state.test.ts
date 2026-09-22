import { describe, expect, test } from "bun:test";
import {
  microLessonNodeState,
  nextAvailableMicroLesson,
  nodeStateLabel,
} from "@/lib/learning/selectors";
import type { MicroLesson } from "@/lib/learning/types";
import type { AppState } from "@/lib/store";

function lesson(overrides: Partial<MicroLesson>): MicroLesson {
  return {
    id: "l1",
    version: 1,
    subjectId: "mat",
    topicId: "porc",
    chapterId: "mat-porcentagem",
    title: "x",
    objective: "x",
    skillIds: ["mat:x"],
    prerequisiteLessonIds: [],
    examProfileIds: ["enem"],
    status: "reviewed",
    estimatedTeachingSeconds: 45,
    estimatedPracticeSeconds: 60,
    blocks: [],
    checkpointExerciseId: "c1",
    practiceExerciseIds: ["p1", "p2"],
    reviewExerciseIds: ["r1", "r2"],
    recap: "x",
    sources: [],
    reviewedAt: "2026-09-21",
    ...overrides,
  };
}

function state(overrides: Partial<AppState["learning"]> = {}): AppState {
  return {
    learning: {
      activeSession: null,
      completedLessons: {},
      skillEvidence: {},
      reviewSchedule: {},
      recentAttempts: [],
      rewardLedger: {},
      tipHistory: [],
      ...overrides,
    },
  } as unknown as AppState;
}

describe("microLessonNodeState — dimensões independentes (docs/20 §11)", () => {
  test("lição sem pré-requisito começa disponível e não iniciada", () => {
    const s = microLessonNodeState(lesson({}), state());
    expect(s.availability).toBe("available");
    expect(s.completion).toBe("not-started");
    expect(s.evidence).toBe("unmeasured");
    expect(s.review).toBe("not-due");
  });

  test("lição com pré-requisito não concluído fica bloqueada", () => {
    const l = lesson({ id: "l2", prerequisiteLessonIds: ["l1"] });
    const s = microLessonNodeState(l, state());
    expect(s.availability).toBe("locked");
  });

  test("pré-requisito concluído desbloqueia, mesmo sem 100% (docs/20 §11)", () => {
    const l = lesson({ id: "l2", prerequisiteLessonIds: ["l1"] });
    const s = microLessonNodeState(
      l,
      state({ completedLessons: { l1: { version: 1, completedAt: "2026-09-01" } } }),
    );
    expect(s.availability).toBe("available");
  });

  test("conclusão E revisão devida ao mesmo tempo — o check não some (docs/20 §11)", () => {
    const l = lesson({ id: "l1", skillIds: ["mat:x"] });
    const s = microLessonNodeState(
      l,
      state({
        completedLessons: { l1: { version: 1, completedAt: "2026-09-01" } },
        reviewSchedule: { "mat:x": { skillId: "mat:x", intervalDays: 1, dueDate: "2020-01-01", lastResult: "correct" } },
      }),
    );
    expect(s.completion).toBe("completed");
    expect(s.review).toBe("due");
  });

  test("nodeStateLabel distingue os 4 estados em texto (não só ícone/cor)", () => {
    expect(nodeStateLabel(microLessonNodeState(lesson({ id: "l2", prerequisiteLessonIds: ["l1"] }), state()))).toBe(
      "Bloqueada",
    );
    expect(nodeStateLabel(microLessonNodeState(lesson({}), state()))).toBe("Disponível");
    expect(
      nodeStateLabel(
        microLessonNodeState(
          lesson({}),
          state({ completedLessons: { l1: { version: 1, completedAt: "x" } } }),
        ),
      ),
    ).toBe("Concluída");
  });
});

describe("nextAvailableMicroLesson", () => {
  test("aponta a primeira disponível e não concluída, pulando as concluídas", () => {
    const l1 = lesson({ id: "l1" });
    const l2 = lesson({ id: "l2", prerequisiteLessonIds: ["l1"] });
    const s = state({ completedLessons: { l1: { version: 1, completedAt: "x" } } });
    expect(nextAvailableMicroLesson([l1, l2], s)?.id).toBe("l2");
  });

  test("nenhuma disponível retorna undefined, não inventa uma lição", () => {
    const l1 = lesson({ id: "l1", prerequisiteLessonIds: ["nunca-existe"] });
    expect(nextAvailableMicroLesson([l1], state())).toBeUndefined();
  });
});
