import { SUBJECTS, type Subject } from "@/data/subjects";
import { TRILHAS } from "@/content/trilhas";
import type { Trilha } from "@/lib/lessons/types";

/**
 * Índice de currículo (docs/20 §8.2/§14.1, Fase 5) — matéria → tópicos, mais
 * a lista de trilhas existentes. Deliberadamente NÃO inventa capítulos ou
 * habilidades: essas entidades nascem com o conteúdo real da Fase 6
 * (microlições) e da Fase 9 (trilha de aprendizado). Este índice adapta o que
 * já existe (`data/subjects.ts`, `content/trilhas/`) numa forma validável, pra
 * as fases seguintes estenderem em vez de recomeçar.
 */
export interface CurriculumSubject {
  id: string;
  name: string;
  topicIds: string[];
}

export interface CurriculumIndex {
  subjects: CurriculumSubject[];
  trilhaIds: string[];
}

export function buildCurriculum(
  subjects: Subject[] = SUBJECTS,
  trilhas: Trilha[] = TRILHAS,
): CurriculumIndex {
  return {
    subjects: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      topicIds: s.topics.map((t) => t.id),
    })),
    trilhaIds: trilhas.map((t) => t.id),
  };
}

/** Currículo construído a partir do conteúdo real carregado — só publicar depois de validado (ver `learning/validate.ts`). */
export const CURRICULUM: CurriculumIndex = buildCurriculum();
