import { describe, expect, test } from "bun:test";
import {
  validateCurriculumTree,
  validateExerciseQuality,
  validateLessonSteps,
  validateMicroLessons,
  type CurriculumTreeLike,
} from "@/lib/learning/validate";
import type { Exercise, MultipleChoiceExercise } from "@/lib/lessons/types";
import type { LessonStep, MicroLesson, MicroLessonV1, MicroLessonV2, QuestionStep } from "@/lib/learning/types";

/**
 * Testes de validação v2 (docs/25 §18 T-04) — um fixture v2 mínimo e válido,
 * mais uma mutação negativa por regra nova da tabela do T-04. As regras
 * "existentes" (licao-id-duplicado, licao-sem-skill, prerequisito-quebrado,
 * prerequisito-ciclico, exercicio-nao-resolve) já têm cobertura extensa em
 * `learning-node-state.test.ts`/`microlicoes.test.ts`; aqui só confirmamos
 * que continuam disparando com a assinatura nova de 3 parâmetros.
 */

const CHAPTER_IDS = new Set(["cap-x"]);

function mc(id: string, opcoes = ["A", "B", "C"]): MultipleChoiceExercise {
  return {
    type: "multipla-escolha",
    pergunta: `Pergunta do exercício ${id}?`,
    opcoes,
    correta: 0,
    explicacao: `Explicação suficientemente longa para o exercício ${id}.`,
  };
}

function exerciseMapFixture(): Record<string, Exercise> {
  return {
    chk1: mc("chk1"),
    p1: mc("p1"),
    p2: mc("p2"),
    d1: mc("d1"),
    rev1: mc("rev1"),
    rev2: mc("rev2"),
  };
}

function resolverFrom(mapa: Record<string, Exercise>): (id: string) => Exercise {
  return (id: string) => {
    const ex = mapa[id];
    if (!ex) throw new Error(`não existe: ${id}`);
    return ex;
  };
}

function validSteps(): LessonStep[] {
  return [
    { kind: "intro", title: "Título", body: "Objetivo da lição." },
    { kind: "teach", block: { type: "concept", title: "Conceito", body: "Corpo do conceito." } },
    { kind: "question", exerciseId: "chk1", role: "checkpoint", difficulty: 1 },
    { kind: "teach", block: { type: "concept", title: "Conceito 2", body: "Outro corpo." } },
    { kind: "question", exerciseId: "p1", role: "pratica", difficulty: 2 },
    { kind: "question", exerciseId: "p2", role: "pratica", difficulty: 2 },
    { kind: "question", exerciseId: "d1", role: "desafio", difficulty: 3 },
    { kind: "recap", body: "Recap da lição." },
  ];
}

function v2Fixture(overrides: Partial<MicroLessonV2> = {}): MicroLessonV2 {
  return {
    id: "l-v2",
    version: 1,
    subjectId: "mat",
    topicId: "porc",
    chapterId: "cap-x",
    title: "Título",
    objective: "Objetivo da lição.",
    skillIds: ["mat:x"],
    prerequisiteLessonIds: [],
    examProfileIds: ["enem"],
    status: "reviewed",
    estimatedTeachingSeconds: 60,
    estimatedPracticeSeconds: 90,
    format: 2,
    steps: validSteps(),
    reviewExerciseIds: ["rev1", "rev2"],
    recap: "Recap da lição.",
    sources: ["fonte"],
    reviewedAt: "2026-09-21",
    ...overrides,
  };
}

function v1Fixture(overrides: Partial<MicroLessonV1> = {}): MicroLessonV1 {
  return {
    id: "l-v1",
    version: 1,
    subjectId: "mat",
    topicId: "porc",
    chapterId: "cap-x",
    title: "Título v1",
    objective: "Objetivo v1.",
    skillIds: ["mat:x"],
    prerequisiteLessonIds: [],
    examProfileIds: ["enem"],
    status: "reviewed",
    estimatedTeachingSeconds: 45,
    estimatedPracticeSeconds: 60,
    blocks: [{ type: "concept", title: "Conceito", body: "Corpo curto." }],
    checkpointExerciseId: "chk1",
    practiceExerciseIds: ["p1", "p2"],
    reviewExerciseIds: ["rev1", "rev2"],
    recap: "Recap v1.",
    sources: ["fonte"],
    reviewedAt: "2026-09-21",
    ...overrides,
  };
}

describe("validateMicroLessons — fixture v2 mínimo válido", () => {
  test("não gera nenhum issue", () => {
    const mapa = exerciseMapFixture();
    const issues = validateMicroLessons([v2Fixture()], resolverFrom(mapa), CHAPTER_IDS);
    expect(issues).toEqual([]);
  });

  test("fixture v1 mínimo também não gera nenhum issue", () => {
    const mapa = exerciseMapFixture();
    const issues = validateMicroLessons([v1Fixture()], resolverFrom(mapa), CHAPTER_IDS);
    expect(issues).toEqual([]);
  });
});

describe("validateMicroLessons — regras estruturais novas", () => {
  test("licao-capitulo-inexistente: chapterId fora da árvore", () => {
    const mapa = exerciseMapFixture();
    const licao = v2Fixture({ chapterId: "nao-existe" });
    const issues = validateMicroLessons([licao], resolverFrom(mapa), CHAPTER_IDS);
    expect(issues.some((i) => i.code === "licao-capitulo-inexistente")).toBe(true);
  });

  test("licao-revisao-invalida: lição autoral com reviewExerciseIds != 2", () => {
    const mapa = exerciseMapFixture();
    const licao = v2Fixture({ reviewExerciseIds: ["rev1"] });
    const issues = validateMicroLessons([licao], resolverFrom(mapa), CHAPTER_IDS);
    expect(issues.some((i) => i.code === "licao-revisao-invalida")).toBe(true);
  });

  test("licao-revisao-invalida: lição sintética (revisao--) com reviewExerciseIds != 0", () => {
    const mapa = exerciseMapFixture();
    const licao = v2Fixture({ id: "revisao--cap-x", reviewExerciseIds: ["rev1", "rev2"] });
    const issues = validateMicroLessons([licao], resolverFrom(mapa), CHAPTER_IDS);
    expect(issues.some((i) => i.code === "licao-revisao-invalida")).toBe(true);
  });

  test("licao-pratica-invalida: só se aplica a v1, com practiceExerciseIds != 2", () => {
    const mapa = exerciseMapFixture();
    const licao = v1Fixture({ practiceExerciseIds: ["p1"] });
    const issues = validateMicroLessons([licao], resolverFrom(mapa), CHAPTER_IDS);
    expect(issues.some((i) => i.code === "licao-pratica-invalida")).toBe(true);
  });

  test("exercicio-nao-resolve: referência quebrada (v2, questão com id inexistente)", () => {
    const mapa = exerciseMapFixture();
    const steps = validSteps();
    (steps[4] as QuestionStep).exerciseId = "nao-existe-em-lugar-nenhum";
    const licao = v2Fixture({ steps });
    const issues = validateMicroLessons([licao], resolverFrom(mapa), CHAPTER_IDS);
    expect(issues.some((i) => i.code === "exercicio-nao-resolve")).toBe(true);
  });

  test("prerequisito-quebrado e licao-id-duplicado continuam funcionando com a assinatura nova", () => {
    const mapa = exerciseMapFixture();
    const a = v2Fixture({ id: "dup", prerequisiteLessonIds: ["fantasma"] });
    const b = v2Fixture({ id: "dup" });
    const issues = validateMicroLessons([a, b], resolverFrom(mapa), CHAPTER_IDS);
    expect(issues.some((i) => i.code === "licao-id-duplicado")).toBe(true);
    expect(issues.some((i) => i.code === "prerequisito-quebrado")).toBe(true);
  });

  test("prerequisito-ciclico: duas lições dependendo uma da outra", () => {
    const mapa = exerciseMapFixture();
    const a = v2Fixture({ id: "a", prerequisiteLessonIds: ["b"] });
    const b = v2Fixture({ id: "b", prerequisiteLessonIds: ["a"] });
    const issues = validateMicroLessons([a, b], resolverFrom(mapa), CHAPTER_IDS);
    expect(issues.some((i) => i.code === "prerequisito-ciclico")).toBe(true);
  });
});

describe("validateLessonSteps — regras de composição v2", () => {
  test("steps-intro-recap: falta intro no início", () => {
    const steps = validSteps().slice(1); // remove a intro
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-intro-recap")).toBe(true);
  });

  test("steps-intro-recap: duas intros", () => {
    const steps = validSteps();
    steps.unshift({ kind: "intro", title: "Outra", body: "Outra intro." });
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-intro-recap")).toBe(true);
  });

  test("steps-primeiro-ensino: steps[1] não é teach (lição autoral)", () => {
    const steps = validSteps();
    steps[1] = { kind: "tip", body: "Uma dica." };
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-primeiro-ensino")).toBe(true);
  });

  test("steps-primeiro-ensino: revisão sintética é isenta mesmo sem teach em steps[1]", () => {
    const steps: LessonStep[] = [
      { kind: "intro", title: "Revisão", body: "Objetivo." },
      { kind: "question", exerciseId: "chk1", role: "revisao", difficulty: 2 },
      { kind: "question", exerciseId: "p1", role: "revisao", difficulty: 2 },
      { kind: "question", exerciseId: "p2", role: "revisao", difficulty: 2 },
      { kind: "question", exerciseId: "d1", role: "revisao", difficulty: 2 },
      { kind: "recap", body: "Fim." },
    ];
    const mapa = exerciseMapFixture();
    const licao = v2Fixture({ id: "revisao--cap-x", steps, reviewExerciseIds: [] });
    const issues = validateMicroLessons([licao], resolverFrom(mapa), CHAPTER_IDS);
    expect(issues.some((i) => i.code === "steps-primeiro-ensino")).toBe(false);
  });

  test("steps-questoes-quantidade: menos de 4 questões", () => {
    const steps = validSteps().filter(
      (s, i) => !(s.kind === "question" && i === 6), // remove a questão "d1"
    );
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-questoes-quantidade")).toBe(true);
  });

  test("steps-questoes-quantidade: mais de 8 questões", () => {
    const extra: QuestionStep[] = Array.from({ length: 6 }, (_, i) => ({
      kind: "question",
      exerciseId: "p1",
      role: "pratica",
      difficulty: 2,
    }));
    const steps = [...validSteps(), ...extra, { kind: "recap", body: "Fim." } as LessonStep];
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-questoes-quantidade")).toBe(true);
  });

  test("steps-ensino-quantidade: menos de 2 passos teach (lição autoral)", () => {
    const steps = validSteps().filter((s, i) => !(s.kind === "teach" && i === 3));
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-ensino-quantidade")).toBe(true);
  });

  test("steps-questoes-seguidas: mais de 3 questões seguidas", () => {
    const steps: LessonStep[] = [
      { kind: "intro", title: "T", body: "B" },
      { kind: "teach", block: { type: "concept", title: "C", body: "B" } },
      { kind: "teach", block: { type: "concept", title: "C2", body: "B2" } },
      { kind: "question", exerciseId: "chk1", role: "checkpoint", difficulty: 1 },
      { kind: "question", exerciseId: "p1", role: "pratica", difficulty: 2 },
      { kind: "question", exerciseId: "p2", role: "pratica", difficulty: 2 },
      { kind: "question", exerciseId: "d1", role: "desafio", difficulty: 3 },
      { kind: "recap", body: "Fim." },
    ];
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-questoes-seguidas")).toBe(true);
  });

  test("steps-dificuldade: dificuldade decresce entre duas questões consecutivas", () => {
    const steps = validSteps();
    (steps[4] as QuestionStep).difficulty = 3;
    (steps[5] as QuestionStep).difficulty = 1;
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-dificuldade")).toBe(true);
  });

  test("steps-dificuldade: primeira questão autoral não começa em 1", () => {
    const steps = validSteps();
    (steps[2] as QuestionStep).difficulty = 2;
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-dificuldade")).toBe(true);
  });

  test("steps-dificuldade: última questão com dificuldade < 2", () => {
    const steps = validSteps();
    (steps[6] as QuestionStep).difficulty = 1;
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-dificuldade")).toBe(true);
  });

  test("steps-checkpoint: primeira questão autoral não é checkpoint", () => {
    const steps = validSteps();
    (steps[2] as QuestionStep).role = "pratica";
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-checkpoint")).toBe(true);
  });

  test("steps-checkpoint: menos de 3 questões pontuadas", () => {
    const steps = validSteps();
    (steps[4] as QuestionStep).role = "checkpoint";
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-checkpoint")).toBe(true);
  });

  test("steps-exercicio-repetido: mesmo exerciseId em duas questões", () => {
    const steps = validSteps();
    (steps[5] as QuestionStep).exerciseId = "p1"; // repete o id de steps[4]
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-exercicio-repetido")).toBe(true);
  });

  test("steps-exercicio-repetido: id de questão também aparece em reviewExerciseIds", () => {
    const issues = validateLessonSteps([v2Fixture({ reviewExerciseIds: ["p1", "rev2"] })]);
    expect(issues.some((i) => i.code === "steps-exercicio-repetido")).toBe(true);
  });

  test("steps-palavras-ensino (v2): acima de 220 palavras somadas de ensino", () => {
    const palavraLonga = Array.from({ length: 250 }, () => "palavra").join(" ");
    const steps = validSteps();
    steps[1] = { kind: "teach", block: { type: "concept", title: "C", body: palavraLonga } };
    const issues = validateLessonSteps([v2Fixture({ steps })]);
    expect(issues.some((i) => i.code === "steps-palavras-ensino")).toBe(true);
  });

  test("steps-palavras-ensino (v1): acima de 100 palavras nos blocks", () => {
    const palavraLonga = Array.from({ length: 150 }, () => "palavra").join(" ");
    const licao = v1Fixture({
      blocks: [{ type: "concept", title: "C", body: palavraLonga }],
    });
    const issues = validateLessonSteps([licao]);
    expect(issues.some((i) => i.code === "steps-palavras-ensino")).toBe(true);
  });
});

describe("validateExerciseQuality", () => {
  test("exercicio-explicacao-curta: explicação com menos de 20 caracteres", () => {
    const mapa = exerciseMapFixture();
    mapa.chk1 = { ...mc("chk1"), explicacao: "curta" };
    const issues = validateExerciseQuality([v2Fixture()], resolverFrom(mapa));
    expect(issues.some((i) => i.code === "exercicio-explicacao-curta")).toBe(true);
  });

  test("exercicio-alternativa-repetida: duas alternativas com o mesmo texto normalizado", () => {
    const mapa = exerciseMapFixture();
    mapa.chk1 = mc("chk1", ["Igual", "  igual  ", "Diferente"]);
    const issues = validateExerciseQuality([v2Fixture()], resolverFrom(mapa));
    expect(issues.some((i) => i.code === "exercicio-alternativa-repetida")).toBe(true);
  });

  test("catalogo-enunciado-duplicado: dois ids locais distintos com o mesmo enunciado normalizado", () => {
    const mapa = exerciseMapFixture();
    mapa.p2 = { ...mc("p2"), pergunta: mapa.p1 && (mapa.p1 as MultipleChoiceExercise).pergunta };
    // força o mesmo enunciado (com variação de espaço/maiúscula) em dois ids locais
    (mapa.p1 as MultipleChoiceExercise).pergunta = "Mesma pergunta?";
    (mapa.p2 as MultipleChoiceExercise).pergunta = "  MESMA pergunta? ";
    const issues = validateExerciseQuality([v2Fixture()], resolverFrom(mapa));
    expect(issues.some((i) => i.code === "catalogo-enunciado-duplicado")).toBe(true);
  });

  test("enunciado repetido entre um id local e um id de trilha legada (lessonId:index) não conta", () => {
    const mapa = exerciseMapFixture();
    (mapa.p1 as MultipleChoiceExercise).pergunta = "Pergunta única.";
    const licao = v2Fixture({
      steps: validSteps().map((s) =>
        s.kind === "question" && s.exerciseId === "d1" ? { ...s, exerciseId: "trilha-x:0" } : s,
      ),
    });
    const mapaComTrilha: Record<string, Exercise> = {
      ...mapa,
      "trilha-x:0": { ...mc("trilha-x-0"), pergunta: "Pergunta única." },
    };
    const issues = validateExerciseQuality([licao], resolverFrom(mapaComTrilha));
    expect(issues.some((i) => i.code === "catalogo-enunciado-duplicado")).toBe(false);
  });
});

describe("validateCurriculumTree", () => {
  function treeFixture(overrides: Partial<CurriculumTreeLike> = {}): CurriculumTreeLike {
    return {
      subjects: [
        {
          id: "mat",
          sections: [
            {
              id: "sec-1",
              chapters: [
                { id: "cap-1", lessonIds: ["l1", "l2"], prerequisiteChapterIds: [] },
                { id: "cap-legado", lessonIds: [], trilhaId: "trilha-1", prerequisiteChapterIds: [] },
              ],
            },
          ],
        },
      ],
      ...overrides,
    };
  }

  const LESSON_IDS = new Set(["l1", "l2"]);
  const TRILHA_IDS = new Set(["trilha-1"]);

  test("árvore válida não gera nenhum issue", () => {
    const issues = validateCurriculumTree(treeFixture(), LESSON_IDS, TRILHA_IDS);
    expect(issues).toEqual([]);
  });

  test("arvore-materia-desconhecida: subject.id fora de SUBJECT_MAP", () => {
    const tree = treeFixture({
      subjects: [{ id: "nao-existe", sections: [] }],
    });
    const issues = validateCurriculumTree(tree, new Set(), new Set());
    expect(issues.some((i) => i.code === "arvore-materia-desconhecida")).toBe(true);
  });

  test("arvore-capitulo-sem-licoes: capítulo micro sem nenhuma lição", () => {
    const tree = treeFixture();
    tree.subjects[0].sections[0].chapters[0].lessonIds = [];
    const issues = validateCurriculumTree(tree, LESSON_IDS, TRILHA_IDS);
    expect(issues.some((i) => i.code === "arvore-capitulo-sem-licoes")).toBe(true);
  });

  test("arvore-licao-inexistente: chapter.lessonIds referencia lição fora do catálogo", () => {
    const issues = validateCurriculumTree(treeFixture(), new Set(["l1"]), TRILHA_IDS);
    expect(issues.some((i) => i.code === "arvore-licao-inexistente")).toBe(true);
  });

  test("arvore-trilha-inexistente: capítulo legado com trilhaId desconhecido", () => {
    const issues = validateCurriculumTree(treeFixture(), LESSON_IDS, new Set());
    expect(issues.some((i) => i.code === "arvore-trilha-inexistente")).toBe(true);
  });

  test("arvore-licao-duplicada: mesma lição em dois capítulos", () => {
    const tree = treeFixture();
    tree.subjects[0].sections[0].chapters.push({
      id: "cap-2",
      lessonIds: ["l1"],
      prerequisiteChapterIds: [],
    });
    const issues = validateCurriculumTree(tree, LESSON_IDS, TRILHA_IDS);
    expect(issues.some((i) => i.code === "arvore-licao-duplicada")).toBe(true);
  });

  test("arvore-prerequisito-quebrado / arvore-prerequisito-ciclico", () => {
    const quebrado = treeFixture();
    quebrado.subjects[0].sections[0].chapters[0].prerequisiteChapterIds = ["fantasma"];
    expect(
      validateCurriculumTree(quebrado, LESSON_IDS, TRILHA_IDS).some(
        (i) => i.code === "arvore-prerequisito-quebrado",
      ),
    ).toBe(true);

    const ciclico = treeFixture();
    ciclico.subjects[0].sections[0].chapters[0].prerequisiteChapterIds = ["cap-legado"];
    ciclico.subjects[0].sections[0].chapters[1].prerequisiteChapterIds = ["cap-1"];
    expect(
      validateCurriculumTree(ciclico, LESSON_IDS, TRILHA_IDS).some(
        (i) => i.code === "arvore-prerequisito-ciclico",
      ),
    ).toBe(true);
  });

  test("licao-fora-da-arvore: lição do catálogo que não aparece em nenhum capítulo", () => {
    const issues = validateCurriculumTree(treeFixture(), new Set(["l1", "l2", "l3-orfa"]), TRILHA_IDS);
    expect(issues.some((i) => i.code === "licao-fora-da-arvore")).toBe(true);
  });
});
