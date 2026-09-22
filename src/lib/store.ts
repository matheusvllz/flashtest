import { useSyncExternalStore } from "react";
import type { TutorFocus, TutorMessage } from "@/lib/tutor-prompt";
import type { LessonProgress } from "@/lib/lessons/types";
import type { Attempt, ExamTarget, LearningState, TipHistoryEntry } from "@/lib/learning/types";
import {
  learningStateVazio,
  LIMITE_HISTORICO_DICAS,
  LIMITE_TENTATIVAS_RECENTES,
} from "@/lib/learning/types";
import { recordAttemptForSkill } from "@/lib/learning/review";
import {
  computeAdditiveFields,
  CURRENT_SCHEMA_VERSION,
  ensureBackup,
  parseStoredState,
} from "@/lib/state-migrations";
import { SUBJECT_MAP } from "@/data/subjects";

export type Prefs = {
  name: string;
  email: string;
  residenceState: string;
  interestStates: string[];
  level: string;
  goals: string[];
  difficultSubjects: string[];
  exams: string[];
  institutions: string[];
  targetInstitution: string; // a faculdade-alvo destacada no aha moment
  targetCourse: string; // o curso pretendido
  daysPerWeek: number;
  dailyLessons: number; // aulas de 60s por dia (a unidade de estudo, ver SDD 12)
  selectedTopics: Record<string, string[]>; // subjectId -> topicIds
  topicMode: "chose" | "recommend" | "skip" | null;
  /** Toggles sensoriais (docs/18-plano-reestilizacao-rabisco.md §10, docs/16-gamificacao-e-dopamina.md §3/§4). */
  sound: boolean;
  haptics: boolean;
  /** "auto" segue o sistema (docs/18 §12.4, D4). */
  theme: "auto" | "light" | "dark";
  /** Schema v4 (docs/20 §15.2) — sem UI própria ainda; a Fase 8 (dicas de vestibular) é quem lê isto. */
  examTargets: ExamTarget[];
  showExamTips: boolean;
  /** Schema v5 (docs/25 §7.6) — matéria selecionada nos chips da trilha; `null` = nenhuma ainda. */
  trailSubjectId: string | null;
};

/** Resposta de calibração dada durante o quiz de entrada. */
export type QuizAnswer = {
  questionId: string;
  chosen: string;
  correct: boolean;
  subject: string;
  subjectName: string;
  topic: string;
};

/** Lacuna detectada. Nesta fase a heurística é local; a IA refina na Development 2. */
export type Gap = {
  subject: string;
  subjectName: string;
  topic: string;
  severity: "alta" | "média" | "baixa";
  reason: string;
};

export type Progress = {
  answered: number;
  correct: number;
  lessonsCompleted: number;
  streak: number;
  lastStudyDate: string | null;
  bySubject: Record<string, { answered: number; correct: number }>;
  byTopic: Record<string, { answered: number; correct: number }>;
  savedFlashcards: string[];
  flashcardReviews: Record<string, { ease: number; nextReview: string }>;
  completedQuestions: string[];
  xp: number;
  achievements: string[];
  /**
   * Micro-treino de redação (SDD 12, D3): lição concluída -> melhor resultado.
   * Vive dentro de `progress` de propósito — o XP da trilha é o MESMO XP das
   * aulas de 60s, então os dois pilares alimentam um progresso só.
   */
  lessons: Record<string, LessonProgress>;
  /**
   * Registro honesto de atividade (docs/18-plano-reestilizacao-rabisco.md §6,
   * §9). Datas em ISO `YYYY-MM-DD`, sempre locais (nunca UTC — ver `hojeISO`).
   * Guarda até 60 dias; é o que faz a meta diária, o calendário semanal e o
   * "voltou depois de sumir" refletirem a realidade em vez de números soltos.
   */
  activityDays: string[];
  /** Maior sequência já alcançada — mostrado como alvo depois de quebrar (docs/16 §6). */
  bestStreak: number;
  /** Congelamentos automáticos acumuláveis até 2 (docs/16 §6). */
  streakFreezes: number;
  /**
   * Schema v4 (docs/20 §15.2/§12) — contador explícito, independente do
   * histórico de `activityDays` (que só guarda 60 dias). Ainda não é lido por
   * `registrarAtividade`: a correção do cálculo de reposição é da Fase 11,
   * que já lista essa troca como sua própria tarefa — este campo só existe
   * pra ela não precisar de outra migração de schema quando chegar.
   */
  activityDaysSinceFreezeAward: number;
  /** O dia de hoje. Ler sempre via `atividadeHoje()`, nunca direto — vira estale à meia-noite. */
  today: {
    date: string;
    lessons: number;
    flashcards: number;
    redacao: number;
    celebrouMeta: boolean;
    /** Schema v4 — unidade "bloco" da Fase 11; vazio até ela popular. */
    completedBlockIds: string[];
  };
};

export type AppState = {
  authed: boolean;
  onboarded: boolean;
  /** Schema v4 (docs/20 §15.2) — aditivo sobre a chave `foca.state.v3`; ver `state-migrations.ts`. */
  schemaVersion: number;
  prefs: Prefs;
  progress: Progress;
  /** Schema v4 (docs/20 §15) — sessões/tentativas/evidência/revisão/ledger; contêineres vazios até as Fases 6–11 popularem. */
  learning: LearningState;
  quiz: { answers: QuizAnswer[]; gaps: Gap[]; completedAt: string | null };
  /**
   * Balão global do tutor (SDD 12, D2). Vive no store para que qualquer tela
   * possa abrir o balão e apontar a IA para a questão da vez — sem um segundo
   * mecanismo de estado paralelo.
   */
  tutor: {
    open: boolean;
    messages: TutorMessage[];
    focus: TutorFocus | null;
  };
  premiumTrial: { active: boolean; startedAt: string | null };
  offline: { downloaded: boolean };
};

// v3: rebranding para Foca (docs/17 Fase 8). O formato é o mesmo da v2; a chave
// antiga é lida uma vez e copiada, para não apagar o progresso de quem já usou.
// Os campos de honestidade da Fase 6 do docs/18 são aditivos — não precisou v4.
const KEY = "foca.state.v3";
const LEGACY_KEY = "flashtest.state.v2";

/**
 * Data local em ISO `YYYY-MM-DD` — nunca `toISOString()`, que é UTC e vira o
 * dia errado à noite no Brasil. Exportada pra quem registra tentativas fora
 * do store (`useLearningSession`, Fase 7).
 */
export function hojeISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function inicioDoDia(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Dias corridos entre `lastStudyDate` (formato `toDateString()`) e `agora`. `null` = nunca houve atividade. */
function diasDesde(lastStudyDate: string | null, agora: Date): number | null {
  if (!lastStudyDate) return null;
  const last = inicioDoDia(new Date(lastStudyDate));
  const hoje = inicioDoDia(agora);
  return Math.round((hoje.getTime() - last.getTime()) / 86400000);
}

function todayBucketVazio(iso: string): Progress["today"] {
  return {
    date: iso,
    lessons: 0,
    flashcards: 0,
    redacao: 0,
    celebrouMeta: false,
    completedBlockIds: [],
  };
}

const defaultState: AppState = {
  authed: false,
  onboarded: false,
  schemaVersion: CURRENT_SCHEMA_VERSION,
  prefs: {
    name: "",
    email: "",
    residenceState: "",
    interestStates: [],
    level: "",
    goals: [],
    difficultSubjects: [],
    exams: [],
    institutions: [],
    targetInstitution: "",
    targetCourse: "",
    daysPerWeek: 5,
    dailyLessons: 3,
    selectedTopics: {},
    topicMode: null,
    // Primeiro uso começa com som ligado, mas com aviso visível de como
    // desligar (docs/16-gamificacao-e-dopamina.md §3, regra 3).
    sound: true,
    haptics: true,
    theme: "auto",
    examTargets: [],
    showExamTips: true,
    trailSubjectId: null,
  },
  learning: learningStateVazio(),
  progress: {
    answered: 0,
    correct: 0,
    lessonsCompleted: 0,
    streak: 0,
    lastStudyDate: null,
    bySubject: {},
    byTopic: {},
    savedFlashcards: [],
    flashcardReviews: {},
    completedQuestions: [],
    xp: 0,
    achievements: [],
    lessons: {},
    activityDays: [],
    bestStreak: 0,
    streakFreezes: 1,
    activityDaysSinceFreezeAward: 0,
    today: todayBucketVazio(hojeISO()),
  },
  quiz: { answers: [], gaps: [], completedAt: null },
  tutor: { open: false, messages: [], focus: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
};

let state: AppState = defaultState;
const listeners = new Set<() => void>();

/**
 * Lê e migra o estado salvo (docs/20 §15.3, Fase 5). A fusão dos campos que
 * já existiam desde o v2/v3 (prefs/progress/quiz/tutor/premiumTrial/offline)
 * continua aditiva aqui mesmo; os campos NOVOS do schema v4 vêm prontos de
 * `computeAdditiveFields` (parse protegido, backup, proteção de versão futura
 * — ver `state-migrations.ts`).
 */
function load() {
  if (typeof window === "undefined") return;
  try {
    let raw = localStorage.getItem(KEY);
    if (raw === null) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy !== null) {
        raw = legacy;
        localStorage.setItem(KEY, legacy);
      }
    }
    if (!raw) return;

    const { parsed, warning } = parseStoredState(raw);
    if (warning) console.warn(`[store] ${warning}`);
    if (!parsed) return; // storage ilegível: segue com defaultState, nada é sobrescrito às cegas.

    ensureBackup(
      raw,
      (k) => localStorage.getItem(k),
      (k, v) => localStorage.setItem(k, v),
    );
    const aditivos = computeAdditiveFields(parsed);

    const iso = hojeISO();
    const parsedProgress = (parsed.progress ?? {}) as Partial<Progress>;
    const parsedToday = parsedProgress.today;
    state = {
      ...defaultState,
      ...parsed,
      schemaVersion: aditivos.schemaVersion,
      prefs: {
        ...defaultState.prefs,
        ...(parsed.prefs || {}),
        examTargets: aditivos.examTargets,
        showExamTips: aditivos.showExamTips,
        trailSubjectId: aditivos.trailSubjectId,
      },
      learning: aditivos.learning,
      progress: {
        ...defaultState.progress,
        ...parsedProgress,
        activityDaysSinceFreezeAward: aditivos.activityDaysSinceFreezeAward,
        // Vira estale à meia-noite: se o dia mudou desde a última gravação,
        // o balde de hoje reseta ao carregar (docs/18 §15 Fase 6).
        today:
          parsedToday && parsedToday.date === iso
            ? { ...parsedToday, completedBlockIds: aditivos.completedBlockIds }
            : todayBucketVazio(iso),
      },
      quiz: { ...defaultState.quiz, ...(parsed.quiz || {}) },
      // O balão sempre volta fechado e sem foco: o histórico persiste, o
      // estado de UI não.
      tutor: {
        ...defaultState.tutor,
        messages: ((parsed.tutor as { messages?: TutorMessage[] } | undefined)?.messages ??
          []) as TutorMessage[],
      },
      // (open/focus sempre voltam ao default: são estado de UI. Um `autoPrompt`
      // de storage antigo, pré-docs/20, cai fora daqui sem ser executado.)
      premiumTrial: { ...defaultState.premiumTrial, ...(parsed.premiumTrial || {}) },
      offline: { ...defaultState.offline, ...(parsed.offline || {}) },
    };
    // Grava a migração de volta — sem isso, o schema v4 (schemaVersion,
    // `learning`, campos aditivos) só existiria em memória até a próxima
    // mutação, e uma nova aba/sessão re-migraria do zero a cada vez em vez
    // de ler o resultado já migrado (docs/20 §15.3, item 8: "gravar apenas
    // versão válida"). Nunca grava por cima de uma versão futura desconhecida.
    if (!aditivos.futureVersion) persist();
  } catch {
    // Qualquer falha inesperada: segue com o que já estava em `state` (defaultState
    // na primeira carga) — nunca deixa a leitura quebrar o boot do app.
  }
}

/** `false` quando a escrita falhou (quota, storage bloqueado) — o chamador NUNCA deve anunciar persistência bem-sucedida nesse caso (docs/20 §15.3, item 9). O estado em memória continua correto de qualquer forma. */
function persist(): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    console.warn("[store] não foi possível salvar — a sessão continua em memória.");
    return false;
  }
}

export function getState() {
  return state;
}

export function setState(mut: (s: AppState) => AppState | void) {
  const next = mut(structuredClone(state));
  state = (next as AppState) ?? state;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

let loaded = false;
/**
 * Garante que `load()` já rodou — idempotente, pode ser chamada de qualquer
 * lugar (não só de dentro de um componente React). `getState()` sozinho NÃO
 * hidrata: quem decide algo a partir dele fora de `useAppState()` (ex.: o
 * redirect do splash em `index.tsx`) precisa chamar `hydrate()` antes
 * (docs/20 §14.2/§15.3, item "inicialização explícita antes do redirect").
 */
export function hydrate(): AppState {
  if (typeof window !== "undefined" && !loaded) {
    load();
    loaded = true;
  }
  return state;
}

export function useAppState(): AppState {
  hydrate();
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => defaultState,
  );
}

/**
 * Registra presença do dia — a peça central da honestidade do produto
 * (docs/16-gamificacao-e-dopamina.md §6, docs/18-plano-reestilizacao-rabisco.md
 * §9). Chamada por toda ação que conta como "estudou hoje": responder uma
 * questão da aula de 60s, concluir uma lição de redação, revisar um flashcard.
 *
 * Streak: incrementa se a última atividade foi ontem; se foi anteontem e há
 * congelamento disponível, consome 1 e mantém a sequência viva; senão quebra
 * para 1. Isto substitui o comportamento anterior (incrementava a cada dia
 * novo, não importa o tamanho do intervalo) — a correção está autorizada por
 * `docs/16` §6 e registrada no plano como a única mudança de comportamento
 * desta fase.
 */
/**
 * `contaComoBloco`: empurra um novo ID em `today.completedBlockIds` — a
 * unidade diária unificada (docs/20 §12, Fase 11): "aula geral, redação,
 * microlição ou sessão de revisão" contam igual pra meta, não cada uma com
 * seu próprio limiar. `false` pra chamadas que são atividade real (contam
 * pra streak) mas NÃO um bloco completo sozinhas — cada carta de flashcard
 * avaliada é uma delas; o bloco da sessão de flashcards é registrado à parte,
 * uma vez, quando o lote esvazia (`registrarLoteFlashcardsConcluido`).
 */
function registrarAtividade(
  s: AppState,
  tipo: "lesson" | "flashcard" | "redacao",
  contaComoBloco: boolean,
) {
  const agora = new Date();
  const iso = hojeISO(agora);
  const hojeDS = agora.toDateString();

  if (s.progress.today.date !== iso) s.progress.today = todayBucketVazio(iso);
  if (tipo === "lesson") s.progress.today.lessons += 1;
  if (tipo === "flashcard") s.progress.today.flashcards += 1;
  if (tipo === "redacao") s.progress.today.redacao += 1;
  if (contaComoBloco) {
    s.progress.today.completedBlockIds.push(
      `${tipo}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    );
  }

  if (!s.progress.activityDays.includes(iso)) {
    s.progress.activityDays.push(iso);
    if (s.progress.activityDays.length > 60) s.progress.activityDays.shift();
    // Contador EXPLÍCITO, independente do histórico truncado em 60 dias
    // (docs/20 §12, Fase 11, item 6 — substitui `activityDays.length % 7`,
    // que parava de conceder congelamento depois do array truncar).
    s.progress.activityDaysSinceFreezeAward += 1;
    if (s.progress.activityDaysSinceFreezeAward >= 7) {
      s.progress.streakFreezes = Math.min(2, s.progress.streakFreezes + 1);
      s.progress.activityDaysSinceFreezeAward = 0;
    }
  }

  if (s.progress.lastStudyDate !== hojeDS) {
    const gap = diasDesde(s.progress.lastStudyDate, agora);
    if (gap === null) {
      s.progress.streak = 1; // primeira atividade de sempre
    } else if (gap === 1) {
      s.progress.streak += 1; // veio ontem — sequência viva
    } else if (gap === 2 && s.progress.streakFreezes > 0) {
      s.progress.streakFreezes -= 1; // perdeu 1 dia, mas tinha congelamento
      s.progress.streak += 1;
    } else {
      s.progress.streak = 1; // quebrou de verdade
    }
    s.progress.lastStudyDate = hojeDS;
    s.progress.bestStreak = Math.max(s.progress.bestStreak, s.progress.streak);
  }
}

export function login(email: string, name: string) {
  setState((s) => {
    s.authed = true;
    s.prefs.email = email;
    if (name) s.prefs.name = name;
    return s;
  });
}

/**
 * Fecha o quiz de entrada: grava as lacunas e liga as flags de roteamento.
 * `answers` fica no tipo porque a Development 2 volta a calibrar por conteúdo — hoje
 * o quiz é curto de propósito e as lacunas saem do perfil declarado.
 * O XP/streak inicial faz o aluno já entrar "dentro do jogo": é o dia 1 real, não conquista falsa.
 */
const XP_ONBOARDING_BONUS = 50;
const LEDGER_KEY_ONBOARDING = "onboarding:bonus";

export function completeQuiz(answers: QuizAnswer[], gaps: Gap[]) {
  setState((s) => {
    s.quiz = { answers, gaps, completedAt: new Date().toISOString() };
    s.authed = true;
    s.onboarded = true;
    // Bônus único de verdade, via ledger — não mais "toda vez que completeQuiz
    // roda" (docs/20 §2.5/§12, Fase 11: refazer o /quiz não pode repagar).
    if (!s.learning.rewardLedger[LEDGER_KEY_ONBOARDING]) {
      s.progress.xp += XP_ONBOARDING_BONUS;
      s.learning.rewardLedger[LEDGER_KEY_ONBOARDING] = {
        key: LEDGER_KEY_ONBOARDING,
        awardedAt: new Date().toISOString(),
        xp: XP_ONBOARDING_BONUS,
      };
    }
    // Só na primeira vez (streak 0): refazer o diagnóstico depois não mexe na
    // sequência. Mantém a condição original; só passa a alimentar também os
    // campos novos de honestidade (docs/18 §15 Fase 6).
    if (s.progress.streak === 0) {
      const agora = new Date();
      s.progress.streak = 1;
      s.progress.bestStreak = Math.max(s.progress.bestStreak, 1);
      s.progress.lastStudyDate = agora.toDateString();
      const iso = hojeISO(agora);
      if (!s.progress.activityDays.includes(iso)) s.progress.activityDays.push(iso);
    }
    return s;
  });
}

/* --------------------------------------------- micro-treino de redação --- */

/**
 * XP por lição de redação: menor que o de uma aula de 60s por design — a
 * trilha alimenta o hábito, a aula continua sendo a unidade central do produto.
 */
const XP_BY_STARS: Record<1 | 2 | 3, number> = { 1: 10, 2: 20, 3: 30 };

export function starsForPct(pct: number): 1 | 2 | 3 {
  if (pct >= 90) return 3;
  if (pct >= 70) return 2;
  return 1;
}

export type CompleteLessonResult = {
  progress: LessonProgress;
  /** XP concedido AGORA (0 em replay sem melhora). */
  xpAwarded: number;
  improved: boolean;
  /** Primeira vez que esta lição é concluída. */
  first: boolean;
};

/**
 * Registra a conclusão de uma lição da trilha. O XP é dado na primeira
 * conclusão e, em replays, apenas a DIFERENÇA quando as estrelas melhoram —
 * sem farm de XP repetindo a lição mais fácil.
 */
export function completeLesson(
  lessonId: string,
  correct: number,
  total: number,
): CompleteLessonResult {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const stars = starsForPct(pct);
  const prev = getState().progress.lessons[lessonId];
  const bestStars = prev ? (Math.max(prev.stars, stars) as 1 | 2 | 3) : stars;

  const progress: LessonProgress = {
    lessonId,
    stars: bestStars,
    bestPct: Math.max(prev?.bestPct ?? 0, pct),
    completedAt: new Date().toISOString(),
  };
  const xpAwarded = Math.max(0, XP_BY_STARS[bestStars] - (prev ? XP_BY_STARS[prev.stars] : 0));

  setState((s) => {
    s.progress.lessons[lessonId] = progress;
    s.progress.xp += xpAwarded;
    // A trilha conta para a sequência tanto quanto a aula de 60s: o que o
    // produto premia é ter estudado hoje, não qual pilar foi tocado.
    registrarAtividade(s, "redacao", true);
    return s;
  });

  return { progress, xpAwarded, improved: !prev || bestStars > prev.stars, first: !prev };
}

export type CompleteMicroLessonResult = {
  xpAwarded: number;
  alreadyCompleted: boolean;
  stars: 1 | 2 | 3;
};

/**
 * Registra a conclusão de uma microlição (docs/20 §12, Fase 11): mesma
 * fórmula 10/20/30 por estrela e mesmos limiares 70/90 da redação legada
 * (`starsForPct`/`XP_BY_STARS`) — "usando apenas prática pra faixa" (o
 * checkpoint não entra na conta de `correct`/`total`). Replay paga só a
 * DIFERENÇA quando a faixa melhora, nunca XP integral de novo — mesmo padrão
 * de `completeLesson`, sem precisar de ledger separado: o diff já é
 * idempotente por construção.
 */
export function completeMicroLesson(
  lessonId: string,
  version: number,
  correctPractice: number,
  totalPractice: number,
): CompleteMicroLessonResult {
  const pct = totalPractice > 0 ? Math.round((correctPractice / totalPractice) * 100) : 0;
  const stars = starsForPct(pct);
  const prev = getState().learning.completedLessons[lessonId];
  const bestStars = prev ? (Math.max(prev.stars, stars) as 1 | 2 | 3) : stars;
  const xpAwarded = Math.max(0, XP_BY_STARS[bestStars] - (prev ? XP_BY_STARS[prev.stars] : 0));

  setState((s) => {
    s.learning.completedLessons[lessonId] = {
      version,
      completedAt: new Date().toISOString(),
      stars: bestStars,
      bestPct: Math.max(prev?.bestPct ?? 0, pct),
    };
    s.progress.xp += xpAwarded;
    registrarAtividade(s, "lesson", true);
    return s;
  });

  return { xpAwarded, alreadyCompleted: Boolean(prev), stars: bestStars };
}

/** Desbloqueio sequencial: a lição N abre quando a N-1 foi concluída. */
export function isLessonUnlocked(licoes: Array<{ id: string }>, lessonId: string, s: AppState) {
  const idx = licoes.findIndex((l) => l.id === lessonId);
  if (idx <= 0) return idx === 0;
  return Boolean(s.progress.lessons[licoes[idx - 1].id]);
}

/* ------------------------------------------------------------- aula de 60s --- */

/**
 * Teto vitalício por questão do banco geral (docs/20 §12, Fase 11): primeira
 * errada concede 5; melhorar pra correta concede a DIFERENÇA até 15;
 * repetições (certo de novo, ou errar depois de já ter acertado) não
 * concedem mais nada. Idempotente via `learning.rewardLedger` — resolve o
 * que o diagnóstico (docs/20 §2.3) chamava de "concessão de XP não
 * idempotente" mesmo com `completedQuestions` sem duplicar o ID.
 */
const XP_TETO_QUESTAO_GERAL = 15;
const XP_QUESTAO_ERRADA = 5;

/**
 * Registra a resposta de uma questão da aula de 60s (docs/18-plano-
 * reestilizacao-rabisco.md §15 Fase 6; docs/20 §12, Fase 11). Movido de
 * `study.tsx` pra cá pra sair do terceiro bloco duplicado de streak.
 *
 * NÃO chama `registrarAtividade` aqui: uma aula tem 2 questões (`LESSON_SIZE`
 * em `study.tsx`), e `docs/16` §6 conta streak/meta por AULA concluída, não
 * por questão — ver `registrarAulaConcluida()`.
 *
 * @returns o XP efetivamente concedido AGORA (0 se o teto já foi atingido) —
 * o chamador usa isto pro feedback, não mais um valor fixo 15/5 assumido.
 */
export function registrarResposta(
  q: { id: string; subject: string; subjectName: string; topic: string },
  correct: boolean,
): number {
  const ledgerKey = `questao-geral:${q.id}`;
  const jaPago = getState().learning.rewardLedger[ledgerKey]?.xp ?? 0;
  const alvo = correct ? XP_TETO_QUESTAO_GERAL : XP_QUESTAO_ERRADA;
  const xpAwarded = Math.max(0, alvo - jaPago);

  setState((s) => {
    s.progress.answered += 1;
    if (!s.progress.completedQuestions.includes(q.id)) s.progress.completedQuestions.push(q.id);
    if (correct) s.progress.correct += 1;
    s.progress.bySubject[q.subject] ??= { answered: 0, correct: 0 };
    s.progress.bySubject[q.subject].answered += 1;
    if (correct) s.progress.bySubject[q.subject].correct += 1;
    s.progress.byTopic[q.topic] ??= { answered: 0, correct: 0 };
    s.progress.byTopic[q.topic].answered += 1;
    if (correct) s.progress.byTopic[q.topic].correct += 1;
    if (xpAwarded > 0) {
      s.progress.xp += xpAwarded;
      s.learning.rewardLedger[ledgerKey] = {
        key: ledgerKey,
        awardedAt: new Date().toISOString(),
        xp: jaPago + xpAwarded,
      };
    }
    return s;
  });

  return xpAwarded;
}

/** Fecha a aula de 60s: incrementa o contador de aulas da vida E a atividade de hoje — 1 bloco (docs/20 §12, Fase 11). */
export function registrarAulaConcluida() {
  setState((s) => {
    s.progress.lessonsCompleted += 1;
    registrarAtividade(s, "lesson", true);
    return s;
  });
}

/* -------------------------------------------------------------- flashcards --- */

/**
 * Revisar UM flashcard conta como atividade do dia (docs/16 §6: "qualquer
 * atividade completada") — mas não é 1 bloco sozinho: o bloco é a SESSÃO de
 * revisão (até 3 itens devidos), registrado uma vez por `registrarLoteFlashcardsConcluido`
 * quando a fila esvazia (docs/20 §12, Fase 11).
 */
export function registrarRevisaoFlashcard() {
  setState((s) => {
    registrarAtividade(s, "flashcard", false);
    return s;
  });
}

/**
 * Fecha um LOTE de revisão de flashcards como 1 bloco — chamar uma vez
 * quando a fila esvazia de verdade (nunca por sessão vazia — docs/20 §12,
 * regra: "sessão de até 3 itens devidos; 1 ou 2 ainda contam como 1 bloco;
 * sessão vazia não conta").
 */
export function registrarLoteFlashcardsConcluido() {
  setState((s) => {
    if (s.progress.today.date !== hojeISO()) s.progress.today = todayBucketVazio(hojeISO());
    s.progress.today.completedBlockIds.push(`flashcards-lote-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);
    return s;
  });
}

/* --------------------------------------------------------- nível e prefs --- */

/** 10 patamares fixos, derivados de XP (docs/18 §9). Não confundir com `prefs.level` (nível escolar). */
const NIVEL_TABELA = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

export function nivelDeXp(xp: number): {
  nivel: number;
  atual: number;
  proximo: number;
  pct: number;
} {
  let nivel = 1;
  for (let i = 1; i < NIVEL_TABELA.length; i++) {
    if (xp >= NIVEL_TABELA[i]) nivel = i + 1;
  }
  const base = NIVEL_TABELA[nivel - 1];
  const proximoBase = NIVEL_TABELA[nivel];
  if (proximoBase === undefined) return { nivel, atual: xp - base, proximo: 0, pct: 100 };
  const atual = xp - base;
  const proximo = proximoBase - base;
  return { nivel, atual, proximo, pct: Math.min(100, Math.round((atual / proximo) * 100)) };
}

export function setPrefs(partial: Partial<Pick<Prefs, "sound" | "haptics" | "theme">>) {
  setState((s) => {
    Object.assign(s.prefs, partial);
    return s;
  });
}

/** Marca a meta diária como já celebrada hoje — evita repetir a animação/som a cada visita ao dashboard. */
export function marcarMetaCelebrada() {
  setState((s) => {
    s.progress.today.celebrouMeta = true;
    return s;
  });
}

/** Dias corridos desde a última atividade. `Infinity` = nunca houve. Usado pelo gatilho de "acolhedora" (docs/15 §3.2). */
export function diasSemAtividade(s: AppState): number {
  const gap = diasDesde(s.progress.lastStudyDate, new Date());
  return gap ?? Infinity;
}

/** Marcos de sequência que merecem celebração maior (expressão + som), não todo dia (docs/16 §6). */
export function isStreakMilestone(streak: number): boolean {
  return streak > 0 && [7, 30, 100].includes(streak);
}

/** Leitura honesta do balde de hoje — nunca ler `s.progress.today` direto: ele fica estale até a próxima atividade virar o dia. */
export function atividadeHoje(s: AppState): Progress["today"] {
  const iso = hojeISO();
  return s.progress.today.date === iso ? s.progress.today : todayBucketVazio(iso);
}

/* ------------------------------------------------------------- aprendizado (Fases 6-7) --- */

/**
 * Persiste a sessão ativa de uma microlição — usado por `useLearningSession`
 * pra sobreviver a reload sem duplicar resposta/XP/índice (docs/20 §8.1,
 * critério A8). `null` limpa a sessão (saída/conclusão).
 */
export function setActiveLearningSession(session: LearningState["activeSession"]) {
  setState((s) => {
    s.learning.activeSession = session;
    return s;
  });
}

/**
 * Marca que a folha de celebração de um capítulo já foi mostrada — uma vez
 * cada (docs/25 §6.6/§7.6, §8: `?capitulo=<chapterId>`). Idempotente: não
 * duplica se já presente.
 */
export function markChapterCelebrated(chapterId: string) {
  setState((s) => {
    if (!s.learning.celebratedChapterIds.includes(chapterId)) {
      s.learning.celebratedChapterIds.push(chapterId);
    }
    return s;
  });
}

function horasEntre(isoA: string, isoB: string): number {
  return Math.abs(new Date(isoA).getTime() - new Date(isoB).getTime()) / 3_600_000;
}

/**
 * Registra uma tentativa e atualiza evidência/agenda de revisão de cada
 * habilidade envolvida — transação única (docs/20 §14.1, Fase 5 item 7 +
 * Fase 7 item 1/3). Poda o histórico de tentativas recentes sem nunca tocar
 * XP/ledger (a poda não pode liberar recompensa de novo).
 */
export function recordLearningAttempt(attempt: Attempt): void {
  setState((s) => {
    // Horas desde a última tentativa que toca QUALQUER habilidade em comum,
    // calculado ANTES de empilhar a nova (docs/20 §13: recuperação de
    // revisão exige tempo real decorrido, não só o `role` da tentativa).
    const anteriores = s.learning.recentAttempts.filter((a) =>
      attempt.skillIds.some((id) => a.skillIds.includes(id)),
    );
    const ultima = anteriores[anteriores.length - 1];
    const horasDesdeUltimaExposicao = ultima
      ? horasEntre(ultima.submittedAt, attempt.submittedAt)
      : Infinity;

    s.learning.recentAttempts.push(attempt);
    if (s.learning.recentAttempts.length > LIMITE_TENTATIVAS_RECENTES) {
      s.learning.recentAttempts.shift();
    }

    for (const skillId of attempt.skillIds) {
      const { evidence, schedule } = recordAttemptForSkill({
        skillId,
        evidenceAtual: s.learning.skillEvidence[skillId],
        scheduleAtual: s.learning.reviewSchedule[skillId],
        attempt,
        horasDesdeUltimaExposicao,
        hojeISO: attempt.localDate,
      });
      if (evidence) s.learning.skillEvidence[skillId] = evidence;
      if (schedule) s.learning.reviewSchedule[skillId] = schedule;
    }
    return s;
  });
}

/* -------------------------------------------------------- dicas de vestibular (Fase 8) --- */

/**
 * Perfil de vestibular único (docs/20 §10, item 5: "seleção explícita de
 * exame"). MVP não junta múltiplos perfis — trocar substitui o anterior.
 * `null` limpa a seleção (aluno sem perfil escolhido = nenhuma dica, regra 4).
 */
export function setExamTarget(target: ExamTarget | null) {
  setState((s) => {
    s.prefs.examTargets = target ? [target] : [];
    return s;
  });
}

export function setShowExamTips(enabled: boolean) {
  setState((s) => {
    s.prefs.showExamTips = enabled;
    return s;
  });
}

/** Matéria selecionada nos chips da trilha (docs/25 §7.6/§8). `null` limpa a seleção. */
export function setTrailSubject(subjectId: string | null) {
  setState((s) => {
    s.prefs.trailSubjectId = subjectId;
    return s;
  });
}

/** Registra a exibição de uma dica — uma vez por evento (quem chama garante isso, ex.: efeito de montagem do recap), nunca por render (docs/20 §10, item 4). */
export function recordTipShown(tipId: string, requested: boolean): void {
  setState((s) => {
    const entry: TipHistoryEntry = {
      tipId,
      shownAt: new Date().toISOString(),
      localDate: hojeISO(),
      dismissed: false,
      requested,
    };
    s.learning.tipHistory.push(entry);
    if (s.learning.tipHistory.length > LIMITE_HISTORICO_DICAS) s.learning.tipHistory.shift();
    return s;
  });
}

/** Marca a exposição mais recente de um tipId como dispensada — não altera XP/progresso (docs/20 §10, critério A11). */
export function dismissTip(tipId: string): void {
  setState((s) => {
    for (let i = s.learning.tipHistory.length - 1; i >= 0; i--) {
      if (s.learning.tipHistory[i].tipId === tipId) {
        s.learning.tipHistory[i].dismissed = true;
        break;
      }
    }
    return s;
  });
}

/* ---------------------------------------------------------------- tutor --- */

/** Abre o balão sem mudar o contexto atual — usado pelo botão flutuante. */
export function openTutor() {
  setState((s) => {
    s.tutor.open = true;
    return s;
  });
}

export function closeTutor() {
  setState((s) => {
    s.tutor.open = false;
    return s;
  });
}

/** Aponta a IA para a questão da vez. `null` desfoca (fora da aula). */
export function setTutorFocus(focus: TutorFocus | null) {
  setState((s) => {
    s.tutor.focus = focus;
    return s;
  });
}

/**
 * Abre o balão e fixa o contexto da questão da vez — ação explícita dos CTAs
 * "Perguntar à Foca" / "Explicar melhor" (docs/20 §4.2). Nunca chama a API:
 * só quando o aluno digitar ou tocar numa sugestão é que uma mensagem sai.
 */
export function openTutorWithContext(focus: TutorFocus) {
  setState((s) => {
    s.tutor.open = true;
    s.tutor.focus = focus;
    return s;
  });
}

export function pushTutorMessage(message: TutorMessage) {
  setState((s) => {
    s.tutor.messages.push(message);
    return s;
  });
}

export function clearTutorMessages() {
  setState((s) => {
    s.tutor.messages = [];
    return s;
  });
}

/**
 * Frases de desempenho para o prompt do tutor. **O número sai daqui, da regra;
 * só a frase em volta é gerada pela IA** — é o compromisso de honestidade do
 * SDD 08 (Seção 6), que precisa ser defensável na banca.
 */
export function performanceFacts(s: AppState): string[] {
  const facts: string[] = [];
  const p = s.progress;

  if (p.answered > 0) {
    facts.push(`${p.correct} de ${p.answered} questões corretas no total`);
  }
  for (const [subjectId, v] of Object.entries(p.bySubject)) {
    if (v.answered === 0) continue;
    const name = SUBJECT_MAP[subjectId]?.name ?? subjectId;
    facts.push(`${v.correct}/${v.answered} em ${name}`);
  }
  if (p.streak > 0) facts.push(`sequência de ${p.streak} dia(s)`);
  if (p.lessonsCompleted > 0) facts.push(`${p.lessonsCompleted} aula(s) de 60s concluída(s)`);

  return facts;
}

export function logout() {
  setState((s) => {
    s.authed = false;
    return s;
  });
}

export function reset() {
  state = defaultState;
  persist();
  listeners.forEach((l) => l());
}
