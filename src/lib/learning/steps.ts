import type {
  LessonBlock,
  LessonStage,
  LessonStep,
  MicroLesson,
  MicroLessonV1,
  MicroLessonV2,
  QuestionStep,
  TeachStep,
} from "./types";

/**
 * Normalização de microlição -> passos (docs/25 §6.2/§7.3, Fase 1). O motor e
 * o player só consomem `LessonStep[]` daqui pra frente — v1 é adaptada em
 * memória (nunca reescrita em massa), v2 já declara `steps[]` e só ganha
 * intro/recap se estiverem faltando. Função pura, sem leitura de estado.
 */

/** Prefixo de id de revisão sintética de capítulo (docs/25 §7.4) — duplicado aqui como literal (não importa de `chapter-review.ts`) pra `nodeKindOf` não criar dependência circular entre os dois módulos novos. */
const REVIEW_ID_PREFIX = "revisao--";

export function isV2(lesson: MicroLesson): lesson is MicroLessonV2 {
  return lesson.format === 2;
}

export function stepsOf(lesson: MicroLesson): LessonStep[] {
  if (isV2(lesson)) {
    const steps = [...lesson.steps];
    if (steps[0]?.kind !== "intro") {
      steps.unshift({ kind: "intro", title: lesson.title, body: lesson.objective });
    }
    if (steps[steps.length - 1]?.kind !== "recap") {
      steps.push({ kind: "recap", body: lesson.recap });
    }
    return steps;
  }

  const v1 = lesson as MicroLessonV1;
  const teachSteps: TeachStep[] = v1.blocks.map((block: LessonBlock) => ({ kind: "teach", block }));
  const practiceSteps: QuestionStep[] = v1.practiceExerciseIds.map((exerciseId) => ({
    kind: "question",
    exerciseId,
    role: "pratica",
    difficulty: 2,
  }));

  const steps: LessonStep[] = [
    { kind: "intro", title: v1.title, body: v1.objective },
    ...teachSteps,
    { kind: "question", exerciseId: v1.checkpointExerciseId, role: "checkpoint", difficulty: 1 },
    ...practiceSteps,
    { kind: "recap", body: v1.recap },
  ];
  return steps;
}

export function questionSteps(steps: LessonStep[]): Array<{ step: QuestionStep; stepIndex: number }> {
  const result: Array<{ step: QuestionStep; stepIndex: number }> = [];
  steps.forEach((step, stepIndex) => {
    if (step.kind === "question") result.push({ step, stepIndex });
  });
  return result;
}

export function scoredQuestionSteps(steps: LessonStep[]): Array<{ step: QuestionStep; stepIndex: number }> {
  return questionSteps(steps).filter(({ step }) => step.role !== "checkpoint");
}

export function stageOfStep(step: LessonStep): LessonStage {
  switch (step.kind) {
    case "intro":
    case "teach":
    case "tip":
      return "teaching";
    case "question":
      return step.role === "checkpoint" ? "checkpoint" : "practice";
    case "recap":
      return "recap";
  }
}

/** `id` começa com `"revisao--"` → `"revisao"`; algum passo `teach` → `"aula"`; senão `"pratica"` (docs/25 §6.4/§7.3). */
export function nodeKindOf(lesson: MicroLesson): "aula" | "pratica" | "revisao" {
  if (lesson.id.startsWith(REVIEW_ID_PREFIX)) return "revisao";
  return stepsOf(lesson).some((s) => s.kind === "teach") ? "aula" : "pratica";
}

/** Contagem simples de palavras (split por espaço) — exportado pra `validate.ts` reaproveitar. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Todos os textos de um bloco de ensino — usados pro limite de palavras de ensino (docs/20 §8.1, docs/25 §6.7). Exportado pra `validate.ts` reaproveitar na regra v1 (`steps-palavras-ensino`). */
export function blockTexts(block: LessonBlock): string[] {
  switch (block.type) {
    case "concept":
      return [block.title, block.body];
    case "worked-example":
      return [block.title, block.problem, ...block.steps, block.result];
    case "comparison":
      return [block.title, block.left.label, block.left.body, block.right.label, block.right.body];
    case "diagram":
      return [block.title, block.accessibleDescription, ...(block.caption ? [block.caption] : [])];
  }
}

/** Soma de palavras de `intro.body`, todos os textos de `teach` e `tip.body` — ignora `question`/`recap` (docs/25 §7.3). */
export function teachingWordCount(steps: LessonStep[]): number {
  let total = 0;
  for (const step of steps) {
    if (step.kind === "intro") {
      total += countWords(step.body);
    } else if (step.kind === "teach") {
      total += blockTexts(step.block).reduce((n, t) => n + countWords(t), 0);
    } else if (step.kind === "tip") {
      total += countWords(step.body);
    }
  }
  return total;
}
