/**
 * Motor de Lições — tipos.
 *
 * Lição é DADO declarativo, motor é código: todo o if/else de interação vive
 * UMA vez nos componentes do player; o conteúdo (`src/content/trilhas/`) só
 * descreve exercícios nestes formatos. Tipo de questão novo = estender a
 * union + registrar 1 componente no registry.
 *
 * Origem: motor do app de redação (SDD 12, D3). Portado para a Foca com
 * o design system oficial e SEM os mascotes do app de origem — quem explica é
 * a própria Foca, mascote e tutor do app (docs/15).
 */

export type ExamProfile = "enem";

/** Imagem de apoio de um exercício (charge, tirinha, infográfico, gráfico). */
export interface ExerciseImage {
  url: string;
  /** Descrição acessível OBRIGATÓRIA (leitores de tela e fallback). */
  alt: string;
  /** Fonte/autoria, exibida abaixo da imagem (ex: "ENEM 2019"). */
  credito?: string;
  /**
   * Dimensões intrínsecas em px (spec 50 §5.9.3): reservam o espaço antes de a imagem chegar, sem pulo de
   * layout. Obrigatórias em item oficial (validador).
   */
  largura?: number;
  altura?: number;
  /** Descrição longa ("Ver descrição"), para gráfico, mapa e imagem com texto. Nunca entrega a resposta. */
  descricao?: string;
  /** `true` quando `alt`/`descricao` foram gerados pelo pipeline e ainda não foram revistos. */
  altAutomatico?: boolean;
}

/**
 * Tabela de apoio com texto extraível (spec 50 §5.9.3): desenhada como `<table>` com `<caption>`, cabeçalho e
 * rolagem horizontal. `linhas[i]` tem o mesmo número de células que `cabecalho`.
 */
export interface ExerciseTable {
  legenda?: string;
  cabecalho: string[];
  linhas: string[][];
}

/**
 * Base comum: toda questão explica a resposta. Estática, zero IA.
 *
 * Posição de imagens e tabelas (spec 50 §5.9.3): `pergunta` e/ou `texto` podem ter, em linha própria, os
 * marcadores `[[imagem:N]]` e `[[tabela:N]]` (N = índice em `imagens`/`tabelas`), que marcam a posição no
 * original. Imagem ou tabela sem marcador é desenhada acima do enunciado.
 */
interface ExerciseBase {
  /** Mostrada na barra de feedback após verificar (acerto ou erro). */
  explicacao: string;
  /** Imagem de apoio opcional, renderizada pelo player acima do enunciado. Mantida por compatibilidade. */
  imagem?: ExerciseImage;
  /** Imagens do enunciado, na ordem do original (spec 50 §5.9.3). */
  imagens?: ExerciseImage[];
  /** Tabelas do enunciado, na ordem do original. */
  tabelas?: ExerciseTable[];
  /**
   * Atribuição exibida abaixo do enunciado (docs/30 §12.4/§18.4, Fase 10
   * F10.5) — item oficial do ENEM sempre grava `"ENEM <ano>"` aqui, nunca
   * opcional pra esse caso (requisito não-negociável, `docs/34`). Também
   * serve pra fonte de um texto de apoio (uso original, `InterpretExercise`).
   */
  fonte?: string;
}

export interface MultipleChoiceExercise extends ExerciseBase {
  type: "multipla-escolha";
  pergunta: string;
  opcoes: string[];
  /** Índice da opção correta em `opcoes`. */
  correta: number;
  /**
   * Alternativas que são imagem (spec 50 §5.9.3): mesmo tamanho de `opcoes`, `null` onde a alternativa é só
   * texto. Alternativa só-imagem tem `opcoes[i]` = "Alternativa X (imagem)", lido por leitores de tela.
   */
  opcoesImagem?: (ExerciseImage | null)[];
}

export interface FindErrorExercise extends ExerciseBase {
  type: "encontre-o-erro";
  /** Default: "Toque na palavra com problema". */
  instrucao?: string;
  /** Frase exibida palavra a palavra (split por espaço). */
  frase: string;
  /** Índice (base 0) da palavra errada na frase tokenizada. */
  erroIndex: number;
}

export interface FillBlankExercise extends ExerciseBase {
  type: "complete-lacuna";
  /** Frase com `___` marcando a lacuna única. */
  frase: string;
  opcoes: string[];
  correta: number;
}

export interface ReorderExercise extends ExerciseBase {
  type: "ordenar";
  /** Default: "Toque nos blocos para montar a frase na ordem certa". */
  instrucao?: string;
  /** Blocos NA ORDEM CORRETA; o player embaralha na exibição. */
  blocos: string[];
}

export interface InterpretExercise extends ExerciseBase {
  type: "interpretacao";
  /** Texto de apoio curto (nível ENEM). */
  texto: string;
  pergunta: string;
  opcoes: string[];
  correta: number;
}

export interface MatchPairsExercise extends ExerciseBase {
  type: "parear";
  /** Default: "Toque num item da esquerda e no par dele na direita". */
  instrucao?: string;
  /** Pares corretos; a coluna B é embaralhada pelo player na exibição. */
  pares: Array<{ a: string; b: string }>;
}

export interface TrueFalseExercise extends ExerciseBase {
  type: "verdadeiro-falso";
  afirmacao: string;
  verdadeiro: boolean;
}

export type Exercise =
  | MultipleChoiceExercise
  | FindErrorExercise
  | FillBlankExercise
  | ReorderExercise
  | InterpretExercise
  | MatchPairsExercise
  | TrueFalseExercise;

export type ExerciseType = Exercise["type"];

/**
 * Tipo `escrita` (spec 50 §5.10.1, R-ESC-9): resposta aberta, **sem gabarito e sem nota automática**. Fica fora da
 * união `Exercise` de propósito: o player de lição corrige por gabarito (`checkAnswer`) e este tipo não tem o que
 * corrigir. Quem o mostra é a tela da tarefa (`/redacao/escreva/$tarefaId`); quem o valida é
 * `validarTarefaDeEscrita` (`src/lib/escrita.ts`).
 */
export interface WritingExercise {
  type: "escrita";
  /** O pedido, em uma ou duas frases ("Escreva a introdução…"). */
  enunciado: string;
  /** Tema de treino (de `TEMAS_DE_TREINO`): nunca tema oficial nem previsão de prova. */
  tema: string;
  /** Como fazer, passo a passo curto. */
  instrucao: string;
  /** Trecho dado para completar ou reescrever (conteúdo autoral do Foca). */
  textoDeApoio?: { rotulo: string; texto: string };
  /** Limites de tamanho em caracteres (trecho 20–1.500; texto completo 400–5.000). */
  limites: { min: number; max: number };
}

/** Texto-modelo comentado, mostrado só depois de enviar (autoral). */
export interface WritingModel {
  texto: string;
  /** Comentários curtos: o que o modelo faz e por que funciona. */
  comentarios: string[];
}

/** Nó "Escreva" de uma trilha de redação (spec 50 §5.10.1). */
export interface WritingTask {
  /** `[a-z0-9-]`, estável: vira chave de XP (`escrita:<id>`) e de rascunho. */
  id: string;
  trilhaId: "redacao-estrutura" | "redacao-argumentacao" | "redacao-competencias";
  /** Lição depois da qual o nó aparece (e que o destrava). */
  depoisDe: string;
  titulo: string;
  modo: "trecho" | "completo";
  /** Liga a checagem dos 5 elementos da proposta num trecho (conclusão). O texto completo sempre checa. */
  checaProposta?: boolean;
  /** Todo texto dado, modelo e tema destas tarefas foi escrito pelo Foca (rótulo na tela). */
  autoria: "foca";
  exercicio: WritingExercise;
  modelo: WritingModel;
}

/**
 * Resposta do aluno, por tipo:
 * - índice único: escolha/lacuna/erro/interpretação (e 1|0 no verdadeiro-falso);
 * - sequência de índices exibidos: ordenar (ordem montada) e parear
 *   (posição i = índice na coluna B embaralhada pareado com o item A[i]).
 */
export type ExerciseAnswer = number | number[];

export interface Lesson {
  id: string;
  titulo: string;
  /** Chamada curta exibida no mapa da trilha. */
  descricao?: string;
  exercicios: Exercise[];
}

/**
 * Bloco temático da trilha. `eixo` separa o que é redação pura do que é a
 * base de língua portuguesa que sustenta a nota — o mapa agrupa por isso.
 */
export interface Trilha {
  id: string;
  nome: string;
  descricao: string;
  eixo: "redacao" | "base";
  examProfile: ExamProfile;
  /** Ordem do array = ordem de desbloqueio. */
  licoes: Lesson[];
}

/** Progresso de uma lição concluída. */
export interface LessonProgress {
  lessonId: string;
  /** 1-3, pelo melhor desempenho já alcançado. */
  stars: 1 | 2 | 3;
  /** Melhor % de acerto (0-100). */
  bestPct: number;
  completedAt: string;
}
