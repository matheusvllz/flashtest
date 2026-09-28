import { SUBJECTS, SUBJECT_MAP } from "@/data/subjects";
import { TRILHAS, trilhaById } from "@/content/trilhas";
import { AULAS_GERADAS } from "@/content/banco/aulas-geradas";
import type { GeneratedLessonRef } from "@/content/items/package";
import { FEATURES } from "@/lib/features";

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
  /** Habilidades que o capítulo ensina (docs/30 §8.1/§8.3, Fase 2 T-2.6) — `src/content/taxonomy`. */
  skillIds?: string[];
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
 * Habilidade(s) representativa(s) de cada trilha legada (docs/30 §8.1/§18.2,
 * Fase 2 T-2.6) — granularidade grosseira de propósito: uma trilha inteira
 * (dezenas de exercícios) aponta pra 1-2 habilidades até a Fase 3 (F3.5)
 * reclassificar item a item. `buildLegacyChapter` lança se a trilha não
 * tiver entrada aqui — mesma filosofia de referência-quebrada-nunca-silenciosa
 * das outras validações deste arquivo.
 */
const LEGACY_CHAPTER_SKILLS: Record<string, string[]> = {
  crase: ["por:crase-regra-basica", "por:crase-casos-proibidos"],
  concordancia: ["por:concordancia-verbal-nominal"],
  "regencia-colocacao": ["por:regencia-verbal-nominal"],
  pontuacao: ["por:pontuacao-virgula-regras"],
  "fonologia-ortografia": ["por:ortografia-acentuacao"],
  "classes-1": ["por:classes-gramaticais-identificacao"],
  verbo: ["por:tempos-verbais-emprego"],
  "classes-2-formacao": ["por:formacao-palavras-processos"],
  "sintaxe-1": ["por:sintaxe-termos-oracao"],
  "sintaxe-2": ["por:sintaxe-periodo-composto"],
  semantica: ["por:sentido-figuras-linguagem"],
  interpretacao: ["por:interpretacao-ideia-principal"],
  "redacao-estrutura": ["red:estrutura-dissertativo-argumentativa"],
  "redacao-argumentacao": ["red:argumentacao-repertorio"],
  "redacao-competencias": ["red:competencias-avaliacao-enem"],
};

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
  const skillIds = LEGACY_CHAPTER_SKILLS[trilhaId];
  if (!skillIds) {
    throw new Error(`[curriculum-tree] trilha "${trilhaId}" não tem habilidade mapeada em LEGACY_CHAPTER_SKILLS`);
  }
  return {
    id: trilhaId,
    title: trilha.nome,
    description: trilha.descricao,
    lessonIds: trilha.licoes.map((l) => l.id),
    trilhaId,
    prerequisiteChapterIds: [],
    skillIds,
  };
}

/**
 * Conteúdo obrigatório da árvore (docs/25 §7.2) — ordem = ordem de exibição.
 * Todos os `prerequisiteChapterIds` são `[]` nesta entrega (docs/20 §11:
 * "introduções acessíveis").
 */
/** A árvore autoral (docs/25 §7.2), antes de `comAulasGeradas` acrescentar as seções "Mais aulas"
 * (docs/30 §21.3, F11.3) — exportada só pra teste de estrutura declarada; o app usa `CURRICULUM_TREE`. */
export const ARVORE_AUTORAL: Curriculum = {
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
              skillIds: ["mat:porcentagem-conceito", "mat:porcentagem-valor", "mat:porcentagem-fator-multiplicativo"],
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
              skillIds: ["por:crase-regra-basica", "por:crase-casos-proibidos"],
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
              skillIds: ["bio:membrana-estrutura", "bio:membrana-funcao", "bio:organelas-funcao"],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Aulas geradas pelo pipeline (docs/30 §21.3, docs/31 F11.3) entram na árvore
 * como capítulos de uma aula, numa seção "Mais aulas" da matéria (matéria nova
 * é criada no fim, na ordem de `SUBJECTS`). A aula em si mora no pacote e só
 * resolve depois de `ensureSubjects` — o mapa carrega o pacote da matéria ao
 * abrir. Pura: recebe a árvore e as refs, devolve uma árvore nova.
 */
export function comAulasGeradas(arvore: Curriculum, refs: GeneratedLessonRef[]): Curriculum {
  if (refs.length === 0) return arvore;
  const subjects = arvore.subjects.map((s) => ({ ...s, sections: s.sections.map((sec) => ({ ...sec, chapters: [...sec.chapters] })) }));
  const ordemMaterias = SUBJECTS.map((s) => s.id);
  for (const ref of refs) {
    let subject = subjects.find((s) => s.id === ref.subjectId);
    if (!subject) {
      subject = { id: ref.subjectId, name: SUBJECT_MAP[ref.subjectId]?.name ?? ref.subjectId, sections: [] };
      subjects.push(subject);
    }
    const sectionId = `${ref.subjectId}-mais-aulas`;
    let section = subject.sections.find((sec) => sec.id === sectionId);
    if (!section) {
      section = { id: sectionId, title: "Mais aulas", chapters: [] };
      subject.sections.push(section);
    }
    section.chapters.push({
      id: ref.chapterId,
      title: ref.title,
      lessonIds: [ref.lessonId],
      prerequisiteChapterIds: [],
      skillIds: ref.skillIds,
    });
  }
  const originais = new Set(arvore.subjects.map((s) => s.id));
  subjects.sort((a, b) =>
    originais.has(a.id) || originais.has(b.id) ? 0 : ordemMaterias.indexOf(a.id) - ordemMaterias.indexOf(b.id),
  );
  return { ...arvore, subjects };
}

export const CURRICULUM_TREE: Curriculum = comAulasGeradas(
  ARVORE_AUTORAL,
  FEATURES.pacotesConteudo ? AULAS_GERADAS : [],
);

/** Ids das aulas geradas declaradas na árvore — "declaradas, carregadas sob demanda" (docs/30 §21.3). */
export const IDS_AULAS_GERADAS: Set<string> = new Set(
  FEATURES.pacotesConteudo ? AULAS_GERADAS.map((r) => r.lessonId) : [],
);

/** Matérias que têm aula gerada na árvore — o mapa carrega o pacote delas ao abrir. */
export const MATERIAS_COM_AULA_GERADA: Set<string> = new Set(
  FEATURES.pacotesConteudo ? AULAS_GERADAS.map((r) => r.subjectId) : [],
);

/** Matéria de uma aula gerada — pra quem precisa carregar o pacote antes de abrir. */
export function subjectOfAulaGerada(lessonId: string): string | undefined {
  return FEATURES.pacotesConteudo ? AULAS_GERADAS.find((r) => r.lessonId === lessonId)?.subjectId : undefined;
}

const TODOS_OS_CAPITULOS: CurriculumChapter[] = CURRICULUM_TREE.subjects.flatMap((s) =>
  s.sections.flatMap((sec) => sec.chapters),
);

/**
 * Ids de lição na ordem de UMA árvore (matéria → seção → capítulo → lição) —
 * só capítulos SEM `trilhaId` contribuem (capítulos legados não têm lição
 * "micro"; suas lições são tocadas pelo `LessonPlayer` existente, fora do
 * catálogo `MicroLesson`). Extraída de `TRAIL_ORDER` pra também dar a ordem
 * só da árvore AUTORAL em teste, sem as seções "Mais aulas" (docs/30 §21.3).
 */
export function trailOrderOf(tree: Curriculum): string[] {
  return tree.subjects
    .flatMap((s) => s.sections.flatMap((sec) => sec.chapters))
    .filter((c) => !c.trilhaId)
    .flatMap((c) => c.lessonIds);
}

/** Ids de todas as lições micro na ordem da árvore EM TEMPO DE EXECUÇÃO — inclui as aulas
 * geradas (docs/30 §21.3) quando `pacotesConteudo` está ligada. Pra a ordem só da parte
 * autoral (docs/25 §7.2), use `trailOrderOf(ARVORE_AUTORAL)`. */
export const TRAIL_ORDER: string[] = trailOrderOf(CURRICULUM_TREE);

export function chapterById(id: string): CurriculumChapter | undefined {
  return TODOS_OS_CAPITULOS.find((c) => c.id === id);
}

export function chapterOfLesson(lessonId: string): CurriculumChapter | undefined {
  return TODOS_OS_CAPITULOS.find((c) => c.lessonIds.includes(lessonId));
}

/** Capítulo que ensina uma habilidade (docs/30 §14.4, Fase 12) — usado por `buildActivityLesson` pra achar breadcrumb/contexto de uma atividade sintética. `undefined` quando a habilidade não tem capítulo próprio (a maioria, ainda: só as 3 micro + 15 legadas mapeiam `skillIds` até aqui). */
export function chapterOfSkill(skillId: string): CurriculumChapter | undefined {
  return TODOS_OS_CAPITULOS.find((c) => c.skillIds?.includes(skillId));
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
