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
  /** Toggles sensoriais (docs/18-plano-reestilizacao-rabisco.md §10, docs/16-gamificacao-e-dopamina.md §3/§4). */
  sound: boolean;
  haptics: boolean;
  /** "auto" segue o sistema (docs/18 §12.4, D4). */
  theme: "auto" | "light" | "dark";
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
  /** O dia de hoje. Ler sempre via `atividadeHoje()`, nunca direto — vira estale à meia-noite. */
  today: {
    date: string;
    lessons: number;
    flashcards: number;
    redacao: number;
    celebrouMeta: boolean;
  };
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

// v3: rebranding para Foca (docs/17 Fase 8). O formato é o mesmo da v2; a chave
// antiga é lida uma vez e copiada, para não apagar o progresso de quem já usou.
// Os campos de honestidade da Fase 6 do docs/18 são aditivos — não precisou v4.
const KEY = "foca.state.v3";
const LEGACY_KEY = "flashtest.state.v2";

/** Data local em ISO `YYYY-MM-DD` — nunca `toISOString()`, que é UTC e vira o dia errado à noite no Brasil. */
function hojeISO(d: Date = new Date()): string {
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
  return { date: iso, lessons: 0, flashcards: 0, redacao: 0, celebrouMeta: false };
}

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
    // Primeiro uso começa com som ligado, mas com aviso visível de como
    // desligar (docs/16-gamificacao-e-dopamina.md §3, regra 3).
    sound: true,
    haptics: true,
    theme: "auto",
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
    activityDays: [],
    bestStreak: 0,
    streakFreezes: 1,
    today: todayBucketVazio(hojeISO()),
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
    let raw = localStorage.getItem(KEY);
    if (raw === null) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy !== null) {
        raw = legacy;
        localStorage.setItem(KEY, legacy);
      }
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      const iso = hojeISO();
      const parsedToday = parsed.progress?.today;
      state = {
        ...defaultState,
        ...parsed,
        prefs: { ...defaultState.prefs, ...(parsed.prefs || {}) },
        progress: {
          ...defaultState.progress,
          ...(parsed.progress || {}),
          // Vira estale à meia-noite: se o dia mudou desde a última gravação,
          // o balde de hoje reseta ao carregar (docs/18 §15 Fase 6).
          today: parsedToday && parsedToday.date === iso ? parsedToday : todayBucketVazio(iso),
        },
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
function registrarAtividade(s: AppState, tipo: "lesson" | "flashcard" | "redacao") {
  const agora = new Date();
  const iso = hojeISO(agora);
  const hojeDS = agora.toDateString();

  if (s.progress.today.date !== iso) s.progress.today = todayBucketVazio(iso);
  if (tipo === "lesson") s.progress.today.lessons += 1;
  if (tipo === "flashcard") s.progress.today.flashcards += 1;
  if (tipo === "redacao") s.progress.today.redacao += 1;

  if (!s.progress.activityDays.includes(iso)) {
    s.progress.activityDays.push(iso);
    if (s.progress.activityDays.length > 60) s.progress.activityDays.shift();
    // A cada 7 dias de atividade acumulados, +1 congelamento (docs/16 §6).
    if (s.progress.activityDays.length % 7 === 0) {
      s.progress.streakFreezes = Math.min(2, s.progress.streakFreezes + 1);
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
export function completeQuiz(answers: QuizAnswer[], gaps: Gap[]) {
  setState((s) => {
    s.quiz = { answers, gaps, completedAt: new Date().toISOString() };
    s.authed = true;
    s.onboarded = true;
    s.progress.xp += 50;
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
    registrarAtividade(s, "redacao");
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

/* ------------------------------------------------------------- aula de 60s --- */

/**
 * Registra a resposta de uma questão da aula de 60s (docs/18-plano-
 * reestilizacao-rabisco.md §15 Fase 6). Movido de `study.tsx` pra cá pra sair
 * do terceiro bloco duplicado de streak — mesmos incrementos e mesmo XP
 * (+15 acerto, +5 erro) de antes.
 *
 * NÃO chama `registrarAtividade` aqui: uma aula tem 2 questões (`LESSON_SIZE`
 * em `study.tsx`), e `docs/16` §6 conta streak/meta por AULA concluída, não
 * por questão — ver `registrarAulaConcluida()`.
 */
export function registrarResposta(
  q: { id: string; subject: string; subjectName: string; topic: string },
  correct: boolean,
) {
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
    s.progress.xp += correct ? 15 : 5;
    return s;
  });
}

/** Fecha a aula de 60s: incrementa o contador de aulas da vida E a atividade de hoje. */
export function registrarAulaConcluida() {
  setState((s) => {
    s.progress.lessonsCompleted += 1;
    registrarAtividade(s, "lesson");
    return s;
  });
}

/* -------------------------------------------------------------- flashcards --- */

/** Revisar um flashcard conta como atividade do dia (docs/16 §6: "qualquer atividade completada"). */
export function registrarRevisaoFlashcard() {
  setState((s) => {
    registrarAtividade(s, "flashcard");
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

/** Leitura honesta do balde de hoje — nunca ler `s.progress.today` direto: ele fica estale até a próxima atividade virar o dia. */
export function atividadeHoje(s: AppState): Progress["today"] {
  const iso = hojeISO();
  return s.progress.today.date === iso ? s.progress.today : todayBucketVazio(iso);
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
