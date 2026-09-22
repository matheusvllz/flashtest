import {
  CURRICULUM_TREE,
  chapterById,
  sectionOfChapter,
  type CurriculumChapter,
  type CurriculumSection,
  type CurriculumSubject,
} from "@/content/curriculum-tree";
import { phaseById } from "@/content/microlicoes";
import { allLessonsInOrder, lessonById, trilhaById } from "@/content/trilhas";
import type { Trilha } from "@/lib/lessons/types";
import { isLessonUnlocked, type AppState } from "@/lib/store";
import { reviewLessonId } from "./chapter-review";
import { recommendNext, type Recommendation, type RecommendationReason } from "./recommend";
import { microLessonNodeState } from "./selectors";
import { nodeKindOf, questionSteps, stepsOf } from "./steps";
import type { MicroLesson } from "./types";

/**
 * Modelo da trilha (docs/25 §6.1/§6.3/§7.5, Fase 6, T-15). `isChapterCompleted`/
 * `isSectionCompleted` vieram do T-09 (versão leve, usada por
 * `useLearningSession#complete()`); esta tarefa completa o resto do arquivo:
 * os tipos de nó/capítulo/seção/matéria/alvo-de-continuar e as três funções
 * (`buildTrail`, `isTrailLessonLocked`, `phasesOrderedForSubject`) que a rota
 * `/trilha` (T-18) consome.
 */

/**
 * Capítulo concluído (docs/25 §6.6): micro = toda `lessonIds` tem entrada em
 * `learning.completedLessons`; legado = toda `lessonIds` tem entrada em
 * `progress.lessons`. `chapter.lessonIds` de um capítulo legado já É
 * `trilha.licoes.map(l => l.id)` (preenchido por `buildLegacyChapter` em
 * `curriculum-tree.ts`), então checar contra ele é equivalente a checar
 * contra `trilhaById(trilhaId).licoes` sem precisar importar `trilhas/`
 * aqui — menos uma dependência cruzada.
 */
export function isChapterCompleted(chapter: CurriculumChapter, s: AppState): boolean {
  if (chapter.trilhaId) {
    return chapter.lessonIds.every((id) => Boolean(s.progress.lessons[id]));
  }
  return chapter.lessonIds.every((id) => Boolean(s.learning.completedLessons[id]));
}

/** Seção concluída = todos os capítulos concluídos (docs/25 §6.6). */
export function isSectionCompleted(section: CurriculumSection, s: AppState): boolean {
  return section.chapters.every((c) => isChapterCompleted(c, s));
}

/* ------------------------------------------------------------ tipos de nó (docs/25 §7.5) */

export type TrailNodeKind = "aula" | "pratica" | "revisao";
export type TrailNodeStatus = "completed" | "in-progress" | "current" | "available" | "locked";
export type TrailHref =
  | { to: "/learn/$lessonId"; params: { lessonId: string } }
  | { to: "/redacao/$licaoId"; params: { licaoId: string } };

export interface TrailNode {
  id: string;
  source: "micro" | "legado";
  kind: TrailNodeKind;
  status: TrailNodeStatus;
  title: string;
  questionCount: number;
  stars?: 1 | 2 | 3;
  reviewDue: boolean;
  href: TrailHref;
}

export interface TrailChapter {
  id: string;
  title: string;
  description?: string;
  nodes: TrailNode[];
  /** Sem o nó de revisão (docs/25 §7.5). */
  completedCount: number;
  totalCount: number;
  status: "locked" | "available" | "in-progress" | "completed";
  containsCurrent: boolean;
}

export interface TrailSection {
  id: string;
  index: number;
  title: string;
  chapters: TrailChapter[];
  completedCount: number;
  totalCount: number;
  status: TrailChapter["status"];
}

export interface TrailSubject {
  id: string;
  name: string;
  sections: TrailSection[];
  completedCount: number;
  totalCount: number;
}

export interface ContinueTarget {
  lessonId: string;
  source: "micro" | "legado";
  title: string;
  chapterTitle: string;
  sectionTitle: string;
  subjectId: string;
  href: TrailHref;
  reason: RecommendationReason | "legacy-next";
  explanation: string;
  firstTime: boolean;
}

export interface TrailModel {
  subjects: TrailSubject[];
  continueTarget: ContinueTarget | null;
  currentLessonId: string | null;
  defaultSubjectId: string;
}

/* ------------------------------------------------------------ bloqueio (docs/25 §6.3) */

/** Todos os pré-requisitos de CAPÍTULO já concluídos (encadeado, embora hoje `prerequisiteChapterIds` seja sempre `[]` no conteúdo publicado). */
function chapterPrerequisitesMet(chapter: CurriculumChapter, s: AppState): boolean {
  return chapter.prerequisiteChapterIds.every((id) => {
    const c = chapterById(id);
    return c ? isChapterCompleted(c, s) : true;
  });
}

/**
 * Regra de bloqueio definitiva de um nó (docs/25 §6.3), usada tanto pro
 * status visual do nó quanto pro deep link direto (`/learn/$lessonId`):
 * capítulo bloqueado OU (micro) pré-requisito de lição não concluído OU
 * (legado) `!isLessonUnlocked` (ordem sequencial dentro da trilha).
 */
export function isTrailLessonLocked(lessonId: string, s: AppState): boolean {
  const micro = phaseById(lessonId);
  if (micro) {
    const chapter = chapterById(micro.chapterId);
    if (chapter && !chapterPrerequisitesMet(chapter, s)) return true;
    return !micro.prerequisiteLessonIds.every((id) => Boolean(s.learning.completedLessons[id]));
  }

  const legado = lessonById(lessonId);
  if (legado) {
    const chapter = chapterById(legado.trilha.id);
    if (chapter && !chapterPrerequisitesMet(chapter, s)) return true;
    return !isLessonUnlocked(legado.trilha.licoes, lessonId, s);
  }

  // Id que não existe em nenhum catálogo — não é papel desta função dizer
  // "bloqueada"; quem chama já trata "não existe" separadamente.
  return false;
}

/* ------------------------------------------------------------ ordenação por matéria (docs/25 §7.5) */

/**
 * Todas as fases (lições autorais + revisões sintéticas de capítulo) na
 * ordem matéria → seção → capítulo → lição, com a revisão de cada capítulo
 * logo depois das lições dele — a mesma ordem de `TRAIL_ORDER`, só que com as
 * revisões intercaladas em vez de deixadas de fora.
 */
function fasesNaOrdemDaArvore(): MicroLesson[] {
  const resultado: MicroLesson[] = [];
  for (const subject of CURRICULUM_TREE.subjects) {
    for (const section of subject.sections) {
      for (const chapter of section.chapters) {
        if (chapter.trilhaId) continue; // capítulo legado não tem "fase" (MicroLesson) própria.
        for (const lessonId of chapter.lessonIds) {
          const lesson = phaseById(lessonId);
          if (lesson) resultado.push(lesson);
        }
        const review = phaseById(reviewLessonId(chapter.id));
        if (review) resultado.push(review);
      }
    }
  }
  return resultado;
}

/**
 * Lições da matéria selecionada primeiro (mantendo a ordem da árvore), depois
 * o resto (docs/25 §7.5) — `recommendNext` busca nesta lista em ordem, então
 * isto é o que faz a recomendação priorizar a matéria escolhida nos chips sem
 * nunca inventar uma lição fora da árvore. `subjectId: null` devolve a ordem
 * crua da árvore.
 */
export function phasesOrderedForSubject(subjectId: string | null): MicroLesson[] {
  const base = fasesNaOrdemDaArvore();
  if (!subjectId) return base;
  const daMateria = base.filter((l) => l.subjectId === subjectId);
  const resto = base.filter((l) => l.subjectId !== subjectId);
  return [...daMateria, ...resto];
}

/* ------------------------------------------------------------ alvo de "continuar" */

function microContinueTarget(
  lessonId: string,
  reason: RecommendationReason,
  explanation: string,
  firstTime: boolean,
): ContinueTarget | null {
  const lesson = phaseById(lessonId);
  if (!lesson) return null;
  const chapter = chapterById(lesson.chapterId);
  const loc = chapter ? sectionOfChapter(chapter.id) : undefined;
  return {
    lessonId,
    source: "micro",
    title: lesson.title,
    chapterTitle: chapter?.title ?? "",
    sectionTitle: loc?.section.title ?? "",
    subjectId: loc?.subject.id ?? lesson.subjectId,
    href: { to: "/learn/$lessonId", params: { lessonId } },
    reason,
    explanation,
    firstTime,
  };
}

function legacyContinueTarget(
  trilha: Trilha,
  lesson: Trilha["licoes"][number],
  firstTime: boolean,
): ContinueTarget {
  const chapter = chapterById(trilha.id); // `buildLegacyChapter` usa id = trilhaId.
  const loc = chapter ? sectionOfChapter(chapter.id) : undefined;
  return {
    lessonId: lesson.id,
    source: "legado",
    title: lesson.titulo,
    chapterTitle: chapter?.title ?? trilha.nome,
    sectionTitle: loc?.section.title ?? "",
    subjectId: loc?.subject.id ?? "",
    href: { to: "/redacao/$licaoId", params: { licaoId: lesson.id } },
    reason: "legacy-next",
    explanation: `Próxima lição de ${trilha.nome}.`,
    firstTime,
  };
}

function isTargetCompleted(target: ContinueTarget, s: AppState): boolean {
  return target.source === "micro"
    ? Boolean(s.learning.completedLessons[target.lessonId])
    : Boolean(s.progress.lessons[target.lessonId]);
}

/* ------------------------------------------------------------ construção de nós/capítulos/seções */

function buildMicroNode(lessonId: string, s: AppState, currentLessonId: string | null): TrailNode | null {
  const lesson = phaseById(lessonId);
  if (!lesson) return null;
  const nodeState = microLessonNodeState(lesson, s);
  const locked = isTrailLessonLocked(lessonId, s);
  const status: TrailNodeStatus = locked
    ? "locked"
    : nodeState.completion === "completed"
      ? "completed"
      : nodeState.completion === "in-progress"
        ? "in-progress"
        : lessonId === currentLessonId
          ? "current"
          : "available";
  return {
    id: lessonId,
    source: "micro",
    kind: nodeKindOf(lesson),
    status,
    title: lesson.title,
    questionCount: questionSteps(stepsOf(lesson)).length,
    stars: s.learning.completedLessons[lessonId]?.stars,
    reviewDue: nodeState.review === "due",
    href: { to: "/learn/$lessonId", params: { lessonId } },
  };
}

function buildLegacyNode(
  trilha: Trilha,
  lesson: Trilha["licoes"][number],
  s: AppState,
  currentLessonId: string | null,
): TrailNode {
  const completed = Boolean(s.progress.lessons[lesson.id]);
  const locked = isTrailLessonLocked(lesson.id, s);
  const status: TrailNodeStatus = locked
    ? "locked"
    : completed
      ? "completed"
      : lesson.id === currentLessonId
        ? "current"
        : "available";
  return {
    id: lesson.id,
    source: "legado",
    kind: "pratica",
    status,
    title: lesson.titulo,
    questionCount: lesson.exercicios.length,
    stars: s.progress.lessons[lesson.id]?.stars,
    reviewDue: false,
    href: { to: "/redacao/$licaoId", params: { licaoId: lesson.id } },
  };
}

function buildChapter(chapter: CurriculumChapter, s: AppState, currentLessonId: string | null): TrailChapter {
  let nodes: TrailNode[];

  if (chapter.trilhaId) {
    const trilha = trilhaById(chapter.trilhaId);
    nodes = trilha ? trilha.licoes.map((l) => buildLegacyNode(trilha, l, s, currentLessonId)) : [];
  } else {
    const licaoNodes = chapter.lessonIds
      .map((id) => buildMicroNode(id, s, currentLessonId))
      .filter((n): n is TrailNode => n !== null);
    const reviewNode = buildMicroNode(reviewLessonId(chapter.id), s, currentLessonId);
    nodes = reviewNode ? [...licaoNodes, reviewNode] : licaoNodes;
  }

  // Progresso do capítulo é sobre lições reais — a revisão é bônus, não conta
  // pro denominador (docs/25 §7.5).
  const coreNodes = nodes.filter((n) => n.kind !== "revisao");
  const completedCount = coreNodes.filter((n) => n.status === "completed").length;
  const totalCount = coreNodes.length;

  const locked = !chapterPrerequisitesMet(chapter, s);
  const completed = isChapterCompleted(chapter, s);
  const emAndamento = coreNodes.some((n) => n.status === "completed" || n.status === "in-progress");
  const status: TrailChapter["status"] = locked
    ? "locked"
    : completed
      ? "completed"
      : emAndamento
        ? "in-progress"
        : "available";

  return {
    id: chapter.id,
    title: chapter.title,
    description: chapter.description,
    nodes,
    completedCount,
    totalCount,
    status,
    containsCurrent: nodes.some((n) => n.status === "current"),
  };
}

function buildSection(
  section: CurriculumSection,
  index: number,
  s: AppState,
  currentLessonId: string | null,
): TrailSection {
  const chapters = section.chapters.map((c) => buildChapter(c, s, currentLessonId));
  const completedCount = chapters.reduce((n, c) => n + c.completedCount, 0);
  const totalCount = chapters.reduce((n, c) => n + c.totalCount, 0);
  const completed = isSectionCompleted(section, s);
  const locked = chapters.length > 0 && chapters.every((c) => c.status === "locked");
  const emAndamento = chapters.some((c) => c.status === "in-progress" || c.status === "completed");
  const status: TrailChapter["status"] = locked
    ? "locked"
    : completed
      ? "completed"
      : emAndamento
        ? "in-progress"
        : "available";
  return { id: section.id, index, title: section.title, chapters, completedCount, totalCount, status };
}

function buildSubject(subject: CurriculumSubject, s: AppState, currentLessonId: string | null): TrailSubject {
  const sections = subject.sections.map((sec, i) => buildSection(sec, i + 1, s, currentLessonId));
  const completedCount = sections.reduce((n, sec) => n + sec.completedCount, 0);
  const totalCount = sections.reduce((n, sec) => n + sec.totalCount, 0);
  return { id: subject.id, name: subject.name, sections, completedCount, totalCount };
}

/* ------------------------------------------------------------ buildTrail (docs/25 §7.5) */

/**
 * Modelo completo da trilha — tudo o que `/trilha` (T-18) precisa pra
 * renderizar, numa função pura (relógio injetado via `hoje`, nenhuma leitura
 * de `Date.now()` aqui dentro). Passos 1-7 do docs/25 §7.5.
 */
export function buildTrail(s: AppState, hoje: string): TrailModel {
  // 1-2. Recomendação determinística priorizando a matéria selecionada.
  const ordered = phasesOrderedForSubject(s.prefs.trailSubjectId);
  const rec: Recommendation = recommendNext({
    activeSession: s.learning.activeSession,
    lessons: ordered,
    recentAttempts: s.learning.recentAttempts,
    reviewSchedule: s.learning.reviewSchedule,
    s,
    hojeISO: hoje,
    remediationAlreadyOfferedThisSession: false,
  });

  // 3. Recomendação pra conteúdo removido ou bloqueado nunca vira alvo —
  // `recommendNext` não sabe validar isso sozinho (não muda de assinatura).
  const efetiva: RecommendationReason =
    rec.lessonId !== undefined && (!phaseById(rec.lessonId) || isTrailLessonLocked(rec.lessonId, s))
      ? "none"
      : rec.reason;

  const firstTime =
    Object.keys(s.learning.completedLessons).length === 0 && Object.keys(s.progress.lessons).length === 0;

  // 4. Alvo micro se a recomendação vale; senão a próxima lição legada não
  // concluída, trilha a trilha, na ordem de desbloqueio (`allLessonsInOrder`).
  let continueTarget: ContinueTarget | null = null;
  if (efetiva !== "none" && rec.lessonId !== undefined) {
    continueTarget = microContinueTarget(rec.lessonId, rec.reason, rec.explanation, firstTime);
  } else {
    const proxima = allLessonsInOrder().find(({ lesson }) => !s.progress.lessons[lesson.id]);
    continueTarget = proxima ? legacyContinueTarget(proxima.trilha, proxima.lesson, firstTime) : null;
  }

  // 5. Um alvo já concluído (pode acontecer com remediação/revisão devida,
  // que não filtram conclusão) não vira "o nó atual" da trilha.
  const currentLessonId =
    continueTarget && !isTargetCompleted(continueTarget, s) ? continueTarget.lessonId : null;

  // 6. Árvore inteira, matéria por matéria.
  const subjects = CURRICULUM_TREE.subjects.map((subject) => buildSubject(subject, s, currentLessonId));

  // 7. Matéria selecionada > matéria do alvo > primeira da árvore.
  const defaultSubjectId =
    s.prefs.trailSubjectId ?? continueTarget?.subjectId ?? CURRICULUM_TREE.subjects[0].id;

  return { subjects, continueTarget, currentLessonId, defaultSubjectId };
}
