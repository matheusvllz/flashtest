/**
 * Motor de Lições — builders declarativos e correção algorítmica.
 *
 * Os builders são a "função lição" do produto: quem escreve conteúdo chama
 * `defineLesson` + `multiplaEscolha()`/`encontreOErro()`/... e ganha
 * validação em tempo de desenvolvimento (config quebrada = throw na carga,
 * nunca bug silencioso na mão do aluno).
 *
 * `checkAnswer` centraliza TODA a correção: determinística, instantânea e
 * com custo zero de IA (decisão do dono, 12/07/2026).
 */

import type {
  Exercise,
  ExerciseAnswer,
  FillBlankExercise,
  FindErrorExercise,
  InterpretExercise,
  Lesson,
  MatchPairsExercise,
  MultipleChoiceExercise,
  ReorderExercise,
  TrueFalseExercise,
} from "./types";

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`[lessons] lição mal definida: ${msg}`);
}

function assertChoice(opcoes: string[], correta: number, where: string): void {
  assert(opcoes.length >= 2, `${where}: precisa de pelo menos 2 opções`);
  assert(
    Number.isInteger(correta) && correta >= 0 && correta < opcoes.length,
    `${where}: índice da correta (${correta}) fora das opções`,
  );
}

export function multiplaEscolha(ex: Omit<MultipleChoiceExercise, "type">): MultipleChoiceExercise {
  assertChoice(ex.opcoes, ex.correta, `múltipla escolha "${ex.pergunta.slice(0, 40)}"`);
  return { type: "multipla-escolha", ...ex };
}

export function encontreOErro(ex: Omit<FindErrorExercise, "type">): FindErrorExercise {
  const palavras = ex.frase.trim().split(/\s+/);
  assert(palavras.length >= 3, `encontre o erro "${ex.frase.slice(0, 40)}": frase curta demais`);
  assert(
    Number.isInteger(ex.erroIndex) && ex.erroIndex >= 0 && ex.erroIndex < palavras.length,
    `encontre o erro "${ex.frase.slice(0, 40)}": erroIndex (${ex.erroIndex}) fora da frase`,
  );
  return { type: "encontre-o-erro", ...ex };
}

export function completeLacuna(ex: Omit<FillBlankExercise, "type">): FillBlankExercise {
  // Exatamente UMA lacuna: com duas o componente perde o fim da frase
  // (erro real de um autor-IA pego no teste de 12/07).
  assert(
    ex.frase.split("___").length === 2,
    `complete a lacuna "${ex.frase.slice(0, 40)}": use o marcador ___ exatamente UMA vez`,
  );
  assertChoice(ex.opcoes, ex.correta, `complete a lacuna "${ex.frase.slice(0, 40)}"`);
  return { type: "complete-lacuna", ...ex };
}

export function ordenar(ex: Omit<ReorderExercise, "type">): ReorderExercise {
  assert(ex.blocos.length >= 2, `ordenar: precisa de pelo menos 2 blocos`);
  return { type: "ordenar", ...ex };
}

export function interpretacao(ex: Omit<InterpretExercise, "type">): InterpretExercise {
  assert(ex.texto.trim().length >= 40, `interpretação: texto de apoio curto demais`);
  assertChoice(ex.opcoes, ex.correta, `interpretação "${ex.pergunta.slice(0, 40)}"`);
  return { type: "interpretacao", ...ex };
}

export function parear(ex: Omit<MatchPairsExercise, "type">): MatchPairsExercise {
  assert(ex.pares.length >= 2 && ex.pares.length <= 5, `parear: use de 2 a 5 pares`);
  const bs = ex.pares.map((p) => p.b);
  assert(new Set(bs).size === bs.length, `parear: itens da coluna B precisam ser únicos`);
  return { type: "parear", ...ex };
}

export function verdadeiroFalso(ex: Omit<TrueFalseExercise, "type">): TrueFalseExercise {
  assert(ex.afirmacao.trim().length >= 10, `verdadeiro-falso: afirmação curta demais`);
  return { type: "verdadeiro-falso", ...ex };
}

export function defineLesson(lesson: Lesson): Lesson {
  assert(lesson.id.trim().length > 0, "lição sem id");
  assert(lesson.titulo.trim().length > 0, `lição "${lesson.id}" sem título`);
  assert(lesson.exercicios.length >= 1, `lição "${lesson.id}" sem exercícios`);
  // Imagem de apoio: alt obrigatório (acessibilidade) e URL https.
  for (const ex of lesson.exercicios) {
    if (ex.imagem) {
      assert(
        ex.imagem.alt.trim().length >= 5,
        `lição "${lesson.id}": imagem sem alt descritivo (obrigatório)`,
      );
      assert(
        ex.imagem.url.startsWith("https://"),
        `lição "${lesson.id}": URL de imagem precisa ser https`,
      );
    }
  }
  return lesson;
}

/**
 * Corrige a resposta do aluno. Para 'ordenar' e 'parear', a resposta usa
 * índices da ORDEM EXIBIDA (embaralhada) e a comparação é pelo CONTEÚDO,
 * então itens duplicados não geram injustiça (ver docs/motor-de-licoes.md).
 */
export function checkAnswer(
  exercise: Exercise,
  answer: ExerciseAnswer,
  /** Ordem em que os blocos ('ordenar') ou a coluna B ('parear') foram exibidos. */
  shownBlocks?: string[],
): boolean {
  switch (exercise.type) {
    case "multipla-escolha":
    case "complete-lacuna":
    case "interpretacao":
      return answer === exercise.correta;
    case "encontre-o-erro":
      return answer === exercise.erroIndex;
    case "verdadeiro-falso":
      return (answer === 1) === exercise.verdadeiro;
    case "ordenar": {
      if (!Array.isArray(answer) || !shownBlocks) return false;
      if (answer.length !== exercise.blocos.length) return false;
      return answer.every((shownIdx, pos) => shownBlocks[shownIdx] === exercise.blocos[pos]);
    }
    case "parear": {
      if (!Array.isArray(answer) || !shownBlocks) return false;
      if (answer.length !== exercise.pares.length) return false;
      return answer.every((shownIdx, i) => shownBlocks[shownIdx] === exercise.pares[i].b);
    }
  }
}

/** Embaralhamento simples (Fisher-Yates) usado pelo player no tipo 'ordenar'. */
export function shuffled<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
