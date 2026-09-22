import { describe, expect, test } from "bun:test";
import {
  buildChapterReview,
  isReviewLessonId,
  REVIEW_ID_PREFIX,
  reviewLessonId,
} from "@/lib/learning/chapter-review";
import { nodeKindOf } from "@/lib/learning/steps";
import { CHAPTER_REVIEWS, MICROLICOES } from "@/content/microlicoes";
import { chapterById } from "@/content/curriculum-tree";
import type { CurriculumChapter } from "@/content/curriculum-tree";
import type { MicroLesson, MicroLessonV1, QuestionStep } from "@/lib/learning/types";

/**
 * Testes da revisão sintética de capítulo (docs/25 §7.4/§18 T-06, critérios
 * de aceite): as 3 revisões do piloto existem com 4 questões cada, e um
 * capítulo com poucos itens de revisão devolve `null`.
 */

describe("reviewLessonId / isReviewLessonId", () => {
  test("reviewLessonId prefixa com REVIEW_ID_PREFIX", () => {
    expect(reviewLessonId("mat-porcentagem")).toBe(`${REVIEW_ID_PREFIX}mat-porcentagem`);
    expect(reviewLessonId("mat-porcentagem")).toBe("revisao--mat-porcentagem");
  });

  test("isReviewLessonId reconhece só ids com o prefixo", () => {
    expect(isReviewLessonId("revisao--mat-porcentagem")).toBe(true);
    expect(isReviewLessonId("mat-porcentagem")).toBe(false);
  });
});

describe("buildChapterReview — catálogo piloto real (docs/25 §18 T-06, critério de aceite)", () => {
  test("as três revisões existem, uma por capítulo micro", () => {
    expect(CHAPTER_REVIEWS.map((l) => l.id).sort()).toEqual(
      ["revisao--bio-citologia", "revisao--mat-porcentagem", "revisao--por-crase"].sort(),
    );
  });

  test("cada revisão tem 4 questões, todas role 'revisao', prerequisiteLessonIds = as 2 lições do capítulo, reviewExerciseIds vazio", () => {
    for (const chapterId of ["mat-porcentagem", "por-crase", "bio-citologia"]) {
      const review = CHAPTER_REVIEWS.find((l) => l.id === reviewLessonId(chapterId));
      expect(review).toBeDefined();
      if (!review) continue;

      const questoes = review.steps.filter((s): s is QuestionStep => s.kind === "question");
      expect(questoes.length).toBe(4);
      expect(questoes.every((q) => q.role === "revisao")).toBe(true);
      expect(questoes.every((q) => q.difficulty === 2)).toBe(true);

      const chapter = chapterById(chapterId);
      expect(review.prerequisiteLessonIds).toEqual(chapter?.lessonIds);
      expect(review.reviewExerciseIds).toEqual([]);
      expect(review.format).toBe(2);
      expect(review.chapterId).toBe(chapterId);
      expect(review.steps[0].kind).toBe("intro");
      expect(review.steps[review.steps.length - 1].kind).toBe("recap");
    }
  });

  test("nodeKindOf de uma revisão é 'revisao'", () => {
    for (const review of CHAPTER_REVIEWS) {
      expect(nodeKindOf(review)).toBe("revisao");
    }
  });

  test("título é 'Revisão · <título do capítulo>' e objective/recap batem com o texto padrão", () => {
    const review = CHAPTER_REVIEWS.find((l) => l.id === "revisao--mat-porcentagem");
    const chapter = chapterById("mat-porcentagem");
    expect(review?.title).toBe(`Revisão · ${chapter?.title}`);
    expect(review?.objective).toBe(
      "Fixar o que você viu neste capítulo respondendo sem consultar a explicação antes.",
    );
    expect(review?.recap).toBe(
      "Revisão feita. Se alguma questão travou, a lição correspondente continua aberta na trilha.",
    );
  });
});

describe("buildChapterReview — casos sintéticos", () => {
  function lesson(overrides: Partial<MicroLessonV1>): MicroLessonV1 {
    return {
      id: "l1",
      version: 1,
      subjectId: "mat",
      topicId: "porc",
      chapterId: "cap-1",
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

  function chapter(overrides: Partial<CurriculumChapter>): CurriculumChapter {
    return {
      id: "cap-1",
      title: "Capítulo de teste",
      lessonIds: ["l1"],
      prerequisiteChapterIds: [],
      ...overrides,
    };
  }

  test("capítulo fictício com 1 lição (2 itens de revisão) devolve null", () => {
    const cap = chapter({ lessonIds: ["l1"] });
    const lessons: MicroLesson[] = [lesson({ id: "l1", reviewExerciseIds: ["r1", "r2"] })];
    expect(buildChapterReview(cap, lessons)).toBeNull();
  });

  test("capítulo com 2 lições (4 itens de revisão) devolve uma revisão válida", () => {
    const cap = chapter({ lessonIds: ["l1", "l2"] });
    const lessons: MicroLesson[] = [
      lesson({ id: "l1", reviewExerciseIds: ["r1", "r2"] }),
      lesson({ id: "l2", reviewExerciseIds: ["r3", "r4"], prerequisiteLessonIds: ["l1"] }),
    ];
    const review = buildChapterReview(cap, lessons);
    expect(review).not.toBeNull();
    expect(review?.steps.filter((s) => s.kind === "question").length).toBe(4);
  });

  test("mais de 8 itens de revisão disponíveis é cortado em 8", () => {
    const cap = chapter({ lessonIds: ["l1", "l2", "l3", "l4", "l5"] });
    const lessons: MicroLesson[] = ["l1", "l2", "l3", "l4", "l5"].map((id, i) =>
      lesson({ id, reviewExerciseIds: [`r${i}a`, `r${i}b`] }),
    );
    const review = buildChapterReview(cap, lessons);
    expect(review?.steps.filter((s) => s.kind === "question").length).toBe(8);
  });

  test("exerciseIds de revisão duplicados entre lições não duplicam na revisão final", () => {
    const cap = chapter({ lessonIds: ["l1", "l2"] });
    const lessons: MicroLesson[] = [
      lesson({ id: "l1", reviewExerciseIds: ["r1", "r2"] }),
      lesson({ id: "l2", reviewExerciseIds: ["r1", "r3"], prerequisiteLessonIds: ["l1"] }),
    ];
    const review = buildChapterReview(cap, lessons);
    // só 3 ids distintos (r1, r2, r3) — abaixo do mínimo de 4, então null
    expect(review).toBeNull();
  });

  test("ids de lição sem lição correspondente são ignorados, não lançam", () => {
    const cap = chapter({ lessonIds: ["l1", "fantasma", "l2"] });
    const lessons: MicroLesson[] = [
      lesson({ id: "l1", reviewExerciseIds: ["r1", "r2"] }),
      lesson({ id: "l2", reviewExerciseIds: ["r3", "r4"], prerequisiteLessonIds: ["l1"] }),
    ];
    const review = buildChapterReview(cap, lessons);
    expect(review).not.toBeNull();
    expect(review?.prerequisiteLessonIds).toEqual(["l1", "fantasma", "l2"]);
  });

  test("capítulo sem nenhuma lição encontrada devolve null", () => {
    const cap = chapter({ lessonIds: ["fantasma"] });
    expect(buildChapterReview(cap, [])).toBeNull();
  });
});
