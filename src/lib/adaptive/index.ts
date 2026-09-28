/**
 * Ponto de entrada do motor adaptativo (docs/30 §11, Fase 8 do docs/31
 * F8.1/F8.7) — `planWithFallback`/`selectItemsForActivity` são os únicos
 * contratos que o resto do app (Fase 12) deveria chamar.
 */
import { planNext, type PlanNextOptions } from "./planner";
import { fallbackPlan } from "./fallback";
import { selectItems } from "./select-items";
import { composeCheckpoint } from "./checkpoint";
import { ALGO_VERSION } from "./constants";
import type { AppState } from "@/lib/store";
import type { JourneyPlan, PlannedActivity } from "./types";

export * from "./types";
export { classifySkill, prerequisiteSatisfied, type SkillClassification } from "./classify";
export { candidateForSkill, legacyCandidateForSkill, lessonForSkill, type Candidate } from "./candidates";
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

/** Seleciona os itens de UMA atividade já planejada, na hora de começar (docs/30 §11.7). Checkpoint (Fase 14) tem composição própria — não é uma habilidade só. */
export function selectItemsForActivity(
  activity: PlannedActivity,
  s: Pick<AppState, "learning">,
  today: string,
  seed: string,
): string[] {
  if (activity.kind === "checkpoint") {
    const desde = s.learning.journey.lastCheckpointDate;
    const historicoDesdeUltimo = s.learning.journey.history.filter(
      (h) => h.kind !== "checkpoint" && (!desde || h.completedAt.slice(0, 10) > desde),
    );
    return composeCheckpoint(s.learning, historicoDesdeUltimo, today, seed).itemIds;
  }
  const skillId = activity.skillIds[0];
  if (!skillId || !activity.targetP) return activity.itemIds ?? [];
  const papel = activity.kind === "revisao" ? "revisao" : activity.kind === "desafio" ? "desafio" : "pratica";
  const theta = s.learning.skillModel[skillId]?.theta ?? 0;
  const n = activity.itemIds?.length || 4;
  return selectItems(skillId, n, activity.targetP, theta, s.learning, today, seed, papel).itemIds;
}
