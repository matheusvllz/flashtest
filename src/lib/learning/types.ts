/**
 * Tipos do schema de aprendizado (docs/20 §15.2, Fase 5). Contratos aditivos
 * sobre `foca.state.v3` (schemaVersion 4) — nenhum campo daqui é lido/escrito
 * fora de `state-migrations.ts` e do que a própria Fase 5 usa (`exercise-ids`,
 * `adapters`, `selectors`). Campos como `reviewSchedule`, `rewardLedger` e
 * `tipHistory` têm o FORMATO definido agora para não exigir outra migração
 * de schema quando as Fases 7/8/11 (que os consomem de verdade) chegarem —
 * mas nenhuma lógica de agendamento/ledger/dica roda ainda; são apenas
 * contêineres vazios até lá.
 */

/** Perfil de vestibular (Fase 8) — schema aditivo desde já, sem UI própria ainda. */
export interface ExamTarget {
  examId: string;
  stage?: string;
  cycle?: string;
  examDate?: string; // ISO
}

export type AttemptRole =
  | "diagnostico"
  | "checkpoint"
  | "pratica"
  | "revisao"
  | "desafio"
  | "simulado";

/** Uma resposta registrada — docs/20 §15.2. `sessionId` é `null` para tentativas fora de uma sessão persistida (ex.: aula geral, hoje). */
export interface Attempt {
  id: string;
  sessionId: string | null;
  exerciseId: string;
  exerciseVersion: number;
  subjectId?: string;
  topicId?: string;
  skillIds: string[];
  role: AttemptRole;
  /** Serializável — pode ser índice (number), texto ou array, conforme o tipo de exercício. */
  answer: unknown;
  presentedOrder?: string[];
  correct: boolean;
  hintUsed: boolean;
  tutorUsed: boolean;
  firstSubmission: boolean;
  submittedAt: string; // ISO
  localDate: string; // YYYY-MM-DD local, nunca UTC
  durationMs: number;
}

export type LearningSessionKind = "aula-geral" | "licao-redacao" | "microlicao" | "revisao";

export interface LearningSession {
  id: string;
  contentId: string;
  contentVersion: number;
  kind: LearningSessionKind;
  /** Fase pedagógica atual — só populada quando `kind === "microlicao"` (Fase 6). */
  stage: LessonStage;
  blockIndex: number;
  exerciseIndex: number;
  exerciseIds: string[];
  answers: Record<string, unknown>;
  presentedOrders: Record<string, string[]>;
  /**
   * Índice em `stepsOf(lesson)` (docs/25 §7.1/§7.3, Fase 1) — `answers`/
   * `presentedOrders` passam a ser chaveados por `String(stepIndex)` a partir
   * do motor orientado a passos (T-08). Campo só de tipo nesta tarefa: nada
   * ainda lê/escreve com essa chave.
   */
  stepIndex: number;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
}

/** Evidência de consistência por habilidade (docs/20 §13, critério A10) — vazio até a Fase 7 popular. */
export interface SkillEvidenceEntry {
  skillId: string;
  distinctExerciseIds: string[];
  distinctLocalDates: string[];
  /** Mais recente por último — no máximo os 5 últimos itens elegíveis. */
  lastFiveCorrect: boolean[];
  hasReviewCorrectAfter24h: boolean;
}

/** Agenda de revisão 1/3/7/14 dias (docs/20 §13) — vazio até a Fase 7 popular. */
export interface ReviewScheduleEntry {
  skillId: string;
  intervalDays: 1 | 3 | 7 | 14;
  dueDate: string; // YYYY-MM-DD
  lastResult: "correct" | "incorrect" | null;
}

/** Chave de idempotência de recompensa (docs/20 §12/§14.2) — vazio até a Fase 11 popular. */
export interface RewardLedgerEntry {
  key: string;
  awardedAt: string;
  xp: number;
}

/** Histórico de dicas mostradas/dispensadas (docs/20 §10, Fase 8). */
export interface TipHistoryEntry {
  tipId: string;
  shownAt: string; // ISO
  /** Data local (YYYY-MM-DD) de `shownAt` — evita reparsear em toda checagem de limite diário. */
  localDate: string;
  dismissed: boolean;
  /** false = espontânea (conta pro limite de 1/dia e pro cooldown de 14 dias); true = o aluno pediu (docs/20 §10, item 8: ignora limite diário, nunca validade/perfil). */
  requested: boolean;
}

/** Melhor resultado já registrado de uma microlição (docs/20 §12, Fase 11 — mesma faixa 1/2/3 estrelas do legado de redação). */
export interface MicroLessonCompletion {
  version: number;
  completedAt: string;
  stars: 1 | 2 | 3;
  bestPct: number;
}

export interface LearningState {
  activeSession: LearningSession | null;
  /** lessonId -> melhor resultado já registrado nesse novo sistema (distinto de `progress.lessons`, que é o legado da trilha). */
  completedLessons: Record<string, MicroLessonCompletion>;
  skillEvidence: Record<string, SkillEvidenceEntry>;
  reviewSchedule: Record<string, ReviewScheduleEntry>;
  /** Limitado a 500 (docs/20 §15.2) — podar não deve nunca liberar XP de novo (ledger é a fonte de idempotência, não o histórico). */
  recentAttempts: Attempt[];
  rewardLedger: Record<string, RewardLedgerEntry>;
  /** Limitado a 100 (docs/20 §15.2). */
  tipHistory: TipHistoryEntry[];
  /** Capítulos cuja folha de celebração já foi mostrada — uma vez cada (docs/25 §6.6/§7.6, Fase 1). */
  celebratedChapterIds: string[];
}

export const LIMITE_TENTATIVAS_RECENTES = 500;
export const LIMITE_HISTORICO_DICAS = 100;

/* ------------------------------------------------------------ microlições (Fase 6) */

/**
 * Fase pedagógica dentro de uma microlição (docs/20 §8.1) — sequência fixa:
 * ensino → checkpoint → prática → recap. Distinta de `FeedbackPhase`
 * (`answering/feedback/advancing`, Fase 2), que é a máquina de UMA resposta;
 * `LessonStage` é a máquina da LIÇÃO inteira, que contém várias respostas.
 */
export type LessonStage = "teaching" | "checkpoint" | "practice" | "recap" | "completed";

export type LessonBlockType = "concept" | "worked-example" | "comparison" | "diagram";

interface LessonBlockBase {
  type: LessonBlockType;
  /** Texto curto — contam pro limite de ~100 palavras de ensino (docs/20 §8.1). */
  title: string;
}

export interface ConceptBlock extends LessonBlockBase {
  type: "concept";
  body: string;
}

export interface WorkedExampleBlock extends LessonBlockBase {
  type: "worked-example";
  problem: string;
  steps: string[];
  result: string;
}

export interface ComparisonBlock extends LessonBlockBase {
  type: "comparison";
  left: { label: string; body: string };
  right: { label: string; body: string };
}

/** Diagrama controlado — sem HTML/JS arbitrário vindo do conteúdo (docs/20 §8.3). Ver `LearningDiagram.tsx` pros `kind` suportados. */
export interface DiagramBlock extends LessonBlockBase {
  type: "diagram";
  kind: "membrana-celular" | "fator-percentual";
  /** Descrição textual completa — a alternativa acessível ao SVG (docs/20 §8.4), não uma legenda decorativa. */
  accessibleDescription: string;
  caption?: string;
}

export type LessonBlock = ConceptBlock | WorkedExampleBlock | ComparisonBlock | DiagramBlock;

export type LessonStatus = "draft" | "reviewed" | "published";

/* ------------------------------------------------------------ passos de lição (docs/25 §6.5/§7.1, Fase 1) */

export type StepDifficulty = 1 | 2 | 3;

export type QuestionStepRole = "checkpoint" | "pratica" | "desafio" | "revisao";

export interface IntroStep {
  kind: "intro";
  title: string;
  body: string;
}

export interface TeachStep {
  kind: "teach";
  block: LessonBlock;
}

export interface TipStep {
  kind: "tip";
  title?: string;
  body: string;
}

export interface QuestionStep {
  kind: "question";
  exerciseId: string;
  role: QuestionStepRole;
  difficulty: StepDifficulty;
}

export interface RecapStep {
  kind: "recap";
  body: string;
}

/** Um passo de lição v2 (docs/25 §6.5) — a unidade que `stepsOf` devolve pro motor/player percorrerem. */
export type LessonStep = IntroStep | TeachStep | TipStep | QuestionStep | RecapStep;

/**
 * Campos comuns às duas versões de microlição (docs/25 §7.1). `checkpointExerciseId`/
 * `practiceExerciseIds`/`reviewExerciseIds`/`exerciseId`(em `QuestionStep`) são IDs
 * resolvidos por `src/content/microlicoes/index.ts#resolveExercise` — podem apontar
 * pra um exercício autoral novo OU reaproveitar uma questão existente do banco geral
 * ou de uma trilha legada (docs/20 §9: reuso exige revisão e adequação à habilidade,
 * nunca automático).
 */
interface MicroLessonBase {
  id: string;
  version: number;
  subjectId: string;
  /** Tópico existente de `data/subjects.ts` — não inventa capítulo novo nesta fase (docs/20 §8.2). */
  topicId: string;
  /** Id de `CurriculumChapter` em `src/content/curriculum-tree.ts` (docs/25 §7.2). Obrigatório. */
  chapterId: string;
  title: string;
  objective: string;
  skillIds: string[];
  prerequisiteLessonIds: string[];
  examProfileIds: string[];
  status: LessonStatus;
  estimatedTeachingSeconds: number;
  estimatedPracticeSeconds: number;
  /**
   * Itens usados SÓ pela revisão sintética do capítulo (docs/25 §7.4) —
   * exatamente 2 em lições autorais; `[]` em revisões sintéticas.
   */
  reviewExerciseIds: string[];
  recap: string;
  sources: string[];
  reviewedAt: string | null;
}

/** Formato v1 (docs/20 §8.1/§8.3) — ensino em bloco único seguido de checkpoint + 2 práticas. `stepsOf` normaliza pra `LessonStep[]`. */
export interface MicroLessonV1 extends MicroLessonBase {
  format?: 1;
  blocks: LessonBlock[];
  checkpointExerciseId: string;
  practiceExerciseIds: string[];
}

/** Formato v2 (docs/25 §6.5) — sequência explícita de passos intercalados, 4–8 questões. */
export interface MicroLessonV2 extends MicroLessonBase {
  format: 2;
  steps: LessonStep[];
}

/** Uma microlição — v1 (legado, normalizado por `stepsOf`) ou v2 (formato atual). */
export type MicroLesson = MicroLessonV1 | MicroLessonV2;

export function learningStateVazio(): LearningState {
  return {
    activeSession: null,
    completedLessons: {},
    skillEvidence: {},
    reviewSchedule: {},
    recentAttempts: [],
    rewardLedger: {},
    tipHistory: [],
    celebratedChapterIds: [],
  };
}

/* ------------------------------------------------------------ dicas de vestibular (Fase 8) */

export type TipCategory =
  | "estrategia"
  | "gestao-tempo"
  | "interpretacao"
  | "eliminacao"
  | "erro-comum"
  | "caracteristica-prova";

/**
 * Dica contextual de vestibular (docs/20 §10, Fase 8). Sempre presa a UM
 * perfil de prova (`examProfileId`) — regra 4: "nenhuma dica específica se o
 * perfil não for conhecido" significa que não existe dica "genérica pra
 * qualquer prova" neste modelo.
 */
export interface ExamTip {
  id: string;
  version: number;
  examProfileId: string;
  /** Obrigatório coincidir quando o perfil tiver etapas (ex.: PAS) — docs/20 §10 regra 5. */
  stage?: string;
  cycle?: string;
  skillIds: string[];
  category: TipCategory;
  text: string;
  source: string;
  reviewedAt: string;
  /** `null` = sem validade conhecida; caso contrário, ISO `YYYY-MM-DD` além da qual a dica não é mais elegível. */
  validUntil: string | null;
  /** Prioridade editorial — número menor aparece primeiro no desempate (docs/20 §10 regra 7). */
  priority: number;
}
