import { describe, expect, test } from "bun:test";
import { ALL_PHASES } from "@/content/microlicoes";
import { allLessonsInOrder } from "@/content/trilhas";
import { buildTrail, isTrailLessonLocked } from "@/lib/learning/trail";
import { learningStateVazio } from "@/lib/learning/types";
import type { LearningSession } from "@/lib/learning/types";
import type { AppState } from "@/lib/store";

/**
 * T-15 (docs/25-plano-jornada-aprendizado-v2.md §7.5/§18) — `buildTrail`/
 * `isTrailLessonLocked` com estados sintéticos, cobrindo cada critério de
 * aceite listado no plano. Usa conteúdo REAL (`ALL_PHASES`, `TRILHAS` via
 * `allLessonsInOrder`) — não inventa ids — pra não divergir da árvore de
 * verdade, mesmo padrão de `trail-completion.test.ts`/`learning-node-state.test.ts`.
 */

const HOJE = "2026-09-22";

function state(overrides: {
  trailSubjectId?: string | null;
  completedLessons?: AppState["learning"]["completedLessons"];
  lessons?: AppState["progress"]["lessons"];
  activeSession?: LearningSession | null;
} = {}): AppState {
  return {
    prefs: { trailSubjectId: overrides.trailSubjectId ?? null },
    progress: { lessons: overrides.lessons ?? {} },
    learning: {
      ...learningStateVazio(),
      completedLessons: overrides.completedLessons ?? {},
      activeSession: overrides.activeSession ?? null,
    },
  } as unknown as AppState;
}

function sessionFor(contentId: string): LearningSession {
  return {
    id: "sessao-teste",
    contentId,
    contentVersion: 1,
    kind: "microlicao",
    stage: "teaching",
    blockIndex: 0,
    exerciseIndex: 0,
    exerciseIds: [],
    answers: {},
    presentedOrders: {},
    stepIndex: 0,
    startedAt: "2026-09-22T10:00:00.000Z",
    updatedAt: "2026-09-22T10:00:00.000Z",
    completedAt: null,
  };
}

describe("buildTrail — continueTarget/currentLessonId/defaultSubjectId (docs/25 §7.5)", () => {
  test("estado vazio, trailSubjectId null -> primeira lição da árvore (mat)", () => {
    const model = buildTrail(state(), HOJE);
    expect(model.continueTarget?.lessonId).toBe("porcentagem-valor");
    expect(model.currentLessonId).toBe("porcentagem-valor");
    expect(model.defaultSubjectId).toBe("mat");
  });

  test("trailSubjectId 'bio' -> prioriza a matéria selecionada", () => {
    const model = buildTrail(state({ trailSubjectId: "bio" }), HOJE);
    expect(model.continueTarget?.lessonId).toBe("citologia-membrana");
  });

  test("as 6 micro + revisões concluídas -> legacy-next pra 1ª lição de redacao-estrutura", () => {
    const completedLessons = Object.fromEntries(
      ALL_PHASES.map((l) => [l.id, { version: 1, completedAt: "2026-09-01", stars: 3 as const, bestPct: 100 }]),
    );
    const model = buildTrail(state({ completedLessons }), HOJE);
    const primeiraLegada = allLessonsInOrder()[0];
    expect(model.continueTarget?.reason).toBe("legacy-next");
    expect(model.continueTarget?.lessonId).toBe(primeiraLegada.lesson.id);
    expect(model.continueTarget?.explanation).toBe(`Próxima lição de ${primeiraLegada.trilha.nome}.`);
  });

  test("tudo concluído (micro + 134 legadas) -> continueTarget null", () => {
    const completedLessons = Object.fromEntries(
      ALL_PHASES.map((l) => [l.id, { version: 1, completedAt: "2026-09-01", stars: 3 as const, bestPct: 100 }]),
    );
    const lessons = Object.fromEntries(
      allLessonsInOrder().map(({ lesson }) => [
        lesson.id,
        { lessonId: lesson.id, stars: 3 as const, bestPct: 100, completedAt: "2026-09-01" },
      ]),
    );
    const model = buildTrail(state({ completedLessons, lessons }), HOJE);
    expect(model.continueTarget).toBeNull();
    expect(model.currentLessonId).toBeNull();
  });

  test("activeSession pra 'crase-quando-usar' -> nó in-progress e reason resume-session", () => {
    const s = state({ activeSession: sessionFor("crase-quando-usar") });
    const model = buildTrail(s, HOJE);
    expect(model.continueTarget?.reason).toBe("resume-session");
    expect(model.continueTarget?.lessonId).toBe("crase-quando-usar");

    const por = model.subjects.find((sub) => sub.id === "por");
    const porCrase = por?.sections.flatMap((sec) => sec.chapters).find((c) => c.id === "por-crase");
    const no = porCrase?.nodes.find((n) => n.id === "crase-quando-usar");
    expect(no?.status).toBe("in-progress");
  });

  test("activeSession apontando pra id inexistente é ignorada -> reason cai pro próximo (legacy-next)", () => {
    const s = state({ activeSession: sessionFor("licao-removida-que-nao-existe-mais") });
    const model = buildTrail(s, HOJE);
    expect(model.continueTarget?.reason).not.toBe("resume-session");
    expect(model.continueTarget?.reason).toBe("legacy-next");
    expect(model.continueTarget?.lessonId).toBe(allLessonsInOrder()[0].lesson.id);
  });
});

describe("isTrailLessonLocked — revisão sintética de capítulo (docs/25 §6.3/§7.4)", () => {
  test("revisao--mat-porcentagem bloqueada até as 2 lições do capítulo fecharem", () => {
    expect(isTrailLessonLocked("revisao--mat-porcentagem", state())).toBe(true);

    const s = state({
      completedLessons: {
        "porcentagem-valor": { version: 1, completedAt: "2026-09-01", stars: 3, bestPct: 100 },
        "porcentagem-aumento-desconto": { version: 1, completedAt: "2026-09-01", stars: 3, bestPct: 100 },
      },
    });
    expect(isTrailLessonLocked("revisao--mat-porcentagem", s)).toBe(false);
  });
});

describe("buildTrail — capítulo legado 'crase' (docs/25 §6.3/§7.5)", () => {
  test("6 nós, o 1º available, os outros 5 locked (ordem sequencial)", () => {
    const model = buildTrail(state(), HOJE);
    const por = model.subjects.find((sub) => sub.id === "por");
    const crase = por?.sections.flatMap((sec) => sec.chapters).find((c) => c.id === "crase");
    expect(crase?.nodes.length).toBe(6);
    expect(crase?.nodes[0]?.status).toBe("available");
    expect(crase?.nodes.slice(1).every((n) => n.status === "locked")).toBe(true);
  });
});
