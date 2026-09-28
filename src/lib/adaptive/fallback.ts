/**
 * Fallback determinístico (docs/30 §11.8, Fase 8 do docs/31 F8.7) — quando o
 * motor lança, o pacote de conteúdo está indisponível, ou a flag está
 * desligada: usa `buildTrail().continueTarget` (motor ATUAL, intocado) pra
 * primeira atividade, e a ordem da árvore (`TRAIL_ORDER`) pras seguintes. O
 * aluno sempre tem o que estudar.
 */
import { buildTrail } from "@/lib/learning/trail";
import { chapterById, chapterOfLesson, TRAIL_ORDER } from "@/content/curriculum-tree";
import { phaseById } from "@/content/microlicoes";
import type { AppState } from "@/lib/store";
import type { PlannedActivity } from "./types";

function activityFromLessonId(lessonId: string, chapterTitle: string): PlannedActivity | null {
  const capitulo = chapterOfLesson(lessonId);
  if (!capitulo) return null;
  const source: "micro" | "legado" = capitulo.trilhaId ? "legado" : "micro";
  const skillIds = capitulo.skillIds ?? [];
  const subjectId = source === "legado" ? "red" : (phaseById(lessonId)?.subjectId ?? "");
  return {
    id: `atv-fallback-${lessonId}`,
    kind: source === "legado" ? "legado" : "aula",
    skillIds,
    subjectId,
    lessonId,
    estimatedMinutes: 2,
    reasons: ["fallback"],
    score: 0,
    scoreBreakdown: {},
  };
}

/**
 * Plano de fallback: `continueTarget` primeiro, depois as próximas lições
 * não concluídas na ordem de `TRAIL_ORDER` (capítulos "micro", em ordem).
 */
export function fallbackPlan(s: AppState, today: string, n: number): PlannedActivity[] {
  const trilha = buildTrail(s, today);
  const plano: PlannedActivity[] = [];
  const usados = new Set<string>();

  if (trilha.continueTarget) {
    const atividade = activityFromLessonId(trilha.continueTarget.lessonId, trilha.continueTarget.chapterTitle);
    if (atividade) {
      plano.push(atividade);
      usados.add(atividade.lessonId!);
    }
  }

  for (const chapterId of TRAIL_ORDER) {
    if (plano.length >= n) break;
    const capitulo = chapterById(chapterId);
    if (!capitulo) continue;
    for (const lessonId of capitulo.lessonIds) {
      if (plano.length >= n) break;
      if (usados.has(lessonId)) continue;
      if (s.progress.lessons[lessonId]) continue; // já concluída
      const atividade = activityFromLessonId(lessonId, capitulo.title);
      if (!atividade) continue;
      plano.push(atividade);
      usados.add(lessonId);
    }
  }

  return plano;
}
