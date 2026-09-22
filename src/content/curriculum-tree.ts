import { SUBJECT_MAP } from "@/data/subjects";
import { TRILHAS, trilhaById } from "@/content/trilhas";

/**
 * Árvore de currículo (docs/25 §6.1/§7.2, Fase 1) — matéria → seção →
 * capítulo → lição, separada do índice existente (`src/content/curriculum.ts`,
 * `CurriculumIndex`), que continua servindo `assertContentValid`/testes
 * atuais sem mudança. Capítulo "micro" declara `lessonIds` à mão (lições do
 * catálogo `src/content/microlicoes/`); capítulo "legado" declara `trilhaId`
 * e tem `lessonIds` derivado de `TRILHAS` por `buildLegacyChapter` — uma
 * trilha só, sem duplicar as 15 trilhas de redação como entidade separada.
 */

export interface CurriculumChapter {
  /** Id do capítulo — id autoral (capítulo micro) ou `trilhaId` (capítulo legado). */
  id: string;
  title: string;
  description?: string;
  /** Preenchido à mão para capítulos "micro"; derivado de `TRILHAS` para "legado" (`buildLegacyChapter`). */
  lessonIds: string[];
  /** Presente = capítulo legado, tocado pelo `LessonPlayer` existente. */
  trilhaId?: string;
  prerequisiteChapterIds: string[];
}

export interface CurriculumSection {
  id: string;
  title: string;
  chapters: CurriculumChapter[];
}

export interface CurriculumSubject {
  id: string;
  name: string;
  sections: CurriculumSection[];
}

export interface Curriculum {
  courseId: "enem";
  subjects: CurriculumSubject[];
}

/**
 * Constrói um capítulo legado a partir de uma trilha existente (docs/25 §7.2)
 * — `id = trilhaId`, `title = trilha.nome`, `description = trilha.descricao`,
 * `lessonIds` = as lições da trilha, na própria ordem de desbloqueio dela.
 * Lança se a trilha não existir: referência quebrada não pode virar capítulo
 * fantasma na árvore (mesma filosofia de `define.ts`/`validate.ts`).
 */
function buildLegacyChapter(trilhaId: string): CurriculumChapter {
  const trilha = trilhaById(trilhaId);
  if (!trilha) {
    throw new Error(`[curriculum-tree] trilha "${trilhaId}" não existe (src/content/trilhas)`);
  }
  return {
    id: trilhaId,
    title: trilha.nome,
    description: trilha.descricao,
    lessonIds: trilha.licoes.map((l) => l.id),
    trilhaId,
    prerequisiteChapterIds: [],
  };
}

/**
 * Conteúdo obrigatório da árvore (docs/25 §7.2) — ordem = ordem de exibição.
 * Todos os `prerequisiteChapterIds` são `[]` nesta entrega (docs/20 §11:
 * "introduções acessíveis").
 */
export const CURRICULUM_TREE: Curriculum = {
  courseId: "enem",
  subjects: [
    {
      id: "mat",
      name: SUBJECT_MAP.mat.name,
      sections: [
        {
          id: "mat-numeros",
          title: "Números e proporção",
          chapters: [
            {
              id: "mat-porcentagem",
              title: "Porcentagem",
              lessonIds: ["porcentagem-valor", "porcentagem-aumento-desconto"],
              prerequisiteChapterIds: [],
            },
          ],
        },
      ],
    },
    {
      id: "por",
      name: SUBJECT_MAP.por.name,
      sections: [
        {
          id: "por-gramatica",
          title: "Gramática essencial",
          chapters: [
            {
              id: "por-crase",
              title: "Crase",
              lessonIds: ["crase-quando-usar", "crase-proibida"],
              prerequisiteChapterIds: [],
            },
            buildLegacyChapter("crase"),
            buildLegacyChapter("concordancia"),
            buildLegacyChapter("regencia-colocacao"),
            buildLegacyChapter("pontuacao"),
          ],
        },
        {
          id: "por-palavras",
          title: "Palavras e sons",
          chapters: [
            buildLegacyChapter("fonologia-ortografia"),
            buildLegacyChapter("classes-1"),
            buildLegacyChapter("verbo"),
            buildLegacyChapter("classes-2-formacao"),
          ],
        },
        {
          id: "por-sintaxe",
          title: "Sintaxe",
          chapters: [buildLegacyChapter("sintaxe-1"), buildLegacyChapter("sintaxe-2")],
        },
        {
          id: "por-leitura",
          title: "Sentido e leitura",
          chapters: [buildLegacyChapter("semantica"), buildLegacyChapter("interpretacao")],
        },
      ],
    },
    {
      id: "red",
      name: SUBJECT_MAP.red.name,
      sections: [
        {
          id: "red-dissertacao",
          title: "Dissertação ENEM",
          chapters: [
            buildLegacyChapter("redacao-estrutura"),
            buildLegacyChapter("redacao-argumentacao"),
            buildLegacyChapter("redacao-competencias"),
          ],
        },
      ],
    },
    {
      id: "bio",
      name: SUBJECT_MAP.bio.name,
      sections: [
        {
          id: "bio-celula",
          title: "A célula",
          chapters: [
            {
              id: "bio-citologia",
              title: "Citologia",
              lessonIds: ["citologia-membrana", "citologia-organelas"],
              prerequisiteChapterIds: [],
            },
          ],
        },
      ],
    },
  ],
};

const TODOS_OS_CAPITULOS: CurriculumChapter[] = CURRICULUM_TREE.subjects.flatMap((s) =>
  s.sections.flatMap((sec) => sec.chapters),
);

/**
 * Ids de todas as lições micro na ordem da árvore (matéria → seção →
 * capítulo → lição) — só capítulos SEM `trilhaId` contribuem (capítulos
 * legados não têm lição "micro"; suas lições são tocadas pelo `LessonPlayer`
 * existente, fora do catálogo `MicroLesson`).
 */
export const TRAIL_ORDER: string[] = TODOS_OS_CAPITULOS.filter((c) => !c.trilhaId).flatMap(
  (c) => c.lessonIds,
);

export function chapterById(id: string): CurriculumChapter | undefined {
  return TODOS_OS_CAPITULOS.find((c) => c.id === id);
}

export function chapterOfLesson(lessonId: string): CurriculumChapter | undefined {
  return TODOS_OS_CAPITULOS.find((c) => c.lessonIds.includes(lessonId));
}

export function sectionOfChapter(
  chapterId: string,
): { subject: CurriculumSubject; section: CurriculumSection; index: number } | undefined {
  for (const subject of CURRICULUM_TREE.subjects) {
    for (const section of subject.sections) {
      const index = section.chapters.findIndex((c) => c.id === chapterId);
      if (index !== -1) return { subject, section, index };
    }
  }
  return undefined;
}
