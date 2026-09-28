import type { AppState } from "@/lib/store";
import type { SkillModelEntry } from "@/lib/learning/types";
import { itemMetaOf } from "@/content/items";
import { activeSkills } from "@/content/taxonomy";
import { updateSkill } from "./model";
import { ALGO_VERSION, PESO_HABILIDADE_SECUNDARIA } from "./constants";

/** Incerteza do prior de matéria (docs/30 §24.3) — mais estreita que o prior "frio" (SIGMA0=1,2, sem nenhum dado), mas ainda larga. */
const SIGMA_PRIOR_MATERIA = 1.0;

/**
 * Bootstrap/replay do modelo (docs/30 §9.6/§24.2/§24.3, Fase 5 T-5.6/T-5.7)
 * — roda na carga quando `modelMeta.algoVersion < ALGO_VERSION` (inclusive
 * 0 = nunca rodou). NUNCA lê `Date.now()` fora de metadado; NUNCA lança —
 * item de tentativa antiga que não resolve mais (conteúdo removido) é
 * ignorado, silenciosamente, sem travar o boot.
 */

function logit(p: number): number {
  const clamped = Math.min(0.999, Math.max(0.001, p));
  return Math.log(clamped / (1 - clamped));
}

function clamp(x: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, x));
}

/**
 * Replay de `learning.recentAttempts`, em ordem, sobre um modelo vazio —
 * reconstrói `skillModel` do zero a partir do log de tentativas (docs/30
 * §9.6). Não lê `skillModel` atual: o replay é a fonte de verdade quando o
 * algoritmo mudou de versão.
 */
export function replayAttempts(
  attempts: AppState["learning"]["recentAttempts"],
  /** Fixo pra todas as entradas do replay — sem isso, `updatedAt` usaria o relógio real em cada chamada de `updateSkill` e duas rodadas do MESMO replay não seriam idênticas (docs/30 §9.6: "determinístico, idempotente"). */
  now: string = new Date().toISOString(),
): Record<string, SkillModelEntry> {
  const model: Record<string, SkillModelEntry> = {};
  for (const attempt of attempts) {
    if (attempt.skillIds.length === 0) continue;
    let meta;
    try {
      meta = itemMetaOf(attempt.exerciseId);
    } catch {
      continue; // conteúdo removido desde a tentativa — não trava o replay.
    }
    const assisted = attempt.assisted ?? (attempt.hintUsed || attempt.tutorUsed);
    attempt.skillIds.forEach((skillId, indice) => {
      model[skillId] = updateSkill(
        model[skillId],
        skillId,
        { role: attempt.role, correct: attempt.correct, response: attempt.response, assisted },
        meta.irt,
        attempt.localDate,
        { difficulty: meta.difficulty, weightMultiplier: indice > 0 ? PESO_HABILIDADE_SECUNDARIA : 1, now },
      );
    });
  }
  return model;
}

/**
 * Prior por matéria (docs/30 §24.3) a partir de `progress.bySubject`
 * (histórico de `/study`, que não passa pelo modelo formal) — só preenche
 * habilidades ATIVAS que o replay não populou. Suavização de Laplace pra
 * matéria com poucas respostas não virar um prior extremo (0% ou 100%).
 */
export function priorPorMateria(
  bySubject: AppState["progress"]["bySubject"],
  jaPopuladas: Set<string>,
  now: string,
): Record<string, SkillModelEntry> {
  const priors: Record<string, SkillModelEntry> = {};
  for (const [subjectId, stats] of Object.entries(bySubject)) {
    if (!stats || stats.answered === 0) continue;
    const taxa = (stats.correct + 1) / (stats.answered + 2);
    const theta = clamp(logit(taxa) - 0.3, -2, 2);
    for (const skill of activeSkills().filter((s) => s.subjectId === subjectId)) {
      if (jaPopuladas.has(skill.id)) continue;
      priors[skill.id] = {
        skillId: skill.id,
        theta,
        sigma: SIGMA_PRIOR_MATERIA,
        nEff: 0,
        difficultiesSeen: [],
        recent: [],
        independentShare: 0,
        lastEvidenceDate: null,
        lapses: 0,
        dontKnowRecent: 0,
        helpHeavyRecent: 0,
        source: "prior-materia",
        algoVersion: ALGO_VERSION,
        updatedAt: now,
      };
    }
  }
  return priors;
}

/**
 * Bootstrap completo — replay + prior de matéria (docs/30 §9.6). Chamado
 * por `store.ts#load()` quando `modelMeta.algoVersion < ALGO_VERSION`.
 * Determinístico: mesma entrada, mesma saída (idempotente — rodar 2x dá o
 * mesmo resultado, já que não lê o `skillModel` atual, só reconstrói).
 */
export function bootstrapModel(
  s: Pick<AppState, "progress" | "learning">,
  now: string = new Date().toISOString(),
): Record<string, SkillModelEntry> {
  const doReplay = replayAttempts(s.learning.recentAttempts, now);
  const priors = priorPorMateria(s.progress.bySubject, new Set(Object.keys(doReplay)), now);
  return { ...priors, ...doReplay };
}
