import type { CurriculumChapter } from "@/content/curriculum-tree";
import type { LessonStep, MicroLesson, MicroLessonV2, QuestionStep } from "./types";

/**
 * Revisão sintética de capítulo (docs/25 §6.6/§7.4, Fase 1) — um nó
 * "Revisão do capítulo" gerado a partir dos `reviewExerciseIds` (2 por lição
 * autoral) das lições de um capítulo micro, sem escrever conteúdo novo: usa
 * os 30 itens de revisão do piloto que hoje não têm nenhum consumidor
 * (docs/25 §6.2). Sem ensino — é recuperação, não reexposição (docs/20 §9).
 */

export const REVIEW_ID_PREFIX = "revisao--";

export function reviewLessonId(chapterId: string): string {
  return `${REVIEW_ID_PREFIX}${chapterId}`;
}

export function isReviewLessonId(id: string): boolean {
  return id.startsWith(REVIEW_ID_PREFIX);
}

function dedupeInOrder(items: string[]): string[] {
  const vistos = new Set<string>();
  const resultado: string[] = [];
  for (const item of items) {
    if (!vistos.has(item)) {
      vistos.add(item);
      resultado.push(item);
    }
  }
  return resultado;
}

/**
 * Monta a lição de revisão de UM capítulo. `lessons` é o catálogo (ou
 * qualquer superconjunto) de onde as lições do capítulo são extraídas e
 * reordenadas pela ordem de `chapter.lessonIds`; ids sem lição correspondente
 * são ignorados (defensivo — a árvore já é validada em `validateCurriculumTree`,
 * então isso não deveria acontecer com conteúdo publicado). Devolve `null`
 * quando há menos de 4 exercícios de revisão disponíveis (docs/25 §7.4): uma
 * revisão curta demais não vale o nó extra na trilha.
 */
export function buildChapterReview(
  chapter: CurriculumChapter,
  lessons: MicroLesson[],
): MicroLessonV2 | null {
  const porId = new Map(lessons.map((l) => [l.id, l]));
  const licoesDoCapitulo = chapter.lessonIds
    .map((id) => porId.get(id))
    .filter((l): l is MicroLesson => l !== undefined);

  if (licoesDoCapitulo.length === 0) return null;

  const idsBrutos = licoesDoCapitulo.flatMap((l) => l.reviewExerciseIds);
  const ids = dedupeInOrder(idsBrutos);
  if (ids.length < 4) return null;
  const idsFinal = ids.slice(0, 8);

  const primeira = licoesDoCapitulo[0];
  const skillIds = dedupeInOrder(licoesDoCapitulo.flatMap((l) => l.skillIds));
  const examProfileIds = dedupeInOrder(licoesDoCapitulo.flatMap((l) => l.examProfileIds));
  const sources = dedupeInOrder(licoesDoCapitulo.flatMap((l) => l.sources));
  const datasRevisao = licoesDoCapitulo
    .map((l) => l.reviewedAt)
    .filter((d): d is string => d !== null);
  const reviewedAt = datasRevisao.length > 0 ? datasRevisao.reduce((a, b) => (a > b ? a : b)) : null;

  const title = `Revisão · ${chapter.title}`;
  const objective = "Fixar o que você viu neste capítulo respondendo sem consultar a explicação antes.";
  const recap = "Revisão feita. Se alguma questão travou, a lição correspondente continua aberta na trilha.";

  const questionSteps: QuestionStep[] = idsFinal.map((exerciseId) => ({
    kind: "question",
    exerciseId,
    role: "revisao",
    difficulty: 2,
  }));
  const steps: LessonStep[] = [
    { kind: "intro", title, body: objective },
    ...questionSteps,
    { kind: "recap", body: recap },
  ];

  return {
    id: reviewLessonId(chapter.id),
    version: 1,
    format: 2,
    subjectId: primeira.subjectId,
    topicId: primeira.topicId,
    chapterId: chapter.id,
    title,
    objective,
    skillIds,
    prerequisiteLessonIds: [...chapter.lessonIds],
    examProfileIds,
    status: "published",
    estimatedTeachingSeconds: 0,
    estimatedPracticeSeconds: 30 * idsFinal.length,
    reviewExerciseIds: [],
    recap,
    sources,
    reviewedAt,
    steps,
  };
}
