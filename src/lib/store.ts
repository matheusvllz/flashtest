import { useSyncExternalStore } from "react";
import type { TutorFocus, TutorMessage } from "@/lib/tutor-prompt";
import type { PedagogicalContext } from "@/lib/tutor-context";
import type { LessonProgress } from "@/lib/lessons/types";
import type {
  Attempt,
  ExamTarget,
  FocusSession,
  LearningEvent,
  LearningEventType,
  LearningState,
  PlacementState,
  SkillModelEntry,
  StudyFocus,
  TipHistoryEntry,
} from "@/lib/learning/types";
import {
  learningStateVazio,
  LIMITE_EVENTOS,
  LIMITE_HISTORICO_DICAS,
  LIMITE_HISTORICO_JORNADA,
  LIMITE_TENTATIVAS_RECENTES,
} from "@/lib/learning/types";
import type { PlannedActivity } from "@/lib/adaptive/types";
import { recordAttemptForSkill } from "@/lib/learning/review";
import {
  BACKUP_KEY_V6,
  computeAdditiveFields,
  CURRENT_SCHEMA_VERSION,
  ensureBackup,
  parseStoredState,
} from "@/lib/state-migrations";
import { SUBJECT_MAP } from "@/data/subjects";
import { FEATURES } from "@/lib/features";
import { probabilityCorrect, updateSkill, type ItemIrtLike } from "@/lib/adaptive/model";
import { ALGO_VERSION, DESAFIO_SINAL_DIAS, PLANNER_VERSION, PESO_HABILIDADE_SECUNDARIA, PESO_REPETICAO_MESMO_DIA, PLACEMENT_APPLY_VERSION, PLACEMENT_PRIOR_MEAN, PLACEMENT_PRIOR_SD, THETA_PRIOR } from "@/lib/adaptive/constants";
import {
  advancePlacement,
  placementConcluido,
  startPlacement,
  type PlacementPoolItem,
  type PlacementScope,
} from "@/lib/adaptive/placement";

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
  /** Schema v6 (docs/30 §15) — foco PERMANENTE (não confundir com `learning.focusSession`, temporário). */
  studyFocus: StudyFocus;
  /** Schema v6 (docs/30 §12.2) — matérias que o aluno declarou "vou bem" no onboarding. */
  easySubjects: string[];
  /** Schema v6 (docs/30 §12.2/§21.1) — minutos de estudo por dia declarados; um de 5/10/15/20/30. */
  dailyMinutes: 5 | 10 | 15 | 20 | 30;
  /** Schema v6 (docs/30 §13.6) — 1 = onboarding antigo (ganha oferta de nivelamento na home), 2 = fluxo novo (já oferecido no próprio onboarding). */
  onboardingVersion: number;
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
    /** Docs/30 §17, Fase 7 — o que o motor adaptativo sabe sobre a habilidade em foco. Sempre estado de UI, nunca persiste (ver `load()`). */
    pedagogy: PedagogicalContext | null;
    /** Mensagem a enviar automaticamente assim que o balão abrir com este foco (nível 3, "Me ensina do começo") — consumida uma vez por `TutorBubble` e limpa em seguida. */
    autoSend: string | null;
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
    studyFocus: { mode: "todas", subjectIds: [], areas: [] },
    easySubjects: [],
    dailyMinutes: 10,
    // Quem cria conta agora já nasce no fluxo novo (oferta de nivelamento
    // dentro do próprio onboarding, docs/30 §12/§13.6) — só quem já existia
    // antes vira "1" na migração (`computeAdditiveFields`).
    onboardingVersion: 2,
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
  tutor: { open: false, messages: [], focus: null, pedagogy: null, autoSend: null },
  premiumTrial: { active: false, startedAt: null },
  offline: { downloaded: false },
};

let state: AppState = defaultState;
const listeners = new Set<() => void>();

let bootstrapAgendado = false;

/**
 * Dispara o bootstrap/replay do modelo adaptativo em segundo plano (docs/30
 * §9.6, Fase 5) — `import()` dinâmico de propósito, ver o comentário em
 * `load()`. `setState` já persiste e notifica os observadores quando
 * termina; se `load()` for chamada de novo antes disso (não deveria — só
 * roda 1x por sessão via `hydrate()`), a segunda chamada não dispara outra
 * vez. Falha (rede/parse) nunca quebra a sessão: o modelo só fica vazio até
 * a próxima carga da página tentar de novo.
 */
function agendarBootstrapAdaptativo(iso: string): void {
  if (bootstrapAgendado) return;
  bootstrapAgendado = true;
  void (async () => {
    try {
      const { bootstrapModel } = await import("@/lib/adaptive/bootstrap");
      setState((s) => {
        // Reconfere a condição: a sessão pode ter mudado a flag ou já
        // recebido um bootstrap por outro caminho entre o agendamento e a
        // resolução do import (raro, mas o `setState` não pode assumir que
        // nada mudou).
        if (FEATURES.masteryModel === "off" || s.learning.modelMeta.algoVersion >= ALGO_VERSION) return s;
        s.learning.skillModel = bootstrapModel(s, iso);
        s.learning.modelMeta = { algoVersion: ALGO_VERSION, bootstrappedAt: iso };
        return s;
      });
    } catch {
      // Sem bootstrap nesta sessão — nada quebra; a próxima carga tenta de novo.
    } finally {
      bootstrapAgendado = false;
    }
  })();
}

/**
 * Estado de runtime da persistência (docs/36 T-05.1…T-05.3; §H "Estado de
 * persistência"). NÃO é persistido nem faz parte de `AppState`: é o que o
 * `PersistenceBanner` precisa saber para nunca fingir que salvou.
 * - `persist`: `"ok"` | `"falhou"` (a última gravação lançou: quota/storage
 *   bloqueado) | `"versao-futura"` (o storage veio de uma versão mais nova do
 *   app: não gravamos nada por cima — RU-6).
 * - `recuperouCorrompido`: o JSON salvo estava ilegível, foi copiado para
 *   `foca.state.corrupt.<ISO>` e o app recomeçou do padrão (RU-5).
 * Objeto imutável (troca de referência a cada mudança) para servir de snapshot
 * do `useSyncExternalStore`.
 */
export type PersistStatus = "ok" | "falhou" | "versao-futura";
interface RuntimeStatus {
  persist: PersistStatus;
  recuperouCorrompido: boolean;
}
let runtime: RuntimeStatus = { persist: "ok", recuperouCorrompido: false };
const runtimeListeners = new Set<() => void>();
/** Prefixo da cópia do JSON ilegível (`foca.state.corrupt.<ISO>`). */
export const CORRUPT_KEY_PREFIX = "foca.state.corrupt.";

/**
 * Guarda o bruto ilegível numa chave à parte, sem acumular: se já existe uma cópia
 * idêntica (recarga sem interação), não cria outra (docs/36 T-05.3; achado D-001 da
 * revisão de segurança — cópias sem limite podiam consumir a cota do localStorage).
 */
function guardarCopiaCorrompida(raw: string): void {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CORRUPT_KEY_PREFIX) && localStorage.getItem(k) === raw) return;
    }
    localStorage.setItem(CORRUPT_KEY_PREFIX + new Date().toISOString(), raw);
  } catch {
    // sem espaço: a cópia é melhor-esforço.
  }
}
/** Storage de versão futura: nenhuma gravação até recarregar a página com o app novo (RU-6). */
let versaoFuturaAtiva = false;

function setRuntime(patch: Partial<RuntimeStatus>) {
  const next = { ...runtime, ...patch };
  if (next.persist === runtime.persist && next.recuperouCorrompido === runtime.recuperouCorrompido) return;
  runtime = next;
  runtimeListeners.forEach((l) => l());
}

/**
 * Monta o `AppState` a partir do JSON já parseado + campos aditivos. Usada
 * pelo `load()` (boot) e pela adoção do que outra aba gravou (T-05.2), para
 * que as duas leituras tenham exatamente as mesmas regras.
 */
function montarEstado(
  parsed: Record<string, unknown>,
  aditivos: ReturnType<typeof computeAdditiveFields>,
  iso: string,
): AppState {
  const parsedProgress = (parsed.progress ?? {}) as Partial<Progress>;
  const parsedToday = parsedProgress.today;
  return {
    ...defaultState,
    ...parsed,
    schemaVersion: aditivos.schemaVersion,
    prefs: {
      ...defaultState.prefs,
      ...((parsed.prefs as Partial<Prefs>) || {}),
      examTargets: aditivos.examTargets,
      showExamTips: aditivos.showExamTips,
      trailSubjectId: aditivos.trailSubjectId,
      studyFocus: aditivos.studyFocus,
      easySubjects: aditivos.easySubjects,
      dailyMinutes: aditivos.dailyMinutes,
      onboardingVersion: aditivos.onboardingVersion,
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
    quiz: { ...defaultState.quiz, ...((parsed.quiz as Partial<AppState["quiz"]>) || {}) },
    // O balão sempre volta fechado e sem foco: o histórico persiste, o
    // estado de UI não.
    tutor: {
      ...defaultState.tutor,
      messages: ((parsed.tutor as { messages?: TutorMessage[] } | undefined)?.messages ??
        []) as TutorMessage[],
    },
    // (open/focus sempre voltam ao default: são estado de UI. Um `autoPrompt`
    // de storage antigo, pré-docs/20, cai fora daqui sem ser executado.)
    premiumTrial: {
      ...defaultState.premiumTrial,
      ...((parsed.premiumTrial as Partial<AppState["premiumTrial"]>) || {}),
    },
    offline: { ...defaultState.offline, ...((parsed.offline as Partial<AppState["offline"]>) || {}) },
  } as AppState;
}

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
    if (!parsed) {
      // Storage ilegível: segue com defaultState, mas ANTES de qualquer
      // gravação (a 1ª mutação sobrescreve a chave principal) guarda o bruto
      // numa chave à parte para recuperação manual (docs/36 T-05.3, RF-16).
      // Máx. 1 cópia por conteúdo (não duplica em recargas); se nem a cópia couber, o aviso sai mesmo assim.
      guardarCopiaCorrompida(raw);
      setRuntime({ recuperouCorrompido: true });
      return;
    }

    const iso = hojeISO();
    ensureBackup(
      raw,
      (k) => localStorage.getItem(k),
      (k, v) => localStorage.setItem(k, v),
    );
    // Backup dedicado da migração v6 (docs/30 §21.1/§24.1) — mesma regra:
    // uma vez, nunca sobrescrito (`ensureBackup` já no-opa se a chave existir).
    ensureBackup(
      raw,
      (k) => localStorage.getItem(k),
      (k, v) => localStorage.setItem(k, v),
      BACKUP_KEY_V6,
    );
    const aditivos = computeAdditiveFields(parsed, iso);

    state = montarEstado(parsed, aditivos, iso);

    // Versão futura (docs/36 T-05.1, RU-6): nada é gravado por cima — nem no
    // boot, nem em `setState` — enquanto esta página estiver aberta.
    if (aditivos.futureVersion) {
      versaoFuturaAtiva = true;
      setRuntime({ persist: "versao-futura" });
    }

    // Bootstrap/replay do modelo adaptativo (docs/30 §9.6, Fase 5) — só
    // quando o algoritmo mudou de versão desde a última gravação (inclusive
    // nunca ter rodado, algoVersion 0), a versão do storage não é futura
    // (mesma regra do resto da migração) E a flag não está "off" — desligada
    // quer dizer inerte de verdade, zero computação, não só escondida da UI.
    //
    // ADIADO por `import()` dinâmico (`agendarBootstrapAdaptativo` abaixo),
    // de propósito: `src/lib/adaptive/bootstrap.ts` importa `@/content/items`
    // e `@/content/taxonomy`, que arrastam TODO o catálogo de conteúdo (15
    // trilhas, ~580 KB minificados). `store.ts` é importado por praticamente
    // toda tela (via `AppShell`) — um `import` estático aqui juntava esse
    // catálogo inteiro no chunk de toda rota, não só de `/trilha`/`/redacao`
    // (achado real desta sessão: comparar `dist/assets/AppShell-*.js` antes
    // e depois — 835 KB vs. a soma anterior de AppShell + chunk `trilhas-*`
    // separado). `load()` continua 100% síncrono; o bootstrap roda em
    // segundo plano, sem bloquear a primeira renderização.
    if (
      !aditivos.futureVersion &&
      FEATURES.masteryModel !== "off" &&
      state.learning.modelMeta.algoVersion < ALGO_VERSION
    ) {
      agendarBootstrapAdaptativo(iso);
    }

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

/**
 * `false` quando a escrita falhou (quota, storage bloqueado) ou foi recusada
 * (versão futura) — o chamador NUNCA deve anunciar persistência bem-sucedida
 * nesse caso (docs/20 §15.3, item 9). O estado em memória continua correto de
 * qualquer forma. Atualiza o estado de runtime que o `PersistenceBanner` lê
 * (docs/36 T-05.1): falha → `"falhou"`; a próxima gravação que der certo volta
 * a `"ok"`. Sem `window` (SSR/testes de motor) não há storage: devolve `false`
 * sem tocar o status, para não acusar falha onde nunca houve tentativa.
 */
function persist(): boolean {
  if (typeof window === "undefined") return false;
  if (versaoFuturaAtiva) {
    setRuntime({ persist: "versao-futura" });
    return false;
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    setRuntime({ persist: "ok" });
    return true;
  } catch {
    console.warn("[store] não foi possível salvar — a sessão continua em memória.");
    setRuntime({ persist: "falhou" });
    return false;
  }
}

/**
 * "Tentar de novo" do banner (docs/36 T-05.1): regrava o estado atual em
 * memória. `true` só se gravou de verdade; em versão futura devolve `false`
 * (a saída é recarregar a página, não tentar de novo).
 */
export function retryPersist(): boolean {
  return persist();
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

/**
 * Adota o que OUTRA aba gravou (docs/36 T-05.2, RF-15): evento `storage` com
 * a nossa chave → mesmo parse/migração do boot, sem gravar de volta (senão as
 * duas abas trocariam escritas para sempre) e sem reagendar bootstrap. Fica
 * de fora o que é estado de UI (balão aberto, foco, contexto pedagógico): só
 * as mensagens do tutor vêm do storage. `newValue` nulo (a outra aba limpou o
 * storage) e valor ilegível são ignorados — nunca apagam o que esta aba tem.
 * Um storage de versão futura não é adotado: trava as gravações desta aba
 * também (RU-6), para não sobrescrever dados que este código não entende.
 */
function adotarGravacaoDeOutraAba(raw: string | null): void {
  if (!raw) return;
  try {
    const { parsed } = parseStoredState(raw);
    if (!parsed) return;
    const iso = hojeISO();
    const aditivos = computeAdditiveFields(parsed, iso);
    if (aditivos.futureVersion) {
      versaoFuturaAtiva = true;
      setRuntime({ persist: "versao-futura" });
      return;
    }
    const novo = montarEstado(parsed, aditivos, iso);
    state = { ...novo, tutor: { ...state.tutor, messages: novo.tutor.messages } };
    listeners.forEach((l) => l());
  } catch {
    // Leitura defensiva: um valor estranho de outra aba nunca derruba esta.
  }
}

function aoMudarStorage(e: StorageEvent) {
  if (e.key !== KEY) return;
  adotarGravacaoDeOutraAba(e.newValue);
}

/** Leitura pontual (sem hook) do estado de runtime — testes e código fora do React. */
export function getRuntimeStatus(): Readonly<{ persist: PersistStatus; recuperouCorrompido: boolean }> {
  return runtime;
}

/** Estado de persistência para o `PersistenceBanner` (docs/36 T-05.1). Nunca lê o `AppState`. */
export function usePersistStatus(): PersistStatus {
  hydrate();
  return useSyncExternalStore(
    subscribeRuntime,
    () => runtime.persist,
    () => "ok" as PersistStatus,
  );
}

/** `true` uma vez, quando o boot recuperou um JSON ilegível (RU-5, T-05.3). */
export function useCorruptRecoveryNotice(): boolean {
  hydrate();
  return useSyncExternalStore(
    subscribeRuntime,
    () => runtime.recuperouCorrompido,
    () => false,
  );
}

/** O aluno tocou "Ok" no aviso de storage recuperado. */
export function dismissCorruptRecoveryNotice(): void {
  setRuntime({ recuperouCorrompido: false });
}

function subscribeRuntime(cb: () => void) {
  runtimeListeners.add(cb);
  return () => runtimeListeners.delete(cb);
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
    // Uma vez por página (docs/36 T-05.2): a aba em segundo plano adota o que
    // a outra gravou antes da próxima mutação dela.
    window.addEventListener("storage", aoMudarStorage);
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

/**
 * Esta TENTATIVA (sessão que começou em `sessionStartedAt`) já registrou a conclusão da lição? Vale
 * quando o registro tem `completedAt >= sessionStartedAt`: a mesma regra que `syncJourneyWithCompletions`
 * usa para "conclusão desta tentativa". Sem `sessionStartedAt` (chamador que não sabe) nunca bloqueia —
 * o comportamento de sempre (replay conta como atividade e paga só a diferença de XP).
 * Fecha a janela em que a conclusão foi gravada mas a sessão ativa ainda existe (fechar/recarregar o app
 * entre as duas gravações, ou 2 abas na tela de resultado) sem inflar `today.lessons`/blocos do dia.
 */
export function conclusaoJaContada(completedAt: string | undefined, sessionStartedAt: string | undefined): boolean {
  return Boolean(sessionStartedAt && typeof completedAt === "string" && completedAt >= sessionStartedAt);
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
  opts: { sessionStartedAt?: string } = {},
): CompleteLessonResult {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const stars = starsForPct(pct);
  const prev = getState().progress.lessons[lessonId];
  // Idempotência por tentativa (docs/36 G-3): se a conclusão registrada é POSTERIOR ao início desta
  // tentativa, ela já foi contada — nada de novo bloco do dia, contagem de lições nem XP.
  if (prev && conclusaoJaContada(prev.completedAt, opts.sessionStartedAt)) {
    return { progress: prev, xpAwarded: 0, improved: false, first: false };
  }
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
  opts: { sessionStartedAt?: string } = {},
): CompleteMicroLessonResult {
  const pct = totalPractice > 0 ? Math.round((correctPractice / totalPractice) * 100) : 0;
  const stars = starsForPct(pct);
  const prev = getState().learning.completedLessons[lessonId];
  // Idempotência por tentativa (docs/36 G-3), igual à de `completeLesson`.
  if (prev && conclusaoJaContada(prev.completedAt, opts.sessionStartedAt)) {
    return { xpAwarded: 0, alreadyCompleted: true, stars: prev.stars };
  }
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
/**
 * Fase 5 (docs/30 §9.4/§21.1, modo sombra) — atualiza `learning.skillModel`
 * NA MESMA transação da tentativa, só quando `FEATURES.masteryModel !==
 * "off"`. A habilidade principal (`attempt.skillIds[0]`) recebe peso cheio;
 * as demais (item multi-habilidade) recebem `PESO_HABILIDADE_SECUNDARIA`.
 * Repetir o MESMO item no MESMO dia local pesa `PESO_REPETICAO_MESMO_DIA`
 * (combinado por multiplicação com o peso de secundária, se os dois
 * acontecerem juntos). `predictedP` é gravado na tentativa ANTES da
 * atualização (probabilidade prevista pelo modelo, só diagnóstico —
 * docs/30 §27), usando a habilidade principal.
 */
/**
 * `meta` é passado pelo CHAMADOR (docs/30 §21.1) — `store.ts` de propósito
 * não importa `@/content/items` aqui: esse módulo arrasta `@/content/
 * microlicoes`/`@/content/trilhas` (o catálogo inteiro, ~580 KB), e
 * `store.ts` é importado por quase toda tela via `AppShell`. Quem já sabe o
 * item (o player, que já resolveu o exercício pra renderizar) passa a
 * dificuldade/IRT prontos; sem `meta`, o modelo simplesmente não atualiza
 * pra esta tentativa (seguro — a flag `masteryModel` também tem que estar
 * ligada, e hoje só `useLearningSession` passa `meta`).
 */
function aplicarModeloAdaptativo(
  s: AppState,
  attempt: Attempt,
  repetidoHoje: boolean,
  meta: { irt: ItemIrtLike; difficulty?: 1 | 2 | 3 | 4 | 5 } | undefined,
): Attempt {
  if (FEATURES.masteryModel === "off" || attempt.skillIds.length === 0 || !meta) return attempt;

  const assisted = attempt.assisted ?? (attempt.hintUsed || attempt.tutorUsed);
  const entradaPrimaria = s.learning.skillModel[attempt.skillIds[0]];
  const predictedP =
    attempt.response === "dont-know"
      ? undefined
      : probabilityCorrect(entradaPrimaria?.theta ?? THETA_PRIOR, meta.irt);

  attempt.skillIds.forEach((skillId, indice) => {
    const secundaria = indice > 0;
    const multiplicador =
      (secundaria ? PESO_HABILIDADE_SECUNDARIA : 1) * (repetidoHoje ? PESO_REPETICAO_MESMO_DIA : 1);
    s.learning.skillModel[skillId] = updateSkill(
      s.learning.skillModel[skillId],
      skillId,
      { role: attempt.role, correct: attempt.correct, response: attempt.response, assisted },
      meta.irt,
      attempt.localDate,
      { difficulty: meta.difficulty, weightMultiplier: multiplicador },
    );
  });

  return predictedP !== undefined ? { ...attempt, predictedP } : attempt;
}

/**
 * `itemMeta` é opcional e vem do CHAMADOR (docs/30 §21.1 — ver o comentário
 * em `aplicarModeloAdaptativo`): quem já resolveu o exercício pra
 * renderizar (ex. `useLearningSession`, via `itemMetaOf` de `@/content/
 * items`) passa a dificuldade/IRT prontos. Sem isso, a tentativa é gravada
 * normalmente (evidência/agenda/XP — nada disso depende de `itemMeta`), só
 * o modelo de Mastery/Confidence não atualiza pra ela.
 */
export function recordLearningAttempt(
  attempt: Attempt,
  itemMeta?: { irt: ItemIrtLike; difficulty?: 1 | 2 | 3 | 4 | 5 },
): void {
  setState((s) => {
    // Idempotência (docs/36 RF-6, C4d): a mesma tentativa (mesmo `attempt.id`)
    // nunca empilha duas vezes — nem modelo, nem evidência, nem agenda.
    if (s.learning.recentAttempts.some((a) => a.id === attempt.id)) return s;
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
    const repetidoHoje = anteriores.some(
      (a) => a.exerciseId === attempt.exerciseId && a.localDate === attempt.localDate,
    );

    const attemptFinal = aplicarModeloAdaptativo(s, attempt, repetidoHoje, itemMeta);

    s.learning.recentAttempts.push(attemptFinal);
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

/* ------------------------------------------------------ aprendizagem adaptativa (docs/30, Fase 4 do docs/31) --- */

/** Foco PERMANENTE (docs/30 §15) — distinto de `startFocusSession` (temporária, "só hoje"). */
export function setStudyFocus(focus: StudyFocus) {
  setState((s) => {
    s.prefs.studyFocus = focus;
    const agora = new Date();
    const evento: LearningEvent = {
      type: "focus-changed",
      at: agora.toISOString(),
      localDate: hojeISO(agora),
      meta: { escopo: "permanente", subjectIds: focus.subjectIds.join(",") },
    };
    s.learning.events.push(evento);
    if (s.learning.events.length > LIMITE_EVENTOS) s.learning.events.shift();
    return s;
  });
}

export function setEasySubjects(subjectNames: string[]) {
  setState((s) => {
    s.prefs.easySubjects = subjectNames;
    return s;
  });
}

export function setDailyMinutes(minutes: 5 | 10 | 15 | 20 | 30) {
  setState((s) => {
    s.prefs.dailyMinutes = minutes;
    return s;
  });
}

/** Sessão de foco "só hoje" (docs/30 §15) — expira sozinha no fim do dia local (lida por `parseFocusSession` na migração). */
export function startFocusSession(subjectIds: string[]) {
  setState((s) => {
    const agora = new Date();
    s.learning.focusSession = { subjectIds, startedAt: agora.toISOString(), expiresOn: hojeISO(agora) };
    const evento: LearningEvent = {
      type: "focus-changed",
      at: agora.toISOString(),
      localDate: hojeISO(agora),
      meta: { escopo: "sessao", subjectIds: subjectIds.join(",") },
    };
    s.learning.events.push(evento);
    if (s.learning.events.length > LIMITE_EVENTOS) s.learning.events.shift();
    return s;
  });
}

export function clearFocusSession() {
  setState((s) => {
    s.learning.focusSession = null;
    return s;
  });
}

/**
 * "Só hoje" vencido some sem precisar recarregar o app (docs/36 RF-9): antes só
 * `load()` podava `focusSession` (via `parseFocusSession`). Não grava nada se
 * não há sessão vencida — chamada no efeito da Home e no `visibilitychange`.
 * Devolve `true` quando limpou.
 */
export function clearExpiredFocusSession(hoje: string = hojeISO()): boolean {
  const fs = getState().learning.focusSession;
  if (!fs || fs.expiresOn >= hoje) return false;
  setState((s) => {
    s.learning.focusSession = null;
    return s;
  });
  return true;
}

/* --------------------------------------------------------- nivelamento (docs/30 §12.3, Fase 13 do docs/31) --- */

/**
 * `scope`/`item`/pool vêm do CHAMADOR (a rota `/nivelamento`, que já paga o
 * custo de `@/content/taxonomy`/`@/content/items`) — `store.ts` só chama
 * `@/lib/adaptive/placement` (motor puro, sem import de conteúdo), nunca
 * `placement-pool.ts` (mesma regra de fronteira de bundle de
 * `aplicarModeloAdaptativo` acima).
 */

/** Começa um nivelamento novo, OU retoma o que já está em andamento/abandonado sem apagar respostas (docs/30 §12.3, caso de borda). */
export function beginPlacement(seed: string) {
  setState((s) => {
    if (s.learning.placement && s.learning.placement.status !== "concluido") return s;
    s.learning.placement = startPlacement(seed, new Date().toISOString());
    return s;
  });
}

/**
 * Grava o `PlacementState` calculado pelo CHAMADOR (a rota `/nivelamento`,
 * via `pickPlacementItem`/`placementConcluido` de `@/lib/adaptive/
 * placement`, que às vezes fecha uma área sozinho quando o pool acaba antes
 * de bater SE/limite — docs/32 Fase 13). Setter genérico, sem regra própria.
 */
export function setPlacementState(state: PlacementState) {
  setState((s) => {
    s.learning.placement = state;
    return s;
  });
}

/** Marca o nivelamento em andamento como abandonado — respostas já dadas continuam contando; "Continuar" retoma dali (docs/30 §12.3). */
export function abandonPlacement() {
  setState((s) => {
    if (s.learning.placement?.status === "em-andamento") {
      s.learning.placement = { ...s.learning.placement, status: "abandonado" };
    }
    return s;
  });
}

/**
 * Registra UMA resposta do nivelamento: recalcula o θ̂/SE da área
 * (`learning.placement`) e, na mesma transação, atualiza Mastery/Confidence
 * de VERDADE da habilidade do item via `updateSkill` (papel "diagnostico",
 * peso 1,2 — docs/30 §12.3) — a habilidade medida diretamente vira
 * `source: "evidencia"` na hora, não fica presa esperando o fim do
 * nivelamento. `itemsById` precisa conter TODO item já respondido nesta
 * área (o motor recalcula o EAP inteiro a cada resposta) — a rota mantém
 * esse mapa conforme os itens vão sendo mostrados.
 */
export function submitPlacementResponse(
  scope: PlacementScope,
  itemsById: Map<string, PlacementPoolItem>,
  item: PlacementPoolItem,
  correct: boolean,
  dontKnow: boolean,
) {
  setState((s) => {
    const antes = s.learning.placement;
    if (!antes) return s;
    // Guardas (docs/36 RF-10, T-03.1): nunca conta uma resposta depois do fechamento,
    // nem o mesmo item duas vezes (duplo toque, re-render, remontagem) — a checagem
    // é feita dentro do mutator, sobre o estado FRESCO.
    if (antes.status === "concluido") return s;
    const areaAntes = antes.areas[item.area];
    if (areaAntes?.itemIds.includes(item.id)) return s;
    const thetaColdStart = areaAntes?.theta ?? PLACEMENT_PRIOR_MEAN;
    const seColdStart = areaAntes?.se ?? PLACEMENT_PRIOR_SD;

    let depois = advancePlacement(antes, scope, item, correct, dontKnow, itemsById);

    const entradaAtual = s.learning.skillModel[item.skillId];
    s.learning.skillModel[item.skillId] = updateSkill(
      entradaAtual,
      item.skillId,
      { role: "diagnostico", correct, response: dontKnow ? "dont-know" : "answered" },
      item.irt,
      hojeISO(),
      entradaAtual ? {} : { prior: { theta: thetaColdStart, sigma: seColdStart, source: "prior-nivelamento" } },
    );

    if (placementConcluido(depois, scope)) {
      const agora = new Date();
      depois = { ...depois, status: "concluido", finishedAt: agora.toISOString() };
      const evento: LearningEvent = {
        type: "placement-completed",
        at: agora.toISOString(),
        localDate: hojeISO(agora),
      };
      s.learning.events.push(evento);
      if (s.learning.events.length > LIMITE_EVENTOS) s.learning.events.shift();
    }
    s.learning.placement = depois;
    return s;
  });
}

/**
 * Fecha o nivelamento: substitui `learning.skillModel` pelo resultado de
 * `applyPlacement` (Fase 13 F13.5) — já calculado pelo CHAMADOR (a tela de
 * resultado, que importa `placement-pool.ts`). Habilidades medidas
 * diretamente já chegaram como `"evidencia"` via `submitPlacementResponse`;
 * esta troca só acrescenta os priors das habilidades não medidas.
 *
 * @deprecated docs/36 T-03.3: sem chamadores em `src`. Substituída por
 * `applyPlacementOutcome`, que é idempotente e faz tudo numa transação só.
 * Mantida (com o teste dela) só até a Fase 10 decidir remover.
 */
export function finishPlacement(skillModelComPriors: Record<string, SkillModelEntry>) {
  setState((s) => {
    s.learning.skillModel = skillModelComPriors;
    return s;
  });
}

/**
 * Aplica o resultado do nivelamento UMA vez, numa única transação (docs/36
 * T-03.3, RF-10/RF-11; bug C1/B3): mescla os priors no `skillModel`, marca
 * `placement.appliedAt`/`appliedVersion`, esvazia a fila preservando a atividade
 * iniciada e registra o evento `placement-applied`.
 *
 * O `skillModel` de `o` foi calculado fora (`computePlacementOutcome`, que
 * importa conteúdo — o store nunca importa) sobre uma fotografia anterior do
 * estado. Por isso a guarda é reconferida no estado FRESCO dentro do mutator e a
 * mescla nunca deixa um prior (ou evidência mais velha) sobrescrever uma
 * entrada `"evidencia"` gravada nesse meio-tempo.
 *
 * Devolve `true` se aplicou; `false` (sem tocar em nada) se não há placement
 * `concluido` ou se ele já foi aplicado.
 */
export function applyPlacementOutcome(o: {
  skillModel: Record<string, SkillModelEntry>;
  appliedAt: string;
  /** Itens respondidos que o catálogo não resolveu mais (só vai para o evento, como `meta.ausentes`). */
  ausentes?: number;
}): boolean {
  let aplicou = false;
  setState((s) => {
    const p = s.learning.placement;
    if (!p || p.status !== "concluido" || p.appliedAt) return s;
    const fresco = s.learning.skillModel;
    const mesclado: Record<string, SkillModelEntry> = { ...fresco };
    for (const [id, entrada] of Object.entries(o.skillModel)) {
      const atual = fresco[id];
      if (atual?.source === "evidencia" && (entrada.source !== "evidencia" || atual.updatedAt >= entrada.updatedAt)) continue;
      mesclado[id] = entrada;
    }
    s.learning.skillModel = mesclado;
    s.learning.placement = { ...p, appliedAt: o.appliedAt, appliedVersion: PLACEMENT_APPLY_VERSION };
    // A atividade INICIADA nunca sai do topo por replano (docs/36 RF-8).
    const ativa = s.learning.journey.activeActivity;
    s.learning.journey.committed = ativa ? [ativa] : [];
    s.learning.journey.upcoming = [];
    const agora = new Date();
    pushEvento(s, {
      type: "placement-applied",
      at: agora.toISOString(),
      localDate: hojeISO(agora),
      ...(o.ausentes ? { meta: { ausentes: o.ausentes } } : {}),
    });
    aplicou = true;
    return s;
  });
  return aplicou;
}

/**
 * Anel de eventos locais (docs/30 §21.4) — nunca enviado, só pro painel de
 * debug (Fase 8) e pra diagnosticar o motor adaptativo. `recordEvent` é a
 * ÚNICA função que grava em `learning.events` — chamadores não empurram
 * direto no array.
 */
export function recordEvent(
  type: LearningEventType,
  extra?: { skillId?: string; activityId?: string; meta?: Record<string, string | number | boolean> },
): void {
  setState((s) => {
    const agora = new Date();
    const evento: LearningEvent = {
      type,
      at: agora.toISOString(),
      localDate: hojeISO(agora),
      ...extra,
    };
    s.learning.events.push(evento);
    if (s.learning.events.length > LIMITE_EVENTOS) s.learning.events.shift();
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

/**
 * Aponta a IA para a questão da vez. `null` desfoca (fora da aula). Sempre
 * zera `pedagogy`: esta função não recebe contexto pedagógico novo, e
 * mantê-lo do foco anterior deixaria a IA falando da habilidade ERRADA
 * quando a questão muda sem passar por `openTutorWithContext` (ex.:
 * `study.tsx` atualizando o foco a cada nova questão da aula).
 */
export function setTutorFocus(focus: TutorFocus | null) {
  setState((s) => {
    s.tutor.focus = focus;
    s.tutor.pedagogy = null;
    return s;
  });
}

/**
 * Abre o balão e fixa o contexto da questão da vez — ação explícita dos CTAs
 * "Perguntar à Foca" / "Explicar melhor" (docs/20 §4.2). Nunca chama a API
 * sozinho: só quando o aluno digitar, tocar numa sugestão OU pedir
 * explicitamente o nível 3 ("Me ensina do começo", via `opts.autoSend`) é
 * que uma mensagem sai — nesse último caso a intenção já É a mensagem
 * automática, não uma chamada escondida.
 *
 * `opts.pedagogy` (docs/30 §17, Fase 7): montado por quem já paga o custo
 * do import de conteúdo (`tutor-context.ts#buildPedagogicalContext`,
 * chamado pela TELA, nunca por aqui — ver o aviso de bundle no topo do
 * próprio `tutor-context.ts`).
 */
export function openTutorWithContext(
  focus: TutorFocus,
  opts?: { pedagogy?: PedagogicalContext | null; autoSend?: string | null },
) {
  setState((s) => {
    s.tutor.open = true;
    s.tutor.focus = focus;
    s.tutor.pedagogy = opts?.pedagogy ?? null;
    s.tutor.autoSend = opts?.autoSend ?? null;
    // Observabilidade (docs/30 §21.4, Fase 8): só quando abre COM contexto
    // pedagógico — o botão flutuante genérico (`openTutor`) não conta como
    // "pediu ajuda pra habilidade X", não tem habilidade nenhuma em jogo.
    if (opts?.pedagogy) {
      const agora = new Date();
      const evento: LearningEvent = {
        type: "ai-help-opened",
        at: agora.toISOString(),
        localDate: hojeISO(agora),
        skillId: opts.pedagogy.skillId,
        meta: { mode: opts.pedagogy.mode },
      };
      s.learning.events.push(evento);
      if (s.learning.events.length > LIMITE_EVENTOS) s.learning.events.shift();
    }
    return s;
  });
}

/** Consumida por `TutorBubble` depois de disparar o auto-envio do nível 3 — evita reenvio em re-render. */
export function clearTutorAutoSend() {
  setState((s) => {
    s.tutor.autoSend = null;
    return s;
  });
}

/* ------------------------------------------------------------- jornada (docs/30 §14, Fase 12) --- */

/**
 * Ações "burras" da jornada — só gravam dados já decididos. A DECISÃO (o
 * plano em si, via `planWithFallback`) é sempre de quem chama
 * (`src/lib/adaptive/journey.ts#ensurePlan` + a tela/hook), nunca daqui —
 * `store.ts` não pode importar `@/lib/adaptive/journey` nem `/index`
 * (puxam taxonomia/itens; guardado por `store-bundle-boundary.test.ts`).
 */
export function commitPlan(committed: PlannedActivity[], upcoming: PlannedActivity[], focusSignature?: string) {
  setState((s) => {
    s.learning.journey.committed = committed;
    s.learning.journey.upcoming = upcoming;
    // Versão do PLANEJADOR (docs/36 RP-5): separada de `ALGO_VERSION` (modelo).
    s.learning.journey.planVersion = PLANNER_VERSION;
    // Foco vigente no momento deste plano (docs/36 RF-9) — a Home compara com a
    // assinatura atual pra detectar mudança feita em QUALQUER tela.
    if (focusSignature !== undefined) s.learning.journey.focusSignature = focusSignature;
    return s;
  });
}

/** Próximo valor do contador monotônico da jornada (docs/36 §H, RF-7): default `history.length`, nunca diminui. */
function bumpJourneySeq(j: AppState["learning"]["journey"]) {
  j.seq = (j.seq ?? j.history.length) + 1;
}

function attemptKeyOf(activity: Pick<PlannedActivity, "id" | "startedAt">): string {
  return `${activity.id}@${activity.startedAt ?? "sem-inicio"}`;
}

function pushEvento(s: AppState, evento: LearningEvent) {
  s.learning.events.push(evento);
  if (s.learning.events.length > LIMITE_EVENTOS) s.learning.events.shift();
}

/**
 * Esvazia `committed`/`upcoming` sem decidir nada (ação "burra", mesmo
 * contrato de `commitPlan`) — força `ensurePlan` a replanejar da próxima vez
 * que `/trilha` montar, mesmo que essa montagem seja a PRIMEIRA depois de uma
 * navegação entre rotas (o guard de `ensurePlan` é só `committed.length <
 * COMMITTED_SIZE`, então não depende de comparar com um valor anterior "ainda
 * vivo" em memória, ao contrário do guard de `forceReplan` por mudança de
 * foco). Usado quando algo muda os PRIORS de fora da própria tela da jornada
 * — hoje só o nivelamento (docs/30 §12, achado de teste em dispositivo
 * físico docs/32 F15.3): sem isto, a trilha voltava do nivelamento com o
 * mesmo plano de antes, porque `committed` já estava cheio e `planVersion`
 * em dia.
 */
export function invalidateJourneyPlan() {
  setState((s) => {
    // A atividade INICIADA nunca sai do topo por replano (docs/36 RF-8).
    const ativa = s.learning.journey.activeActivity;
    s.learning.journey.committed = ativa ? [ativa] : [];
    s.learning.journey.upcoming = [];
    return s;
  });
}

/**
 * Marca o INÍCIO de uma tentativa (docs/36 RF-2, T-02.1) — ação "burra": num
 * único `setState`. Reentrar na mesma atividade nunca troca `startedAt` (a
 * tentativa é uma só) nem sobrescreve `itemIds` já escolhidos; o evento
 * `activity-started` só sai na primeira vez. Devolve a atividade gravada.
 *
 * A SELEÇÃO de itens de atividade dinâmica é da rota `/atividade/$activityId`
 * (único proprietário) — quem só navega (aula/legado) chama esta ação SEM itens.
 */
export function startJourneyActivity(activity: PlannedActivity): PlannedActivity {
  let gravada: PlannedActivity = activity;
  setState((s) => {
    const agora = new Date();
    const atual = s.learning.journey.activeActivity;
    let jaIniciada = false;
    if (atual && atual.id === activity.id) {
      jaIniciada = Boolean(atual.startedAt);
      gravada = {
        ...atual,
        ...activity,
        startedAt: atual.startedAt ?? agora.toISOString(),
        itemIds: atual.itemIds && atual.itemIds.length > 0 ? atual.itemIds : (activity.itemIds ?? atual.itemIds),
      };
    } else {
      gravada = { ...activity, startedAt: agora.toISOString() };
    }
    s.learning.journey.activeActivity = gravada;
    if (!jaIniciada) {
      pushEvento(s, {
        type: "activity-started",
        at: agora.toISOString(),
        localDate: hojeISO(agora),
        activityId: activity.id,
        skillId: activity.skillIds[0],
      });
    }
    return s;
  });
  return gravada;
}

/** @deprecated Alias de `startJourneyActivity` (docs/36 T-02.1) — mantido só para compatibilidade; código novo chama a ação nova. */
export function setActiveActivity(activity: PlannedActivity) {
  startJourneyActivity(activity);
}

/**
 * Descarta uma atividade que não dá pra cumprir (docs/36 RF-3, T-02.2): sai de
 * `committed` e de `activeActivity` (se o id bater), o contador `seq` avança
 * (o próximo plano não reusa o id) e um evento `activity-skipped` registra o
 * motivo. NÃO paga XP, NÃO entra no histórico, NÃO mexe em `sinceCheckpoint`
 * nem no bloco do dia — descartar não é estudar.
 */
export function discardJourneyActivity(id: string, reason: "sem-itens" | "conteudo-removido") {
  setState((s) => {
    const j = s.learning.journey;
    const ehAtiva = j.activeActivity?.id === id;
    const alvo = j.committed.find((a) => a.id === id) ?? (ehAtiva ? j.activeActivity : null);
    // Idempotente: descartar o que já não está na fila (StrictMode, duplo disparo) não conta de novo.
    if (!alvo) return s;
    j.committed = j.committed.filter((a) => a.id !== id);
    if (ehAtiva) j.activeActivity = null;
    bumpJourneySeq(j);
    const agora = new Date();
    pushEvento(s, {
      type: "activity-skipped",
      at: agora.toISOString(),
      localDate: hojeISO(agora),
      activityId: id,
      skillId: alvo?.skillIds[0],
      meta: { reason },
    });
    return s;
  });
}

/** `YYYY-MM-DD` local + `dias` (sem UTC, mesma aritmética de `review.ts`). */
function somaDiasLocal(dataISO: string, dias: number): string {
  const d = new Date(`${dataISO}T00:00:00`);
  d.setDate(d.getDate() + dias);
  return hojeISO(d);
}

/**
 * Recalibração pós-checkpoint (docs/36 T-04.4, RP-4, G7 do `32`).
 * - `antecipar` (superestimadas — o modelo achava que sabia e errou): a revisão
 *   passa a vencer no máximo amanhã. SÓ antecipa: nunca adia uma revisão que já
 *   vence antes. Habilidade sem agenda ganha uma de 1 dia.
 * - `desafio` (subestimadas — o modelo achava difícil e acertou): `journey.
 *   challengeEligible[skill] = hoje + `DESAFIO_SINAL_DIAS` (o planner gera desafio
 *   para ela enquanto o sinal valer).
 * Poda os sinais vencidos. Idempotente (mínimo/mesma data). Só registra o evento
 * quando algo foi de fato aplicado. Devolve `true` se houve alguma lista não vazia.
 */
export function applyCheckpointRecalibration(o: { antecipar: string[]; desafio: string[]; today: string }): boolean {
  const antecipar = [...new Set(o.antecipar)];
  const desafio = [...new Set(o.desafio)];
  if (antecipar.length === 0 && desafio.length === 0) return false;
  setState((s) => {
    const amanha = somaDiasLocal(o.today, 1);
    for (const skillId of antecipar) {
      const atual = s.learning.reviewSchedule[skillId];
      if (!atual) {
        s.learning.reviewSchedule[skillId] = { skillId, intervalDays: 1, dueDate: amanha, lastResult: "incorrect" };
      } else if (atual.dueDate > amanha) {
        s.learning.reviewSchedule[skillId] = { ...atual, dueDate: amanha };
      }
    }
    const j = s.learning.journey;
    const validade = somaDiasLocal(o.today, DESAFIO_SINAL_DIAS);
    const sinais: Record<string, string> = {};
    for (const [skillId, ate] of Object.entries(j.challengeEligible ?? {})) if (ate >= o.today) sinais[skillId] = ate;
    for (const skillId of desafio) sinais[skillId] = validade;
    j.challengeEligible = sinais;
    const agora = new Date();
    pushEvento(s, {
      type: "checkpoint-recalibrated",
      at: agora.toISOString(),
      localDate: o.today,
      meta: { antecipadas: antecipar.length, desafio: desafio.length },
    });
    return s;
  });
  return true;
}

/** XP por faixa de acerto (docs/30 §14.4): prática/desafio/reforço 10/20/30 (`starsForPct`); revisão 5 fixo; checkpoint 20 fixo. */
function xpAlvoDaAtividade(kind: PlannedActivity["kind"], correct: number, total: number): number {
  if (kind === "revisao") return 5;
  if (kind === "checkpoint") return 20;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return XP_BY_STARS[starsForPct(pct)];
}

/**
 * Fecha uma atividade da jornada (docs/30 §14.4; idempotência docs/36 RF-6).
 *
 * A TENTATIVA é a unidade: `attemptKey = "<id>@<startedAt|sem-inicio>"`. Se o
 * histórico já tem essa chave, a chamada é um no-op de efeitos (nada de XP,
 * bloco do dia, histórico, `sinceCheckpoint`, contador ou evento repetidos —
 * clique duplo, re-render, remontagem, reload na tela de resultado) e devolve
 * `alreadyCompleted: true`. XP: pelo ledger — chave por tentativa quando há
 * `startedAt` (`atividade:<attemptKey>`); a chave antiga `atividade:<id>` é
 * preservada para tentativas iniciadas antes do plano 36. O ledger é lido
 * DENTRO do mutator (não numa fotografia anterior).
 *
 * Tira do topo de `committed` SÓ se for a mesma atividade (nunca uma
 * comprometida que não começou) e zera/avança `sinceCheckpoint`. NÃO replaneja
 * sozinho — `committed` fica com < 3 de propósito, e é isso que faz
 * `ensurePlan` (chamado pela tela) repor.
 */
export function completeJourneyActivity(
  activity: PlannedActivity,
  correct: number,
  total: number,
): { xpAwarded: number; stars: 1 | 2 | 3 | null; alreadyCompleted: boolean } {
  const attemptKey = attemptKeyOf(activity);
  const ledgerKey = activity.startedAt ? `atividade:${attemptKey}` : `atividade:${activity.id}`;
  const alvo = xpAlvoDaAtividade(activity.kind, correct, total);
  const stars = total > 0 ? starsForPct(Math.round((correct / total) * 100)) : null;
  let xpAwarded = 0;
  let alreadyCompleted = false;

  setState((s) => {
    const j = s.learning.journey;
    if (j.history.some((h) => h.attemptKey === attemptKey)) {
      alreadyCompleted = true;
      // Só higiene: se algo ainda aponta pra esta atividade, tira (sem efeito de progresso).
      if (j.committed[0]?.id === activity.id) j.committed = j.committed.slice(1);
      if (j.activeActivity?.id === activity.id) j.activeActivity = null;
      return s;
    }

    const jaPago = s.learning.rewardLedger[ledgerKey]?.xp ?? 0;
    xpAwarded = Math.max(0, alvo - jaPago);
    if (xpAwarded > 0) {
      s.progress.xp += xpAwarded;
      s.learning.rewardLedger[ledgerKey] = { key: ledgerKey, awardedAt: new Date().toISOString(), xp: jaPago + xpAwarded };
    }
    registrarAtividade(s, "lesson", true);

    const agora = new Date();
    const pct = total > 0 ? Math.round((correct / total) * 100) : null;
    bumpJourneySeq(j);
    j.history.push({
      activityId: activity.id,
      kind: activity.kind,
      skillIds: activity.skillIds,
      subjectId: activity.subjectId,
      completedAt: agora.toISOString(),
      scorePct: pct,
      attemptKey,
      localDate: hojeISO(agora),
    });
    if (j.history.length > LIMITE_HISTORICO_JORNADA) j.history.shift();

    if (activity.kind === "checkpoint") {
      j.sinceCheckpoint = 0;
      j.lastCheckpointDate = hojeISO(agora);
    } else {
      j.sinceCheckpoint += 1;
    }
    // O sinal de desafio da recalibração (docs/36 RP-4) é consumido pelo desafio da própria habilidade.
    if (activity.kind === "desafio" && j.challengeEligible && activity.skillIds[0] in j.challengeEligible) {
      delete j.challengeEligible[activity.skillIds[0]];
    }

    if (j.committed[0]?.id === activity.id) {
      j.committed = j.committed.slice(1);
    }
    if (j.activeActivity?.id === activity.id) {
      j.activeActivity = null;
    }

    pushEvento(s, {
      type: "activity-completed",
      at: agora.toISOString(),
      localDate: hojeISO(agora),
      activityId: activity.id,
      skillId: activity.skillIds[0],
      meta: pct !== null ? { scorePct: pct } : undefined,
    });

    return s;
  });

  return { xpAwarded, stars, alreadyCompleted };
}

/**
 * Aula/legado iniciados pela jornada terminam pela rota existente
 * (`completeMicroLesson`/`completeLesson`, que já pagam XP) — esta função
 * só DETECTA que a `activeActivity` foi concluída por fora e move pro
 * histórico, sem pagar XP de novo (docs/30 §14.4). Chamar ao voltar pra
 * home, nunca dentro do próprio player.
 *
 * Só conta a conclusão DESTA tentativa (docs/36 RF-4): com `startedAt`, o
 * registro precisa ter `completedAt >= startedAt` — um reforço de aula já
 * concluída ontem não vira "feito" só porque o registro antigo existe. Sem
 * `startedAt` (atividade de antes do plano 36) vale a regra antiga (existência).
 * `completeMicroLesson`/`completeLesson` regravam `completedAt` a cada conclusão
 * (replay), então um reforço concluído agora carrega a data nova.
 */
export function syncJourneyWithCompletions() {
  setState((s) => {
    const j = s.learning.journey;
    const ativa = j.activeActivity;
    if (!ativa || !ativa.lessonId) return s;
    const registro: { completedAt?: string } | undefined =
      ativa.kind === "legado" ? s.progress.lessons[ativa.lessonId] : s.learning.completedLessons[ativa.lessonId];
    if (!registro) return s;
    if (ativa.startedAt && !(typeof registro.completedAt === "string" && registro.completedAt >= ativa.startedAt)) return s;

    const attemptKey = attemptKeyOf(ativa);
    const agora = new Date();
    if (!j.history.some((h) => h.attemptKey === attemptKey)) {
      bumpJourneySeq(j);
      j.history.push({
        activityId: ativa.id,
        kind: ativa.kind,
        skillIds: ativa.skillIds,
        subjectId: ativa.subjectId,
        completedAt: agora.toISOString(),
        scorePct: null,
        attemptKey,
        localDate: hojeISO(agora),
      });
      if (j.history.length > LIMITE_HISTORICO_JORNADA) j.history.shift();
    }
    if (j.committed[0]?.id === ativa.id) {
      j.committed = j.committed.slice(1);
    }
    j.activeActivity = null;
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
