/**
 * Orquestração da jornada (docs/30 §14, Fase 12 do docs/31 F12.1) — funções
 * PURAS sobre `AppState` + `PlannedActivity`. Content-aware de propósito
 * (chama `planWithFallback`, que importa taxonomia/itens) — por isso NUNCA
 * é importado por `store.ts` (mesma regra da Fase 5/7/8, guardada por
 * `store-bundle-boundary.test.ts`). Quem chama isto (uma tela/hook que já
 * paga o custo do import de conteúdo) pega o resultado e grava no store via
 * as ações "burras" (`commitPlan`, `setActiveActivity`, ...) — que só
 * armazenam dados prontos, nunca decidem nada sozinhas.
 */
import { planWithFallback } from "./index";
import { ALGO_VERSION } from "./constants";
import type { PlannedActivity } from "./types";
import { FEATURES } from "@/lib/features";
import type { AppState } from "@/lib/store";

export interface EnsurePlanResult {
  committed: PlannedActivity[];
  upcoming: PlannedActivity[];
  fallback: boolean;
}

const COMMITTED_SIZE = 3;
const UPCOMING_SIZE = 5;

/**
 * `ensurePlan` (§14, algoritmo). Replaneja quando `committed` está vazio,
 * curto demais (< 3 — uma atividade acabou de ser concluída e não foi
 * reposta ainda) ou desatualizado (`planVersion` de um algoritmo antigo).
 * Devolve `null` quando NADA precisa mudar — o chamador não regrava o
 * estado à toa (evita replanejar a cada render).
 */
export function ensurePlan(
  s: Pick<AppState, "prefs" | "learning" | "progress">,
  today: string,
  seed: string,
  opts: {
    /** Mudança de foco descarta comprometidas fora do novo escopo (docs/30 §15) mesmo com `committed` cheio e `planVersion` em dia — quem chama (a tela, ao detectar `prefs.studyFocus`/`learning.focusSession` diferente do último replano) passa `true`. */
    forceReplan?: boolean;
  } = {},
): EnsurePlanResult | null {
  const { committed, planVersion } = s.learning.journey;
  const precisaReplanejar = opts.forceReplan || committed.length < COMMITTED_SIZE || planVersion !== ALGO_VERSION;
  if (!precisaReplanejar) return null;

  const plano = planWithFallback(s, today, seed, {
    n: COMMITTED_SIZE + UPCOMING_SIZE,
    checkpointsHabilitado: FEATURES.checkpointsTrilha,
  });
  const novoCommitted = plano.activities.slice(0, COMMITTED_SIZE);
  const novoUpcoming = plano.activities.slice(COMMITTED_SIZE, COMMITTED_SIZE + UPCOMING_SIZE);

  /**
   * Guarda contra loop de commit (achado real, F12.5): um foco muito
   * estreito (ex.: uma matéria só, poucas habilidades elegíveis) pode fazer
   * o motor nunca conseguir preencher os 3 slots de `committed` — sem essa
   * checagem de CONTEÚDO, `committed.length < COMMITTED_SIZE` continuaria
   * `true` pra sempre, e cada replano geraria um array NOVO (referência
   * diferente) mesmo com o MESMO conteúdo, fazendo quem chama (efeito
   * reativo em `trilha.tsx`) reagir de novo indefinidamente. Só pula o
   * commit quando o conteúdo é idêntico E `planVersion` já está em dia (uma
   * versão desatualizada sempre commita ao menos uma vez).
   */
  const semMudanca =
    planVersion === ALGO_VERSION &&
    novoCommitted.length === committed.length &&
    novoCommitted.every((a, i) => a.id === committed[i]?.id);
  if (semMudanca) return null;

  return { committed: novoCommitted, upcoming: novoUpcoming, fallback: plano.fallback };
}

export type NavigationTarget =
  | { kind: "aula"; lessonId: string }
  | { kind: "legado"; lessonId: string }
  | { kind: "atividade"; activityId: string };

/** Pra onde navegar ao iniciar UMA atividade (§14.4 pseudocódigo "navegar:"). */
export function navigationTargetFor(activity: PlannedActivity): NavigationTarget {
  if ((activity.kind === "aula" || activity.kind === "reforco") && activity.lessonId) {
    return { kind: "aula", lessonId: activity.lessonId };
  }
  if (activity.kind === "legado" && activity.lessonId) {
    return { kind: "legado", lessonId: activity.lessonId };
  }
  return { kind: "atividade", activityId: activity.id };
}

/** Uma atividade precisa de itens escolhidos na hora (prática/revisão/desafio/checkpoint/reforço sem aula própria). */
export function needsItemSelection(activity: PlannedActivity): boolean {
  if (activity.kind === "reforco") return !activity.lessonId;
  return activity.kind === "pratica" || activity.kind === "revisao" || activity.kind === "desafio" || activity.kind === "checkpoint";
}
