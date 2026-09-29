import type { ReviewScheduleEntry, SkillEvidenceEntry, SkillModelEntry } from "@/lib/learning/types";
import { skillEvidenceState } from "@/lib/learning/review";
import { confidence } from "./confidence";
import { mastery } from "./model";
import {
  CONFIDENCE_BOA_EVIDENCIA,
  CONFIDENCE_EVIDENCIA_RAZOAVEL,
  CONFIDENCE_MOSTRA_MASTERY,
  PLACEMENT_SE_STOP,
} from "./constants";

/**
 * Como mostrar Mastery/Confidence pro aluno (docs/30 §10.4, Fase 5) — nunca
 * um número sem evidência suficiente pra sustentá-lo. "Dominado" exige as
 * TRÊS coisas ao mesmo tempo: Mastery alto, Confidence alta E o selo
 * "consistente" já existente (docs/20 §13, `skillEvidenceState`).
 */

export type ConfidenceLabel = "ainda medindo" | "pouca evidência" | "evidência razoável" | "boa evidência";

export interface SkillDisplay {
  label: ConfidenceLabel;
  showMastery: boolean;
  mastery: number | null;
  confidenceValue: number;
  consistent: boolean;
  dominated: boolean;
}

function confidenceLabel(value: number): ConfidenceLabel {
  if (value < CONFIDENCE_MOSTRA_MASTERY) return "ainda medindo";
  if (value < CONFIDENCE_EVIDENCIA_RAZOAVEL) return "pouca evidência";
  if (value < CONFIDENCE_BOA_EVIDENCIA) return "evidência razoável";
  return "boa evidência";
}

export function skillDisplay(
  entry: SkillModelEntry | undefined,
  evidence: SkillEvidenceEntry | undefined,
  _schedule: ReviewScheduleEntry | undefined,
  today: string,
): SkillDisplay {
  const conf = confidence(entry, evidence, today);
  const showMastery = conf.value >= CONFIDENCE_MOSTRA_MASTERY;
  const consistent = skillEvidenceState(evidence) === "consistente";
  const masteryValue = mastery(entry);
  const dominated = showMastery && masteryValue >= 80 && conf.value >= CONFIDENCE_BOA_EVIDENCIA && consistent;

  return {
    label: confidenceLabel(conf.value),
    showMastery,
    mastery: showMastery ? masteryValue : null,
    confidenceValue: conf.value,
    consistent,
    dominated,
  };
}

/* -------------------------------------------------------------------------- *
 * Resultado do nivelamento (docs/36 §F.5, T-06.1; RP-6) — só o que foi medido,
 * nunca um número: faixa por ÁREA medida e precisão pela SE da área. Nenhuma
 * função aqui devolve porcentagem, θ, SE numérica, nota ou "nível N".
 * -------------------------------------------------------------------------- */

/** Faixa de uma área medida — mesmos limiares do resultado original (`faixaDaArea` da rota: θ̂ < −0,5; < 0,7; ≥ 0,7). */
export type FaixaPlacement = "construcao" | "caminho" | "firme";

export const PLACEMENT_FAIXA_CAMINHO_MIN_THETA = -0.5;
export const PLACEMENT_FAIXA_FIRME_MIN_THETA = 0.7;

/** `null` quando a área não foi medida (sem resposta = θ̂ `null`). */
export function faixaDaAreaPlacement(theta: number | null): FaixaPlacement | null {
  if (theta === null) return null;
  if (theta < PLACEMENT_FAIXA_CAMINHO_MIN_THETA) return "construcao";
  if (theta < PLACEMENT_FAIXA_FIRME_MIN_THETA) return "caminho";
  return "firme";
}

/** Precisão da estimativa DA ÁREA (SE do nivelamento, não a Confidence de habilidade). */
export type PrecisaoArea = "firme" | "inicial" | "poucas";

/** Limite superior de "Estimativa inicial": acima disso são "poucas questões". `firme` usa o mesmo corte de parada do CAT (`PLACEMENT_SE_STOP`). */
export const PLACEMENT_SE_INICIAL_MAX = 0.7;

/** SE ≤ 0,45 → firme; 0,45 < SE ≤ 0,70 → inicial; SE > 0,70 → poucas. `null` (sem SE) → `null`. */
export function precisaoDaArea(se: number | null): PrecisaoArea | null {
  if (se === null) return null;
  if (se <= PLACEMENT_SE_STOP) return "firme";
  if (se <= PLACEMENT_SE_INICIAL_MAX) return "inicial";
  return "poucas";
}
