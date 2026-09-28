/**
 * Lição sintética de uma atividade da jornada (docs/30 §14.4, Fase 12 do
 * docs/31 F12.2) — monta uma `MicroLessonV2` "de sessão" (não de conteúdo
 * autoral) pra rodar no `MicroLessonPlayer` existente. NÃO passa por
 * `validateLessonSteps` (é sessão, não conteúdo publicado); a checagem aqui
 * é deliberadamente leve — pelo menos 2 questões — e lança se não houver
 * (mesma filosofia de referência-quebrada-nunca-silenciosa do resto do
 * repo); quem chama isto (a rota `/atividade/$activityId`) cai no fallback
 * do `30` §14.5/edge cases em vez de propagar a exceção pro aluno.
 */
import { chapterOfSkill } from "@/content/curriculum-tree";
import { itemMetaOf } from "@/content/items";
import { phaseById } from "@/content/microlicoes";
import { SKILL_MAP } from "@/content/taxonomy";
import { lessonById } from "@/content/trilhas";
import { COPY } from "@/lib/copy";
import type {
  LessonStep,
  MicroLessonV2,
  QuestionStep,
  QuestionStepRole,
  StepDifficulty,
} from "@/lib/learning/types";
import type { ActivityKind, PlannedActivity, ReasonCode } from "./types";

const ROLE_BY_KIND: Record<ActivityKind, QuestionStepRole> = {
  aula: "pratica",
  pratica: "pratica",
  revisao: "revisao",
  desafio: "desafio",
  checkpoint: "checkpoint",
  legado: "pratica",
  reforco: "pratica",
};

/** `ItemMeta.difficulty` (1-5, docs/30 §8.4) → `StepDifficulty` do motor de lição (1-3). */
function stepDifficultyOf(d: 1 | 2 | 3 | 4 | 5): StepDifficulty {
  if (d <= 2) return 1;
  if (d === 3) return 2;
  return 3;
}

/**
 * Título de uma atividade (docs/30 §14.1/§14.2) — reaproveitado pelo
 * `SessionCard`/`JourneyPath` além desta lição, não só aqui. Aula/legado/
 * reforço com aula própria usam o título da lição real; o resto usa
 * "{tipo} · {habilidade}".
 */
export function activityTitle(activity: PlannedActivity): string {
  if (activity.lessonId) {
    const micro = phaseById(activity.lessonId);
    if (micro) return micro.title;
    const legado = lessonById(activity.lessonId);
    if (legado) return legado.lesson.titulo;
  }
  const skillName = SKILL_MAP[activity.skillIds[0]]?.name ?? "";
  const kindLabel = COPY.jornada.kinds[activity.kind];
  return skillName ? `${kindLabel} · ${skillName}` : kindLabel;
}

/** Frase de motivo (docs/30 §14.2) — o `ReasonCode` principal é sempre `reasons[0]` (docs/30 §11.5). */
export function activityReasonText(activity: PlannedActivity): string {
  const reason: ReasonCode = activity.reasons[0] ?? "fallback";
  return COPY.jornada.motivos[reason];
}

/**
 * Monta a `MicroLessonV2` sintética (docs/30 §14.4 pseudocódigo). `itemIds`
 * vem de `selectItemsForActivity` (Fase 8), escolhido ao COMEÇAR a
 * atividade — nunca no planejamento.
 */
export function buildActivityLesson(activity: PlannedActivity, itemIds: string[]): MicroLessonV2 {
  if (itemIds.length < 2) {
    throw new Error(
      `[activity-lesson] atividade "${activity.id}" tem só ${itemIds.length} item(ns) — mínimo 2`,
    );
  }

  const role = ROLE_BY_KIND[activity.kind];
  const questions: QuestionStep[] = itemIds
    .map((id): QuestionStep => {
      const meta = itemMetaOf(id);
      return {
        kind: "question",
        exerciseId: id,
        role,
        difficulty: stepDifficultyOf(meta.difficulty),
      };
    })
    .sort((a, b) => a.difficulty - b.difficulty);

  const skill = SKILL_MAP[activity.skillIds[0]];
  const chapter = skill ? chapterOfSkill(skill.id) : undefined;
  const title = activityTitle(activity);

  const steps: LessonStep[] = [
    { kind: "intro", title, body: activityReasonText(activity) },
    ...questions,
    { kind: "recap", body: COPY.jornada.recap },
  ];

  return {
    id: `atividade--${activity.id}`,
    version: 1,
    format: 2,
    subjectId: activity.subjectId,
    topicId: skill?.topicId ?? activity.subjectId,
    // Prefixo garante que nunca colide com um capítulo real por acidente —
    // `chapterById` cai em `undefined` de propósito quando a habilidade não
    // tem capítulo mapeado (a maioria ainda), e o player já lida bem com
    // isso (breadcrumb cai pro título da lição).
    chapterId: chapter?.id ?? `atividade--${activity.subjectId}`,
    title,
    objective: title,
    skillIds: activity.skillIds,
    prerequisiteLessonIds: [],
    examProfileIds: [],
    status: "published",
    estimatedTeachingSeconds: 0,
    estimatedPracticeSeconds: activity.estimatedMinutes * 60,
    reviewExerciseIds: [],
    recap: COPY.jornada.recap,
    sources: [],
    reviewedAt: null,
    steps,
  };
}
