import type { ReviewScheduleEntry, SkillEvidenceEntry, SkillModelEntry } from "@/lib/learning/types";
import { skillEvidenceState } from "@/lib/learning/review";
import { confidence } from "./confidence";
import { mastery } from "./model";
import { CONFIDENCE_BOA_EVIDENCIA, CONFIDENCE_EVIDENCIA_RAZOAVEL, CONFIDENCE_MOSTRA_MASTERY } from "./constants";

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
