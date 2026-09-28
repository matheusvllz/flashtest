/**
 * Tipos do schema de aprendizado (docs/20 §15.2, Fase 5). Contratos aditivos
 * sobre `foca.state.v3` (schemaVersion 4) — nenhum campo daqui é lido/escrito
 * fora de `state-migrations.ts` e do que a própria Fase 5 usa (`exercise-ids`,
 * `adapters`, `selectors`). Campos como `reviewSchedule`, `rewardLedger` e
 * `tipHistory` têm o FORMATO definido agora para não exigir outra migração
 * de schema quando as Fases 7/8/11 (que os consomem de verdade) chegarem —
 * mas nenhuma lógica de agendamento/ledger/dica roda ainda; são apenas
 * contêineres vazios até lá.
 *
 * Schema v6 (docs/30 §21.1, Fase 4 do docs/31): aditivo de novo sobre o
 * mesmo `foca.state.v3` — `SkillModelEntry`, `JourneyState`,
 * `PlacementState`, `FocusSession`, `StudyFocus`, `LearningEvent` no fim
 * deste arquivo. Mesma regra: contêiner de FORMATO definido agora, lógica
 * de verdade só a partir da Fase 5 (Mastery/Confidence) e Fase 12 (jornada).
 */
import type { EnemArea } from "@/content/taxonomy/types";
import type { ActivityKind, PlannedActivity } from "@/lib/adaptive/types";

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
  /**
   * Schema v6 (docs/30 §16.1/§21.1, Fase 6) — `"dont-know"` é o botão "Não
   * sei"; ausente (tentativa antiga) é lido como `"answered"`.
   */
  response?: "answered" | "dont-know";
  /** Camada de explicação alcançada DEPOIS de responder (0–3, docs/30 §16.2) — só sobe. */
  helpLevel?: 0 | 1 | 2 | 3;
  /** `hintUsed || tutorUsed`, mas com dica/tutor pedidos ANTES de responder (docs/30 §9.4: pesa 0,3 no modelo). */
  assisted?: boolean;
  /** Dificuldade do item no momento da tentativa (`ItemMeta.difficulty`), congelada — não reinterpretar com meta futuro. */
  itemDifficulty?: 1 | 2 | 3 | 4 | 5;
  /** Probabilidade prevista pelo modelo ANTES da resposta — só para diagnóstico de calibração (docs/30 §27). */
  predictedP?: number;
  /** De onde veio a tentativa (docs/30 §21.1) — ausente (tentativa antiga) é equivalente a `"microlicao"`. */
  source?: "microlicao" | "estudo" | "legado" | "atividade" | "nivelamento" | "checkpoint";
}

export type LearningSessionKind =
  | "aula-geral"
  | "licao-redacao"
  | "microlicao"
  | "revisao"
  | "atividade"
  | "nivelamento"
  | "checkpoint-trilha";

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
  /** Schema v6 (docs/30 §9.3): escada estendida com 30/60 — valor antigo (1/3/7/14) continua válido, nunca reescrito pra trás. */
  intervalDays: 1 | 3 | 7 | 14 | 30 | 60;
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
  /** Schema v6 (docs/30 §9.3/§21.1, Fase 4) — vazio até a Fase 5 popular. */
  skillModel: Record<string, SkillModelEntry>;
  /** Schema v6 (docs/30 §14.3/§21.1) — vazio até a Fase 12 popular. */
  journey: JourneyState;
  /** Schema v6 (docs/30 §12.3/§21.1) — `null` até a Fase 13 popular (sem nivelamento em andamento/feito). */
  placement: PlacementState | null;
  /** Schema v6 (docs/30 §15/§21.1) — `null` = sem sessão de foco temporária ativa. */
  focusSession: FocusSession | null;
  /** Schema v6 (docs/30 §21.4) — limitado a 300, local, sem envio. */
  events: LearningEvent[];
  modelMeta: { algoVersion: number; bootstrappedAt: string | null };
}

export const LIMITE_TENTATIVAS_RECENTES = 500;
export const LIMITE_HISTORICO_DICAS = 100;
export const LIMITE_EVENTOS = 300;
export const LIMITE_ITENS_DISTINTOS_EVIDENCIA = 50;
export const LIMITE_DATAS_DISTINTAS_EVIDENCIA = 20;

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

export type QuestionStepRole = "checkpoint" | "pratica" | "desafio" | "revisao" | "diagnostico";

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
    skillModel: {},
    journey: journeyVazia(),
    placement: null,
    focusSession: null,
    events: [],
    modelMeta: { algoVersion: 0, bootstrappedAt: null },
  };
}

/* ------------------------------------------------------------ aprendizagem adaptativa (docs/30, Fase 4 do docs/31) */

/**
 * Estado do modelo de UMA habilidade — Mastery/Confidence (docs/30 §9.3).
 * `theta`/`sigma` calculados por `src/lib/adaptive/model.ts` (Fase 5);
 * Confidence é sempre DERIVADA (não gravada — docs/30 §10.1), calculada na
 * leitura a partir deste registro + `skillEvidence`/`reviewSchedule`.
 */
export interface SkillModelEntry {
  skillId: string;
  /** Habilidade latente, escala logit, limitado a [-4, 4]. */
  theta: number;
  /** Incerteza (desvio-padrão), [SIGMA_MIN, SIGMA0] — ver `src/lib/adaptive/constants.ts` (Fase 5). */
  sigma: number;
  /** Soma dos pesos de evidência já aplicados (não é contagem de tentativas — cada papel/assistência pesa diferente). */
  nEff: number;
  /** Dificuldades 1–5 já respondidas de forma independente (sem dica/tutor) — usado por Confidence (diversidade). */
  difficultiesSeen: number[];
  /** Últimos 8 resultados: 1 certo, 0 errado, 2 "não sei". */
  recent: Array<0 | 1 | 2>;
  /** Média móvel exponencial (α = 0,2) da fração de tentativas SEM ajuda. */
  independentShare: number;
  /** `YYYY-MM-DD` local da última evidência — `null` = nunca. Usado pro drift de `sigma` e pela recência de Confidence. */
  lastEvidenceDate: string | null;
  /** Vezes que errou em revisão/checkpoint com Mastery alta antes (docs/30 §9.4) — dispara reforço. */
  lapses: number;
  /** Contador de "não sei" recente, decai 1 por dia sem novo — alimenta REFORCO (docs/30 §11.2). */
  dontKnowRecent: number;
  /** Aberturas da camada 3 de explicação nos últimos 7 dias — idem. */
  helpHeavyRecent: number;
  /** De onde veio o valor atual — nunca confundir prior com evidência de verdade. */
  source: "evidencia" | "prior-nivelamento" | "prior-materia";
  /** Versão do algoritmo que calculou este registro — replay se desatualizado (docs/30 §9.6). */
  algoVersion: number;
  updatedAt: string;
}

/** Um item do histórico de atividades já concluídas da jornada (docs/30 §14.3). */
export interface JourneyHistoryEntry {
  activityId: string;
  kind: ActivityKind;
  skillIds: string[];
  subjectId: string;
  completedAt: string;
  scorePct: number | null;
}

/**
 * Estado da jornada única (docs/30 §14.3, Fase 12) — `committed` (até 3,
 * estáveis na tela até ficarem inválidas) e `upcoming` (até 5, provisórias,
 * replanejadas a cada conclusão) vêm do `planWithFallback` (Fase 8).
 */
export interface JourneyState {
  committed: PlannedActivity[];
  upcoming: PlannedActivity[];
  /** Limitado a 200 (docs/30 §21.1). */
  history: JourneyHistoryEntry[];
  /** Atividade em andamento, com `itemIds` já escolhidos (docs/30 §11.7 — só na hora de começar, não no plano). */
  activeActivity: PlannedActivity | null;
  sinceCheckpoint: number;
  lastCheckpointDate: string | null;
  planVersion: number;
}

export function journeyVazia(): JourneyState {
  return {
    committed: [],
    upcoming: [],
    history: [],
    activeActivity: null,
    sinceCheckpoint: 0,
    lastCheckpointDate: null,
    planVersion: 0,
  };
}

export const LIMITE_HISTORICO_JORNADA = 200;

/** Uma resposta dada durante o nivelamento (docs/30 §12.3, Fase 13). */
export interface PlacementResponse {
  itemId: string;
  correct: boolean;
  dontKnow: boolean;
}

/** Estado (por área ENEM) de uma sessão de nivelamento — EAP em andamento (docs/30 §12.3). */
export interface PlacementAreaState {
  itemIds: string[];
  responses: PlacementResponse[];
  /** Estimativa atual da habilidade latente da área — `null` até a 1ª resposta. */
  theta: number | null;
  /** Erro-padrão da estimativa — `null` até a 1ª resposta; guia a parada (docs/30 §12.3). */
  se: number | null;
  done: boolean;
}

/** Nivelamento adaptativo — opcional, pausável (docs/30 §12, Fase 13). */
export interface PlacementState {
  status: "em-andamento" | "concluido" | "abandonado";
  startedAt: string;
  finishedAt: string | null;
  areas: Record<string, PlacementAreaState>;
  /** Semente do plano — mesma entrada e semente reproduzem a mesma sequência de itens (docs/30 §11.1). */
  seed: string;
}

/** Sessão de foco TEMPORÁRIA ("só hoje") — distinta de `prefs.studyFocus` (permanente, docs/30 §15). */
export interface FocusSession {
  subjectIds: string[];
  startedAt: string;
  /** `YYYY-MM-DD` local — expira no fim do dia (docs/30 §15). */
  expiresOn: string;
}

/** Preferência PERMANENTE de foco (docs/30 §15) — vive em `prefs`, não em `learning`. */
export interface StudyFocus {
  mode: "todas" | "materias" | "areas";
  subjectIds: string[];
  areas: EnemArea[];
}

export function studyFocusVazio(): StudyFocus {
  return { mode: "todas", subjectIds: [], areas: [] };
}

/** Tipos de evento local (docs/30 §21.4, §30 tabela de observabilidade) — nunca enviados, só locais. */
export type LearningEventType =
  | "activity-started"
  | "activity-completed"
  | "explanation-expanded"
  | "ai-help-opened"
  | "checkpoint-completed"
  | "placement-completed"
  | "placement-card-dismissed"
  | "focus-changed"
  | "plan-fallback";

export interface LearningEvent {
  type: LearningEventType;
  at: string;
  /** `YYYY-MM-DD` local — evita reparsear `at` em toda checagem (mesmo padrão de `TipHistoryEntry.localDate`). */
  localDate: string;
  skillId?: string;
  activityId?: string;
  meta?: Record<string, string | number | boolean>;
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
