import type { CurriculumIndex } from "@/content/curriculum";
import type { StableExerciseId } from "@/content/exercise-ids";
import { SUBJECT_MAP } from "@/data/subjects";
import type { Exercise } from "@/lib/lessons/types";
import { countWords, isV2, questionSteps, scoredQuestionSteps, stepsOf, teachingWordCount } from "./steps";
import type { LessonBlock, LessonStep, MicroLesson, MicroLessonV1, MicroLessonV2, QuestionStep } from "./types";

/** Prefixo de id de revisão sintética de capítulo (docs/25 §7.4) — literal duplicado (não importa de `chapter-review.ts`) pra não criar dependência circular. */
const REVIEW_ID_PREFIX = "revisao--";

function isSintetica(licao: MicroLesson): boolean {
  return licao.id.startsWith(REVIEW_ID_PREFIX);
}

/**
 * Validação de conteúdo (docs/20 §14.1, Fase 5) — "só publicar currículo
 * validado" e "validar todos os índices e referências". Roda sobre os dados
 * já carregados (`CURRICULUM`, `EXERCISE_IDS`); não valida enunciado/gabarito
 * de cada exercício individualmente — isso já é feito na carga pelos
 * builders de `src/lib/lessons/define.ts` (`assert`, "config quebrada = throw
 * na carga").
 */
export interface ValidationIssue {
  code: string;
  message: string;
}

export function validateCurriculum(curriculum: CurriculumIndex): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const subjectIds = curriculum.subjects.map((s) => s.id);
  const duplicateSubjects = duplicates(subjectIds);
  for (const id of duplicateSubjects) {
    issues.push({ code: "subject-id-duplicado", message: `Matéria duplicada: "${id}"` });
  }

  for (const subject of curriculum.subjects) {
    const duplicateTopics = duplicates(subject.topicIds);
    for (const id of duplicateTopics) {
      issues.push({
        code: "topic-id-duplicado",
        message: `Tópico duplicado em "${subject.id}": "${id}"`,
      });
    }
  }

  const duplicateTrilhas = duplicates(curriculum.trilhaIds);
  for (const id of duplicateTrilhas) {
    issues.push({ code: "trilha-id-duplicado", message: `Trilha duplicada: "${id}"` });
  }

  return issues;
}

export function validateExerciseIds(
  exerciseIds: Record<string, StableExerciseId>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [key, value] of Object.entries(exerciseIds)) {
    if (key !== value.id) {
      issues.push({
        code: "exercise-id-inconsistente",
        message: `Chave "${key}" não bate com o id gerado "${value.id}"`,
      });
    }
    if (!Number.isInteger(value.version) || value.version < 1) {
      issues.push({
        code: "exercise-id-versao-invalida",
        message: `Versão inválida em "${key}": ${value.version}`,
      });
    }
  }
  return issues;
}

/**
 * Orçamento de ~100 palavras de ensino do v1 (docs/20 §8.1) — só a prosa que
 * o aluno lê como explicação: `body`/`problem`/`result` dos blocos
 * `concept`/`worked-example`, as duas metades de um `comparison`. Título de
 * bloco é rótulo curto, não prosa; `steps` de `worked-example` é lista de
 * passos, não texto corrido; `accessibleDescription` de `diagram` é
 * alternativa textual pro leitor de tela (docs/20 §8.4), não conteúdo visível
 * — nenhum dos três entra na conta. Deliberadamente mais estreito que
 * `teachingWordCount` (v2, docs/25 §7.3), que soma "todos os textos do
 * block" com orçamento 2.2x maior (220) — os dois formatos têm regras
 * diferentes (docs/25 §6.7).
 */
function v1TeachingWordCount(blocks: LessonBlock[]): number {
  let total = 0;
  for (const block of blocks) {
    switch (block.type) {
      case "concept":
        total += countWords(block.body);
        break;
      case "worked-example":
        total += countWords(block.problem) + countWords(block.result);
        break;
      case "comparison":
        total += countWords(block.left.body) + countWords(block.right.body);
        break;
      case "diagram":
        break;
    }
  }
  return total;
}

/** Todas as referências de exercício de uma lição — checkpoint/prática (v1) ou questões (v2), sempre via `stepsOf` (normaliza os dois formatos), mais `reviewExerciseIds`. */
function referencedExerciseIds(licao: MicroLesson): string[] {
  const dasQuestoes = questionSteps(stepsOf(licao)).map(({ step }) => step.exerciseId);
  return [...dasQuestoes, ...licao.reviewExerciseIds];
}

/**
 * Valida microlições (docs/20 §8.3/Fase 6, docs/25 §7.1/§18 T-04): IDs
 * únicos, capítulo existente, sem pré-requisito cíclico, referências de
 * exercício resolvíveis, forma v1 (checkpoint + 2 práticas) ou v2 (4-8
 * questões intercaladas com ensino, dificuldade não decrescente), 2
 * exercícios de revisão em lição autoral (0 em sintética). `resolveExercise`
 * é injetado pra não criar dependência circular com
 * `content/microlicoes/index.ts` (que é quem chama isto); `chapterIds` vem
 * de `CURRICULUM_TREE` (docs/25 §7.2, T-05).
 */
export function validateMicroLessons(
  licoes: MicroLesson[],
  resolveExercise: (id: string) => Exercise,
  chapterIds: Set<string>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const idsConhecidos = new Set(licoes.map((l) => l.id));

  const duplicateIds = duplicates(licoes.map((l) => l.id));
  for (const id of duplicateIds) {
    issues.push({ code: "licao-id-duplicado", message: `Microlição duplicada: "${id}"` });
  }

  for (const licao of licoes) {
    const sintetica = isSintetica(licao);

    if (licao.skillIds.length === 0) {
      issues.push({ code: "licao-sem-skill", message: `"${licao.id}" não declara nenhuma skillId` });
    }

    if (!chapterIds.has(licao.chapterId)) {
      issues.push({
        code: "licao-capitulo-inexistente",
        message: `"${licao.id}" referencia o capítulo "${licao.chapterId}", que não existe na árvore de currículo`,
      });
    }

    const revisaoEsperada = sintetica ? 0 : 2;
    if (licao.reviewExerciseIds.length !== revisaoEsperada) {
      issues.push({
        code: "licao-revisao-invalida",
        message: `"${licao.id}" precisa de exatamente ${revisaoEsperada} exercícios de revisão (tem ${licao.reviewExerciseIds.length})`,
      });
    }

    if (!isV2(licao)) {
      const v1 = licao as MicroLessonV1;
      if (v1.practiceExerciseIds.length !== 2) {
        issues.push({
          code: "licao-pratica-invalida",
          message: `"${licao.id}" precisa de exatamente 2 exercícios de prática (tem ${v1.practiceExerciseIds.length})`,
        });
      }
    }

    for (const preReqId of licao.prerequisiteLessonIds) {
      if (!idsConhecidos.has(preReqId)) {
        issues.push({
          code: "prerequisito-quebrado",
          message: `"${licao.id}" depende de "${preReqId}", que não existe no catálogo`,
        });
      }
    }

    for (const exId of referencedExerciseIds(licao)) {
      try {
        resolveExercise(exId);
      } catch {
        issues.push({
          code: "exercicio-nao-resolve",
          message: `"${licao.id}" referencia "${exId}", que não existe nem localmente, nem no banco geral, nem em trilha legada`,
        });
      }
    }
  }

  issues.push(...findCyclicPrerequisites(licoes));
  issues.push(...validateLessonSteps(licoes));
  issues.push(...validateExerciseQuality(licoes, resolveExercise));

  return issues;
}

/**
 * Regras de composição dos passos de uma lição v2 (docs/25 §6.5, T-04): 1
 * intro no início, 1 recap no fim, ensino intercalado com 4-8 questões,
 * dificuldade não decrescente, checkpoint primeiro. Rodam sobre `licao.steps`
 * CRU — nunca sobre `stepsOf(licao)`, que já normaliza intro/recap ausentes e
 * mascararia justamente o que esta função existe pra pegar.
 * `steps-exercicio-repetido`/`steps-palavras-ensino` valem pros dois formatos
 * (via `stepsOf`, que também normaliza v1). Lição sintética (`revisao--`,
 * docs/25 §7.4) é isenta de `steps-primeiro-ensino`, `steps-ensino-quantidade`,
 * `steps-checkpoint` e `steps-questoes-seguidas` — por construção ela é só
 * intro + N questões + recap, sem ensino pra intercalar.
 */
export function validateLessonSteps(licoes: MicroLesson[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const licao of licoes) {
    const sintetica = isSintetica(licao);

    // --- universal (v1 normalizado + v2) ---
    const steps = stepsOf(licao);
    const questoes = questionSteps(steps);
    const idsDeQuestao = questoes.map(({ step }) => step.exerciseId);
    const todasReferencias = [...idsDeQuestao, ...licao.reviewExerciseIds];
    const repetidos = duplicates(todasReferencias);
    for (const id of repetidos) {
      issues.push({
        code: "steps-exercicio-repetido",
        message: `"${licao.id}" referencia o exercício "${id}" mais de uma vez (entre questões e/ou revisão)`,
      });
    }

    if (isV2(licao)) {
      const palavras = teachingWordCount(steps);
      if (palavras > 220) {
        issues.push({
          code: "steps-palavras-ensino",
          message: `"${licao.id}" tem ${palavras} palavras de ensino (intro+teach+tip), acima do limite de 220`,
        });
      }
    } else {
      const v1 = licao as MicroLessonV1;
      const palavras = v1TeachingWordCount(v1.blocks);
      if (palavras > 100) {
        issues.push({
          code: "steps-palavras-ensino",
          message: `"${licao.id}" tem ${palavras} palavras de ensino nos blocks, acima do limite de 100`,
        });
      }
    }

    if (!isV2(licao)) continue;

    // --- só v2, sobre os passos CRUS declarados pelo autor ---
    const raw: LessonStep[] = (licao as MicroLessonV2).steps;
    const primeiro = raw[0];
    const ultimo = raw[raw.length - 1];
    const introCount = raw.filter((s) => s.kind === "intro").length;
    const recapCount = raw.filter((s) => s.kind === "recap").length;
    if (primeiro?.kind !== "intro" || ultimo?.kind !== "recap" || introCount > 1 || recapCount > 1) {
      issues.push({
        code: "steps-intro-recap",
        message: `"${licao.id}" precisa começar com exatamente 1 intro e terminar com exatamente 1 recap`,
      });
    }

    if (!sintetica && raw[1]?.kind !== "teach") {
      issues.push({
        code: "steps-primeiro-ensino",
        message: `"${licao.id}" precisa ter um passo "teach" logo após a intro (steps[1])`,
      });
    }

    const rawQuestoes = raw.filter((s): s is QuestionStep => s.kind === "question");
    if (rawQuestoes.length < 4 || rawQuestoes.length > 8) {
      issues.push({
        code: "steps-questoes-quantidade",
        message: `"${licao.id}" tem ${rawQuestoes.length} questões — precisa de 4 a 8`,
      });
    }

    if (!sintetica) {
      const rawTeach = raw.filter((s) => s.kind === "teach").length;
      if (rawTeach < 2) {
        issues.push({
          code: "steps-ensino-quantidade",
          message: `"${licao.id}" tem só ${rawTeach} passo(s) "teach" — precisa de pelo menos 2`,
        });
      }
    }

    // Isenta lição sintética: por construção ela é só intro + questões + recap
    // (docs/25 §7.4 — revisão é recuperação, não reexposição, então não há
    // "teach" pra intercalar), então 4-8 questões seguidas é o formato
    // esperado, não um desvio de qualidade.
    if (!sintetica) {
      let maiorSequencia = 0;
      let atual = 0;
      for (const step of raw) {
        atual = step.kind === "question" ? atual + 1 : 0;
        maiorSequencia = Math.max(maiorSequencia, atual);
      }
      if (maiorSequencia > 3) {
        issues.push({
          code: "steps-questoes-seguidas",
          message: `"${licao.id}" tem ${maiorSequencia} questões seguidas — o máximo é 3`,
        });
      }
    }

    let decresceu = false;
    for (let i = 1; i < rawQuestoes.length; i++) {
      if (rawQuestoes[i].difficulty < rawQuestoes[i - 1].difficulty) decresceu = true;
    }
    const primeiraDificuldade = rawQuestoes[0]?.difficulty;
    const ultimaDificuldade = rawQuestoes[rawQuestoes.length - 1]?.difficulty;
    if (decresceu || (!sintetica && primeiraDificuldade !== 1) || (ultimaDificuldade ?? 0) < 2) {
      issues.push({
        code: "steps-dificuldade",
        message: `"${licao.id}" tem dificuldade mal graduada (deve ser não decrescente${sintetica ? "" : ", começar em 1"}, terminar >= 2)`,
      });
    }

    if (!sintetica) {
      const pontuadas = scoredQuestionSteps(raw);
      if (rawQuestoes[0]?.role !== "checkpoint" || pontuadas.length < 3) {
        issues.push({
          code: "steps-checkpoint",
          message: `"${licao.id}" precisa começar com uma questão "checkpoint" e ter pelo menos 3 questões pontuadas`,
        });
      }
    }
  }

  return issues;
}

/**
 * Qualidade de exercício individual (docs/25 §18 T-04): explicação curta
 * demais, alternativa duplicada, enunciado repetido entre exercícios
 * autorais locais do catálogo (cópia-e-cola sem querer). Roda sobre TODO
 * exercício referenciado por alguma lição — resolvido uma vez cada, ainda
 * que citado em várias lições.
 */
export function validateExerciseQuality(
  licoes: MicroLesson[],
  resolveExercise: (id: string) => Exercise,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const resolvidos = new Map<string, Exercise>();

  for (const licao of licoes) {
    for (const exId of referencedExerciseIds(licao)) {
      if (resolvidos.has(exId)) continue;
      try {
        resolvidos.set(exId, resolveExercise(exId));
      } catch {
        // já reportado por `exercicio-nao-resolve` em `validateMicroLessons`.
      }
    }
  }

  for (const [exId, exercicio] of resolvidos) {
    if (exercicio.explicacao.trim().length < 20) {
      issues.push({
        code: "exercicio-explicacao-curta",
        message: `Exercício "${exId}" tem explicação com menos de 20 caracteres`,
      });
    }

    if (
      exercicio.type === "multipla-escolha" ||
      exercicio.type === "complete-lacuna" ||
      exercicio.type === "interpretacao"
    ) {
      const normalizadas = exercicio.opcoes.map((o) => o.trim().toLowerCase());
      if (duplicates(normalizadas).length > 0) {
        issues.push({
          code: "exercicio-alternativa-repetida",
          message: `Exercício "${exId}" tem duas alternativas com o mesmo texto`,
        });
      }
    }
  }

  // Enunciado duplicado só entre exercícios "locais" do catálogo (não banco
  // geral nem trilha legada) — id não casa `${lessonId}:${index}` (trilha
  // legada) nem `q<n>` (banco geral, docs/25 §5.1).
  const idTrilhaLegada = /^.+:\d+$/;
  const idBancoGeral = /^q\d+$/;
  const locais = [...resolvidos.entries()].filter(
    ([exId]) => !idTrilhaLegada.test(exId) && !idBancoGeral.test(exId),
  );
  const porEnunciado = new Map<string, string[]>();
  for (const [exId, exercicio] of locais) {
    const enunciado = enunciadoDe(exercicio);
    if (!enunciado) continue;
    const chave = enunciado.trim().toLowerCase();
    const lista = porEnunciado.get(chave) ?? [];
    lista.push(exId);
    porEnunciado.set(chave, lista);
  }
  for (const ids of porEnunciado.values()) {
    if (ids.length > 1) {
      issues.push({
        code: "catalogo-enunciado-duplicado",
        message: `Exercícios locais com o mesmo enunciado: ${ids.map((id) => `"${id}"`).join(", ")}`,
      });
    }
  }

  return issues;
}

function enunciadoDe(exercicio: Exercise): string | null {
  switch (exercicio.type) {
    case "multipla-escolha":
    case "interpretacao":
      return exercicio.pergunta;
    case "verdadeiro-falso":
      return exercicio.afirmacao;
    case "complete-lacuna":
    case "encontre-o-erro":
      return exercicio.frase;
    default:
      return null;
  }
}

/**
 * Valida a árvore de currículo (docs/25 §7.2, T-04/T-05): ids únicos em cada
 * nível, matéria conhecida, capítulo micro com pelo menos 1 lição própria,
 * capítulo legado com trilha existente, pré-requisitos de capítulo
 * existentes e acíclicos, nenhuma lição em dois capítulos, nenhuma lição do
 * catálogo fora da árvore (`licao-fora-da-arvore`). Tipo estrutural local
 * (não importa `Curriculum` de `curriculum-tree.ts`, que só nasce em T-05) —
 * compatível por forma com o real, então T-05 passa `CURRICULUM_TREE` direto.
 */
export interface CurriculumTreeChapterLike {
  id: string;
  lessonIds: string[];
  trilhaId?: string;
  prerequisiteChapterIds: string[];
}
export interface CurriculumTreeSectionLike {
  id: string;
  chapters: CurriculumTreeChapterLike[];
}
export interface CurriculumTreeSubjectLike {
  id: string;
  sections: CurriculumTreeSectionLike[];
}
export interface CurriculumTreeLike {
  subjects: CurriculumTreeSubjectLike[];
}

export function validateCurriculumTree(
  tree: CurriculumTreeLike,
  lessonIds: Set<string>,
  trilhaIds: Set<string>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const todosCapitulos = tree.subjects.flatMap((s) => s.sections.flatMap((sec) => sec.chapters));

  const subjectIdsDup = duplicates(tree.subjects.map((s) => s.id));
  for (const id of subjectIdsDup) {
    issues.push({ code: "arvore-id-duplicado", message: `Matéria duplicada na árvore: "${id}"` });
  }
  const sectionIdsDup = duplicates(tree.subjects.flatMap((s) => s.sections.map((sec) => sec.id)));
  for (const id of sectionIdsDup) {
    issues.push({ code: "arvore-id-duplicado", message: `Seção duplicada na árvore: "${id}"` });
  }
  const chapterIdsDup = duplicates(todosCapitulos.map((c) => c.id));
  for (const id of chapterIdsDup) {
    issues.push({ code: "arvore-id-duplicado", message: `Capítulo duplicado na árvore: "${id}"` });
  }

  for (const subject of tree.subjects) {
    if (!(subject.id in SUBJECT_MAP)) {
      issues.push({
        code: "arvore-materia-desconhecida",
        message: `Matéria "${subject.id}" não existe em SUBJECT_MAP`,
      });
    }
  }

  const capituloIds = new Set(todosCapitulos.map((c) => c.id));
  const licaoParaCapitulos = new Map<string, string[]>();

  for (const chapter of todosCapitulos) {
    if (chapter.trilhaId) {
      if (!trilhaIds.has(chapter.trilhaId)) {
        issues.push({
          code: "arvore-trilha-inexistente",
          message: `Capítulo "${chapter.id}" referencia a trilha "${chapter.trilhaId}", que não existe`,
        });
      }
    } else {
      if (chapter.lessonIds.length === 0) {
        issues.push({
          code: "arvore-capitulo-sem-licoes",
          message: `Capítulo "${chapter.id}" (micro) não tem nenhuma lição`,
        });
      }
      for (const lessonId of chapter.lessonIds) {
        if (!lessonIds.has(lessonId)) {
          issues.push({
            code: "arvore-licao-inexistente",
            message: `Capítulo "${chapter.id}" referencia a lição "${lessonId}", que não existe no catálogo`,
          });
        }
        const lista = licaoParaCapitulos.get(lessonId) ?? [];
        lista.push(chapter.id);
        licaoParaCapitulos.set(lessonId, lista);
      }
    }

    for (const preReqId of chapter.prerequisiteChapterIds) {
      if (!capituloIds.has(preReqId)) {
        issues.push({
          code: "arvore-prerequisito-quebrado",
          message: `Capítulo "${chapter.id}" depende de "${preReqId}", que não existe na árvore`,
        });
      }
    }
  }

  for (const [lessonId, chapters] of licaoParaCapitulos) {
    if (chapters.length > 1) {
      issues.push({
        code: "arvore-licao-duplicada",
        message: `Lição "${lessonId}" aparece em mais de um capítulo: ${chapters.join(", ")}`,
      });
    }
  }

  issues.push(...findCyclicChapterPrerequisites(todosCapitulos));

  const licoesNaArvore = new Set(licaoParaCapitulos.keys());
  for (const lessonId of lessonIds) {
    if (!licoesNaArvore.has(lessonId)) {
      issues.push({
        code: "licao-fora-da-arvore",
        message: `Lição "${lessonId}" existe no catálogo mas não aparece em nenhum capítulo da árvore`,
      });
    }
  }

  return issues;
}

function findCyclicChapterPrerequisites(chapters: CurriculumTreeChapterLike[]): ValidationIssue[] {
  const porId = new Map(chapters.map((c) => [c.id, c]));
  const issues: ValidationIssue[] = [];
  const EM_ANDAMENTO = 1;
  const CONCLUIDO = 2;
  const estado = new Map<string, typeof EM_ANDAMENTO | typeof CONCLUIDO>();

  function visitar(id: string, caminho: string[]): void {
    if (estado.get(id) === CONCLUIDO) return;
    if (estado.get(id) === EM_ANDAMENTO) {
      issues.push({
        code: "arvore-prerequisito-ciclico",
        message: `Ciclo de pré-requisito de capítulo: ${[...caminho, id].join(" -> ")}`,
      });
      return;
    }
    estado.set(id, EM_ANDAMENTO);
    const chapter = porId.get(id);
    for (const preReqId of chapter?.prerequisiteChapterIds ?? []) {
      if (porId.has(preReqId)) visitar(preReqId, [...caminho, id]);
    }
    estado.set(id, CONCLUIDO);
  }

  for (const chapter of chapters) visitar(chapter.id, []);
  return issues;
}

/** Busca em profundidade — detecta ciclo em QUALQUER tamanho de cadeia, não só autorreferência direta. */
function findCyclicPrerequisites(licoes: MicroLesson[]): ValidationIssue[] {
  const porId = new Map(licoes.map((l) => [l.id, l]));
  const issues: ValidationIssue[] = [];
  const EM_ANDAMENTO = 1;
  const CONCLUIDO = 2;
  const estado = new Map<string, typeof EM_ANDAMENTO | typeof CONCLUIDO>();

  function visitar(id: string, caminho: string[]): void {
    if (estado.get(id) === CONCLUIDO) return;
    if (estado.get(id) === EM_ANDAMENTO) {
      issues.push({
        code: "prerequisito-ciclico",
        message: `Ciclo de pré-requisito: ${[...caminho, id].join(" -> ")}`,
      });
      return;
    }
    estado.set(id, EM_ANDAMENTO);
    const licao = porId.get(id);
    for (const preReqId of licao?.prerequisiteLessonIds ?? []) {
      if (porId.has(preReqId)) visitar(preReqId, [...caminho, id]);
    }
    estado.set(id, CONCLUIDO);
  }

  for (const licao of licoes) visitar(licao.id, []);
  return issues;
}

function duplicates(items: string[]): string[] {
  const vistos = new Set<string>();
  const repetidos = new Set<string>();
  for (const item of items) {
    if (vistos.has(item)) repetidos.add(item);
    vistos.add(item);
  }
  return [...repetidos];
}

/**
 * Roda toda a validação de conteúdo e lança se algo quebrou — mesma filosofia
 * de `define.ts`: config quebrada não pode chegar silenciosa na mão do aluno.
 * Chamar uma vez na inicialização (não a cada render).
 */
export function assertContentValid(
  curriculum: CurriculumIndex,
  exerciseIds: Record<string, StableExerciseId>,
): void {
  const issues = [...validateCurriculum(curriculum), ...validateExerciseIds(exerciseIds)];
  if (issues.length > 0) {
    const detalhe = issues.map((i) => `[${i.code}] ${i.message}`).join("; ");
    throw new Error(`[learning] conteúdo inválido: ${detalhe}`);
  }
}
