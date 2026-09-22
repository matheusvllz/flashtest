import { QUESTIONS } from "@/data/questions";
import { questionToExercise, trilhaExerciseById } from "@/lib/learning/adapters";
import { buildChapterReview } from "@/lib/learning/chapter-review";
import { assertContentValid, validateCurriculumTree, validateMicroLessons } from "@/lib/learning/validate";
import { CURRICULUM } from "@/content/curriculum";
import { CURRICULUM_TREE, TRAIL_ORDER } from "@/content/curriculum-tree";
import { EXERCISE_IDS } from "@/content/exercise-ids";
import { TRILHAS } from "@/content/trilhas";
import type { Exercise } from "@/lib/lessons/types";
import type { MicroLesson, MicroLessonV2 } from "@/lib/learning/types";
import { EXERCICIOS as citologiaExercicios, LICOES as citologiaLicoes } from "./biologia/citologia";
import { EXERCICIOS as porcentagemExercicios, LICOES as porcentagemLicoes } from "./matematica/porcentagem";
import { EXERCICIOS as craseExercicios, LICOES as craseLicoes } from "./portugues/crase";

/**
 * Catálogo de microlições (docs/20 §8.3/§14.1, Fase 6) — piloto de 6 lições
 * em 3 matérias, 30 posições de exercício (1 checkpoint + 2 prática + 2
 * revisão × 6). `status: "reviewed"` em todas: revisão estrutural e de
 * conteúdo foi feita na autoria, mas não houve validação por especialista
 * pedagógico externo — ver docs/21 para o registro dessa limitação.
 */

const TODAS_AS_LICOES: MicroLesson[] = [...citologiaLicoes, ...porcentagemLicoes, ...craseLicoes];

const EXERCICIOS_LOCAIS: Record<string, Exercise> = {
  ...citologiaExercicios,
  ...porcentagemExercicios,
  ...craseExercicios,
};

/**
 * Resolve um ID de exercício — local (autoral da microlição), do banco geral
 * (`src/data/questions.ts`, via adapter) ou de uma trilha legada de redação
 * (`${lessonId}:${index}`, docs/25 §7.1/§10 item 2). Lança se não existir em
 * nenhum dos três: referência quebrada não pode chegar silenciosa na tela
 * do aluno (mesma filosofia de `define.ts`).
 */
export function resolveExercise(exerciseId: string): Exercise {
  const local = EXERCICIOS_LOCAIS[exerciseId];
  if (local) return local;
  const questao = QUESTIONS.find((q) => q.id === exerciseId);
  if (questao) return questionToExercise(questao);
  const daTrilha = trilhaExerciseById(exerciseId);
  if (daTrilha) return daTrilha;
  throw new Error(
    `[microlicoes] exercício "${exerciseId}" não existe (nem local, nem no banco geral, nem em trilha legada).`,
  );
}

/**
 * Catálogo PUBLICADO — nenhum "draft" aparece aqui (docs/20 §8.3, Fase 6 item
 * 3), ordenado pela posição em `TRAIL_ORDER` (docs/25 §7.2/§18 T-05: matéria
 * → seção → capítulo → lição). Id fora de `TRAIL_ORDER` (conteúdo publicado
 * mas ainda não colocado na árvore) vai pro fim da lista — e dispara
 * `licao-fora-da-arvore` na validação abaixo, então isso nunca fica
 * silencioso.
 */
export const MICROLICOES: MicroLesson[] = TODAS_AS_LICOES.filter((l) => l.status !== "draft").sort(
  (a, b) => posicaoNaTrilha(a.id) - posicaoNaTrilha(b.id),
);

function posicaoNaTrilha(id: string): number {
  const i = TRAIL_ORDER.indexOf(id);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

/**
 * Nó "Revisão do capítulo" (docs/25 §6.6/§7.4, T-06) — um por capítulo micro
 * (nunca por capítulo legado, que não tem `reviewExerciseIds` pra reaproveitar),
 * construído a partir das lições já ordenadas de `MICROLICOES`. `null` quando
 * o capítulo tem menos de 4 exercícios de revisão disponíveis (nenhum caso
 * hoje, no piloto de 6 lições) — `buildChapterReview` decide isso.
 */
const CAPITULOS_MICRO = CURRICULUM_TREE.subjects
  .flatMap((s) => s.sections.flatMap((sec) => sec.chapters))
  .filter((c) => !c.trilhaId);

export const CHAPTER_REVIEWS: MicroLessonV2[] = CAPITULOS_MICRO.map((c) =>
  buildChapterReview(c, MICROLICOES),
).filter((l): l is MicroLessonV2 => l !== null);

/**
 * Todas as fases da trilha (docs/25 §6.1, T-06): microlições autorais +
 * revisões sintéticas de capítulo.
 */
export const ALL_PHASES: MicroLesson[] = [...MICROLICOES, ...CHAPTER_REVIEWS];

export function phaseById(id: string): MicroLesson | undefined {
  return ALL_PHASES.find((l) => l.id === id);
}

/** Alias histórico (docs/20 Fase 6) — chamadores existentes continuam compilando sem mudar de nome. */
export const microLessonById = phaseById;

export function microLessonsBySubject(subjectId: string): MicroLesson[] {
  return MICROLICOES.filter((l) => l.subjectId === subjectId);
}

// Validação na carga do módulo — conteúdo quebrado nunca chega ao aluno em
// silêncio (docs/20 §8.3, mesma filosofia de `define.ts`/`assertContentValid`).
assertContentValid(CURRICULUM, EXERCISE_IDS);

const CHAPTER_IDS = new Set(
  CURRICULUM_TREE.subjects.flatMap((s) => s.sections.flatMap((sec) => sec.chapters.map((c) => c.id))),
);

const issuesArvore = validateCurriculumTree(
  CURRICULUM_TREE,
  new Set(TODAS_AS_LICOES.map((l) => l.id)),
  new Set(TRILHAS.map((t) => t.id)),
);
if (issuesArvore.length > 0) {
  const detalhe = issuesArvore.map((i) => `[${i.code}] ${i.message}`).join("; ");
  throw new Error(`[curriculum-tree] árvore inválida: ${detalhe}`);
}

// Valida lições autorais e revisões sintéticas juntas — a sintética também
// precisa passar pelas regras v2 de `validateLessonSteps` (docs/25 §18 T-06).
const issuesMicrolicoes = validateMicroLessons(
  [...TODAS_AS_LICOES, ...CHAPTER_REVIEWS],
  resolveExercise,
  CHAPTER_IDS,
);
if (issuesMicrolicoes.length > 0) {
  const detalhe = issuesMicrolicoes.map((i) => `[${i.code}] ${i.message}`).join("; ");
  throw new Error(`[microlicoes] conteúdo inválido: ${detalhe}`);
}
