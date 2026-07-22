import { useEffect, useSyncExternalStore } from "react";
import type { TutorFocus, TutorMessage } from "@/lib/tutor-prompt";
import type { LessonProgress } from "@/lib/lessons/types";
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
};

export type AppState = {
  authed: boolean;
  onboarded: boolean;
  prefs: Prefs;
  progress: Progress;
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
    /** Pergunta que o app dispara sozinho (ex.: o aluno errou). O balão consome e limpa. */
    autoPrompt: string | null;
  };
  premiumTrial: { active: boolean; startedAt: string | null };
  offline: { downloaded: boolean };
};

// v2: o quiz unificado substituiu signup+onboarding e a unidade virou "aula de 60s",
// então o formato salvo mudou o suficiente para invalidar o estado antigo.
const KEY = "flashtest.state.v2";

const defaultState: AppState = {
  authed: false,
  onboarded: false,
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
  },
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
  },
  quiz: { answers: [], gaps: [], completedAt: null },
  tutor: { open: false, messages: [], focus: null, autoPrompt: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
};

let state: AppState = defaultState;
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        ...defaultState,
        ...parsed,
        prefs: { ...defaultState.prefs, ...(parsed.prefs || {}) },
        progress: { ...defaultState.progress, ...(parsed.progress || {}) },
        quiz: { ...defaultState.quiz, ...(parsed.quiz || {}) },
        // O balão sempre volta fechado e sem foco: o histórico persiste, o
        // estado de UI não.
        tutor: { ...defaultState.tutor, messages: parsed.tutor?.messages ?? [] },
        // (open/focus/autoPrompt sempre voltam ao default: são estado de UI.)
        premiumTrial: { ...defaultState.premiumTrial, ...(parsed.premiumTrial || {}) },
        offline: { ...defaultState.offline, ...(parsed.offline || {}) },
      };
    }
  } catch {}
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
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
export function useAppState(): AppState {
  if (typeof window !== "undefined" && !loaded) {
    load();
    loaded = true;
  }
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => defaultState,
  );
}

export function useHydrated() {
  const s = useAppState();
  useEffect(() => {}, []);
  return s;
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
export function completeQuiz(answers: QuizAnswer[], gaps: Gap[]) {
  setState((s) => {
    s.quiz = { answers, gaps, completedAt: new Date().toISOString() };
    s.authed = true;
    s.onboarded = true;
    s.progress.xp += 50;
    if (s.progress.streak === 0) {
      s.progress.streak = 1;
      s.progress.lastStudyDate = new Date().toDateString();
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
    const today = new Date().toDateString();
    if (s.progress.lastStudyDate !== today) {
      s.progress.streak += 1;
      s.progress.lastStudyDate = today;
    }
    return s;
  });

  return { progress, xpAwarded, improved: !prev || bestStars > prev.stars, first: !prev };
}

/** Desbloqueio sequencial: a lição N abre quando a N-1 foi concluída. */
export function isLessonUnlocked(licoes: Array<{ id: string }>, lessonId: string, s: AppState) {
  const idx = licoes.findIndex((l) => l.id === lessonId);
  if (idx <= 0) return idx === 0;
  return Boolean(s.progress.lessons[licoes[idx - 1].id]);
}

/* ---------------------------------------------------------------- tutor --- */

export function openTutor(focus?: TutorFocus | null) {
  setState((s) => {
    s.tutor.open = true;
    if (focus !== undefined) s.tutor.focus = focus;
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
 * Abre o balão já perguntando por conta própria. É o gatilho de errar uma
 * questão: o aluno não precisa pedir para entender o próprio erro.
 */
export function askTutorAutomatically(focus: TutorFocus, prompt: string) {
  setState((s) => {
    s.tutor.open = true;
    s.tutor.focus = focus;
    s.tutor.autoPrompt = prompt;
    return s;
  });
}

export function consumeTutorAutoPrompt() {
  setState((s) => {
    s.tutor.autoPrompt = null;
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
