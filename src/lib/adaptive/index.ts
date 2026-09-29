/**
 * Ponto de entrada do motor adaptativo (docs/30 §11, Fase 8 do docs/31
 * F8.1/F8.7) — `planWithFallback`/`selectItemsForActivity` são os únicos
 * contratos que o resto do app (Fase 12) deveria chamar.
 */
import { planNext, type PlanNextOptions } from "./planner";
import { fallbackPlan } from "./fallback";
import { selectItems } from "./select-items";
import { composeCheckpoint } from "./checkpoint";
import { ALGO_VERSION, ITENS_POR_ATIVIDADE, P_ALVO_POR_ATIVIDADE } from "./constants";
import { hojeISO, type AppState } from "@/lib/store";
import type { JourneyPlan, PlannedActivity } from "./types";
import type { JourneyHistoryEntry } from "@/lib/learning/types";

export * from "./types";
export { classifySkill, prerequisiteSatisfied, type SkillClassification } from "./classify";
export { candidateForSkill, legacyCandidateForSkill, lessonForSkill, lessonIdsForSkill, type Candidate } from "./candidates";
export { scoreCandidate, type ScoreInput, type ScoreResult, type MateriaPeso } from "./scoring";
export { planNext, type PlanNextOptions } from "./planner";
export { fallbackPlan } from "./fallback";
export { selectItems, bAlvo, type SelectItemsResult } from "./select-items";
export { deveInserirCheckpoint, composeCheckpoint, recalibrar, type RecalibrarInput, type RecalibrarResult } from "./checkpoint";

/**
 * Envolve `planNext` em `try/catch` (docs/30 §11.8) — exceção, pacote de
 * conteúdo indisponível ou flag desligada caem no plano de `fallback.ts`.
 * Nunca lança: o aluno sempre tem o que estudar.
 */
export function planWithFallback(
  s: Pick<AppState, "prefs" | "learning" | "progress">,
  today: string,
  seed: string,
  opts: PlanNextOptions = {},
): JourneyPlan {
  try {
    const activities = planNext(s, today, seed, opts);
    if (activities.length === 0) {
      return {
        generatedAt: new Date().toISOString(),
        algoVersion: ALGO_VERSION,
        activities: fallbackPlan(s as AppState, today, opts.n ?? 8),
        fallback: true,
      };
    }
    return { generatedAt: new Date().toISOString(), algoVersion: ALGO_VERSION, activities, fallback: false };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      algoVersion: ALGO_VERSION,
      activities: fallbackPlan(s as AppState, today, opts.n ?? 8),
      fallback: true,
    };
  }
}

/**
 * Itens por tipo de atividade quando o plano não os fixou (docs/36 T-02.1) —
 * as constantes `ITENS_POR_ATIVIDADE` já existentes; `checkpoint` tem
 * composição própria e aula/legado nem passam por aqui (`needsItemSelection`).
 */
function itensPorTipo(kind: PlannedActivity["kind"]): number {
  if (kind === "revisao") return ITENS_POR_ATIVIDADE.revisao;
  if (kind === "desafio") return ITENS_POR_ATIVIDADE.desafio;
  if (kind === "reforco") return ITENS_POR_ATIVIDADE.reforco;
  return ITENS_POR_ATIVIDADE.pratica;
}

function pAlvoPorTipo(kind: PlannedActivity["kind"]): number {
  if (kind === "revisao") return P_ALVO_POR_ATIVIDADE.revisao;
  if (kind === "desafio") return P_ALVO_POR_ATIVIDADE.desafio;
  if (kind === "reforco") return P_ALVO_POR_ATIVIDADE.reforco;
  return P_ALVO_POR_ATIVIDADE.pratica;
}

/**
 * Entradas do histórico da jornada DEPOIS do último checkpoint. `lastCheckpointDate` é data
 * LOCAL; comparar com `completedAt.slice(0, 10)` (UTC) errava perto da meia-noite em UTC−3
 * (docs/36 C7, T-04.4) — usa `localDate` gravado, ou deriva do ISO em fuso local (`hojeISO`).
 */
export function historicoDesdeUltimoCheckpoint(
  history: JourneyHistoryEntry[],
  desde: string | null | undefined,
): JourneyHistoryEntry[] {
  return history.filter(
    (h) => h.kind !== "checkpoint" && (!desde || (h.localDate ?? hojeISO(new Date(h.completedAt))) > desde),
  );
}

/**
 * Seleciona os itens de UMA atividade já planejada, na hora de começar (docs/30 §11.7).
 * Checkpoint (Fase 14) tem composição própria — não é uma habilidade só.
 * Sem `targetP` no plano usa a probabilidade-alvo do TIPO (antes devolvia `[]` e
 * a atividade nunca abria — docs/36 C2/C7); o tamanho vem de `itemIds` (se já
 * escolhidos) ou de `ITENS_POR_ATIVIDADE` do tipo.
 */
export function selectItemsForActivity(
  activity: PlannedActivity,
  s: Pick<AppState, "learning">,
  today: string,
  seed: string,
): string[] {
  if (activity.kind === "checkpoint") {
    const desde = s.learning.journey.lastCheckpointDate;
    const historicoDesdeUltimo = historicoDesdeUltimoCheckpoint(s.learning.journey.history, desde);
    return composeCheckpoint(s.learning, historicoDesdeUltimo, today, seed).itemIds;
  }
  const skillId = activity.skillIds[0];
  if (!skillId) return activity.itemIds ?? [];
  const papel = activity.kind === "revisao" ? "revisao" : activity.kind === "desafio" ? "desafio" : "pratica";
  const theta = s.learning.skillModel[skillId]?.theta ?? 0;
  const n = activity.itemIds?.length || itensPorTipo(activity.kind);
  const targetP = activity.targetP ?? pAlvoPorTipo(activity.kind);
  return selectItems(skillId, n, targetP, theta, s.learning, today, seed, papel).itemIds;
}
