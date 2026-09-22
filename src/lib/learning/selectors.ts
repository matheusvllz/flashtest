import { hojeISO, isLessonUnlocked, type AppState } from "@/lib/store";
import type { Trilha } from "@/lib/lessons/types";
import type { MicroLesson } from "./types";
import { isReviewDue, skillEvidenceState } from "./review";

/**
 * Seletores puros de acesso/conclusão/contagem (docs/20 §14.1, Fase 5). Mesma
 * lógica que `redacao.index.tsx` já calculava inline — extraída aqui pra
 * fases futuras (9, 10) reaproveitarem em vez de duplicar. Não força
 * refatoração das telas existentes: elas continuam funcionando como estão.
 */

export function lessonsConcludedInTrilha(trilha: Trilha, s: AppState): number {
  return trilha.licoes.filter((l) => Boolean(s.progress.lessons[l.id])).length;
}

export function trilhaProgressPct(trilha: Trilha, s: AppState): number {
  if (trilha.licoes.length === 0) return 0;
  return Math.round((lessonsConcludedInTrilha(trilha, s) / trilha.licoes.length) * 100);
}

/** Primeira lição desbloqueada e ainda não concluída da trilha — o "nó atual". */
export function currentLessonId(trilha: Trilha, s: AppState): string | undefined {
  return trilha.licoes.find(
    (l) => !s.progress.lessons[l.id] && isLessonUnlocked(trilha.licoes, l.id, s),
  )?.id;
}

/* ------------------------------------------------------------ trilha de microlições (Fase 9) */

export type NodeAvailability = "available" | "locked";
export type NodeCompletion = "not-started" | "in-progress" | "completed";
export type NodeEvidence = "unmeasured" | "learning" | "consistent";
export type NodeReview = "not-due" | "due";

/**
 * Estados de um nó da trilha — DIMENSÕES INDEPENDENTES (docs/20 §11): uma
 * lição pode estar `completed` e `review: "due"` ao mesmo tempo — concluir
 * não apaga o check, e revisão devida não bloqueia o conteúdo já visto
 * (docs/20 §11: "não apagar o check nem rotular 'esquecido'").
 */
export interface MicroLessonNodeState {
  availability: NodeAvailability;
  completion: NodeCompletion;
  evidence: NodeEvidence;
  review: NodeReview;
}

/**
 * Disponibilidade = todos os pré-requisitos concluídos (docs/20 §11: "conclusão
 * desbloqueia a seguinte, sem exigir 100%" — não olha desempenho, só se a
 * lição terminou). O grafo já foi validado sem ciclo na carga do catálogo
 * (`microlicoes/index.ts#assertContentValid`), então isto não precisa
 * reverificar ciclo — só percorrer pré-requisitos já garantidos acíclicos.
 */
export function microLessonNodeState(lesson: MicroLesson, s: AppState): MicroLessonNodeState {
  const completedIds = new Set(Object.keys(s.learning.completedLessons));

  const availability: NodeAvailability = lesson.prerequisiteLessonIds.every((id) =>
    completedIds.has(id),
  )
    ? "available"
    : "locked";

  const completed = completedIds.has(lesson.id);
  const emAndamento =
    !completed &&
    s.learning.activeSession?.contentId === lesson.id &&
    s.learning.activeSession?.completedAt === null;
  const completion: NodeCompletion = completed ? "completed" : emAndamento ? "in-progress" : "not-started";

  const estadosDeEvidencia = lesson.skillIds.map((id) => skillEvidenceState(s.learning.skillEvidence[id]));
  const evidence: NodeEvidence =
    estadosDeEvidencia.length === 0
      ? "unmeasured"
      : estadosDeEvidencia.every((e) => e === "consistente")
        ? "consistent"
        : estadosDeEvidencia.some((e) => e !== "sem-evidencia")
          ? "learning"
          : "unmeasured";

  const hoje = hojeISO();
  const review: NodeReview = lesson.skillIds.some((id) => {
    const agenda = s.learning.reviewSchedule[id];
    return agenda ? isReviewDue(agenda, hoje) : false;
  })
    ? "due"
    : "not-due";

  return { availability, completion, evidence, review };
}

/** Rótulo textual do estado — leitor de tela distingue atual/concluída/bloqueada sem depender só de ícone/cor (docs/20 §11, item 2). */
export function nodeStateLabel(state: MicroLessonNodeState): string {
  if (state.availability === "locked") return "Bloqueada";
  if (state.completion === "completed") return state.review === "due" ? "Concluída · revisão sugerida" : "Concluída";
  if (state.completion === "in-progress") return "Em andamento";
  return "Disponível";
}

/** Primeira lição disponível (desbloqueada) e ainda não concluída — o "continuar de onde parou" da trilha de microlições. */
export function nextAvailableMicroLesson(
  lessons: MicroLesson[],
  s: AppState,
): MicroLesson | undefined {
  return lessons.find((l) => {
    const state = microLessonNodeState(l, s);
    return state.availability === "available" && state.completion !== "completed";
  });
}
