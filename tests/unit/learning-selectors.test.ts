import { describe, expect, test } from "bun:test";
import { currentLessonId, lessonsConcludedInTrilha, trilhaProgressPct } from "@/lib/learning/selectors";
import { TRILHAS } from "@/content/trilhas";
import type { AppState } from "@/lib/store";

function fakeState(lessonsFeitas: Record<string, unknown>): AppState {
  return {
    progress: { lessons: lessonsFeitas },
  } as unknown as AppState;
}

describe("learning/selectors — mesma lógica que redacao.index.tsx já usa inline", () => {
  const trilha = TRILHAS[0];

  test("0 concluídas -> 0%", () => {
    const s = fakeState({});
    expect(lessonsConcludedInTrilha(trilha, s)).toBe(0);
    expect(trilhaProgressPct(trilha, s)).toBe(0);
  });

  test("todas concluídas -> 100%", () => {
    const todas = Object.fromEntries(trilha.licoes.map((l) => [l.id, { stars: 3 }]));
    const s = fakeState(todas);
    expect(lessonsConcludedInTrilha(trilha, s)).toBe(trilha.licoes.length);
    expect(trilhaProgressPct(trilha, s)).toBe(100);
  });

  test("currentLessonId aponta a primeira lição desbloqueada e não concluída", () => {
    const s = fakeState({});
    expect(currentLessonId(trilha, s)).toBe(trilha.licoes[0].id);
  });

  test("currentLessonId avança depois que a primeira é concluída", () => {
    const s = fakeState({ [trilha.licoes[0].id]: { stars: 2 } });
    expect(currentLessonId(trilha, s)).toBe(trilha.licoes[1].id);
  });
});
