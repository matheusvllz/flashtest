import { describe, expect, test } from "bun:test";
import { recommendNext } from "@/lib/learning/recommend";
import type { Attempt, LearningSession, MicroLesson } from "@/lib/learning/types";
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

function appState(overrides: Partial<AppState["learning"]> = {}): AppState {
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

function attempt(overrides: Partial<Attempt>): Attempt {
  return {
    id: "a1",
    sessionId: null,
    exerciseId: "e1",
    exerciseVersion: 1,
    skillIds: ["mat:x"],
    role: "pratica",
    answer: 0,
    correct: false,
    hintUsed: false,
    tutorUsed: false,
    firstSubmission: true,
    submittedAt: "2026-09-21T10:00:00Z",
    localDate: "2026-09-21",
    durationMs: 0,
    ...overrides,
  };
}

const baseParams = {
  lessons: [lesson({})],
  recentAttempts: [] as Attempt[],
  reviewSchedule: {},
  s: appState(),
  hojeISO: "2026-09-21",
  remediationAlreadyOfferedThisSession: false,
  activeSession: null as LearningSession | null,
};

describe("recommendNext — prioridade fixa (docs/20 §13, critério A13)", () => {
  test("1. sessão ativa não concluída sempre vence qualquer outra coisa", () => {
    const r = recommendNext({
      ...baseParams,
      activeSession: {
        id: "s1",
        contentId: "l1",
        contentVersion: 1,
        kind: "microlicao",
        stage: "checkpoint",
        blockIndex: 0,
        exerciseIndex: 0,
        exerciseIds: [],
        answers: {},
        presentedOrders: {},
        startedAt: "x",
        updatedAt: "x",
        completedAt: null,
      },
    });
    expect(r.reason).toBe("resume-session");
    expect(r.lessonId).toBe("l1");
  });

  test("2. dois erros distintos na mesma habilidade -> remediação", () => {
    const r = recommendNext({
      ...baseParams,
      recentAttempts: [attempt({ exerciseId: "e1" }), attempt({ exerciseId: "e2" })],
    });
    expect(r.reason).toBe("remediation");
    expect(r.skillId).toBe("mat:x");
  });

  test("2b. UM erro só (não distinto o suficiente) não gera remediação", () => {
    const r = recommendNext({
      ...baseParams,
      recentAttempts: [attempt({ exerciseId: "e1" }), attempt({ exerciseId: "e1" })], // mesmo exercício
    });
    expect(r.reason).not.toBe("remediation");
  });

  test("2c. limite de uma remediação por sessão — se já ofereceu, pula pra próxima prioridade", () => {
    const r = recommendNext({
      ...baseParams,
      recentAttempts: [attempt({ exerciseId: "e1" }), attempt({ exerciseId: "e2" })],
      remediationAlreadyOfferedThisSession: true,
    });
    expect(r.reason).not.toBe("remediation");
  });

  test("3. revisão devida vence a próxima lição (mas perde pra remediação)", () => {
    const r = recommendNext({
      ...baseParams,
      reviewSchedule: { "mat:x": { skillId: "mat:x", intervalDays: 1, dueDate: "2026-09-20", lastResult: "correct" } },
    });
    expect(r.reason).toBe("review-due");
  });

  test("4. sem sessão/remediação/revisão, recomenda a próxima lição disponível", () => {
    const r = recommendNext(baseParams);
    expect(r.reason).toBe("next-lesson");
    expect(r.lessonId).toBe("l1");
  });

  test("6. nada elegível -> reason 'none', nunca inventa lição", () => {
    const r = recommendNext({
      ...baseParams,
      lessons: [],
    });
    expect(r.reason).toBe("none");
    expect(r.lessonId).toBeUndefined();
  });

  test("determinismo: mesmo estado/relógio produz sempre o mesmo resultado", () => {
    const params = { ...baseParams, recentAttempts: [attempt({ exerciseId: "e1" }), attempt({ exerciseId: "e2" })] };
    const r1 = recommendNext(params);
    const r2 = recommendNext(params);
    expect(r1).toEqual(r2);
  });

  test("nenhuma requisição de IA — a função nunca é assíncrona nem depende de rede", () => {
    // Prova estrutural: `recommendNext` retorna síncrono, sem Promise.
    const resultado = recommendNext(baseParams);
    expect(resultado).not.toBeInstanceOf(Promise);
  });
});
