/**
 * Estado derivado por habilidade (docs/30 §11.2, Fase 8 do docs/31 F8.2) —
 * função pura: recebe `SkillDef` + o que precisa de `AppState`/data por
 * parâmetro, nunca lê relógio nem importa store/React.
 */
import type { SkillDef } from "@/content/taxonomy/types";
import type { Attempt, LearningState } from "@/lib/learning/types";
import { mastery } from "./model";
import { confidence } from "./confidence";
import {
  CONFIDENCE_PREREQUISITO_MIN,
  FIRME_CONFIDENCE_MIN,
  FIRME_MASTERY_MIN,
  MASTERY_PREREQUISITO_MIN,
  REFORCO_DONT_KNOW_MIN,
  REFORCO_ERROS_DISTINTOS_MIN,
  REFORCO_HELP_HEAVY_MIN,
  REFORCO_JANELA_DIAS,
} from "./constants";

export type SkillClassification = "IGNORAR" | "BLOQUEADA" | "NOVA" | "EM_APRENDIZADO" | "FIRME" | "REFORCO" | "DEVIDA";

export interface ClassifyResult {
  state: SkillClassification;
  due: boolean;
  reasons: string[];
}

function diasEntreISO(a: string, b: string): number {
  const msA = new Date(`${a}T00:00:00Z`).getTime();
  const msB = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((msB - msA) / 86_400_000);
}

/**
 * Pré-requisito satisfeito (§11.2): aula da habilidade P concluída, OU
 * Mastery(P) ≥ 60 E Confidence(P) ≥ 30, OU P ainda "planejado" (sem
 * conteúdo — não pode travar o resto por uma habilidade que não existe).
 */
export function prerequisiteSatisfied(
  prereq: SkillDef,
  learning: Pick<LearningState, "skillModel" | "skillEvidence" | "completedLessons">,
  lessonIdsOfSkill: string[],
  today: string,
): boolean {
  if (prereq.status === "planejado") return true;
  const aulaConcluida = lessonIdsOfSkill.some((id) => Boolean(learning.completedLessons[id]));
  if (aulaConcluida) return true;
  const m = mastery(learning.skillModel[prereq.id]);
  const c = confidence(learning.skillModel[prereq.id], learning.skillEvidence[prereq.id], today).value;
  return m >= MASTERY_PREREQUISITO_MIN && c >= CONFIDENCE_PREREQUISITO_MIN;
}

function errosDistintosRecentes(attempts: Attempt[], skillId: string, today: string): number {
  const distintos = new Set<string>();
  for (const a of attempts) {
    if (a.correct || !a.skillIds.includes(skillId)) continue;
    const dias = diasEntreISO(a.localDate, today);
    if (dias < 0 || dias > REFORCO_JANELA_DIAS) continue;
    distintos.add(a.exerciseId);
  }
  return distintos.size;
}

/**
 * `classifySkill` (§11.2). `prereqsSatisfeitos` já resolvido por quem chama
 * (evita recursão/ciclo — o grafo é validado acíclico na Fase 2, mas o
 * cálculo de cada pré-requisito depende do MESMO `learning`, então é mais
 * barato resolver uma vez por planejamento do que recalcular aqui).
 */
export function classifySkill(
  skill: SkillDef,
  learning: Pick<LearningState, "skillModel" | "skillEvidence" | "reviewSchedule" | "completedLessons" | "recentAttempts">,
  today: string,
  opts: { temConteudo: boolean; aulaConcluida: boolean; prereqsSatisfeitos: boolean },
): ClassifyResult {
  if (skill.status === "planejado" || !opts.temConteudo) {
    return { state: "IGNORAR", due: false, reasons: ["sem-conteudo"] };
  }
  if (!opts.prereqsSatisfeitos) {
    return { state: "BLOQUEADA", due: false, reasons: ["pre-requisito-nao-satisfeito"] };
  }

  const entry = learning.skillModel[skill.id];
  const evidence = learning.skillEvidence[skill.id];
  const temEvidencia = Boolean(entry && entry.nEff > 0);

  if (!temEvidencia && !opts.aulaConcluida) {
    return { state: "NOVA", due: false, reasons: ["sem-evidencia"] };
  }

  const errosDistintos = errosDistintosRecentes(learning.recentAttempts, skill.id, today);
  const dontKnowRecent = entry?.dontKnowRecent ?? 0;
  const helpHeavyRecent = entry?.helpHeavyRecent ?? 0;
  if (
    errosDistintos >= REFORCO_ERROS_DISTINTOS_MIN ||
    dontKnowRecent >= REFORCO_DONT_KNOW_MIN ||
    helpHeavyRecent >= REFORCO_HELP_HEAVY_MIN
  ) {
    const reasons: string[] = [];
    if (errosDistintos >= REFORCO_ERROS_DISTINTOS_MIN) reasons.push("erros-distintos");
    if (dontKnowRecent >= REFORCO_DONT_KNOW_MIN) reasons.push("nao-sei-recente");
    if (helpHeavyRecent >= REFORCO_HELP_HEAVY_MIN) reasons.push("ajuda-pesada-recente");
    return { state: "REFORCO", due: false, reasons };
  }

  const schedule = learning.reviewSchedule[skill.id];
  const due = Boolean(schedule && schedule.dueDate <= today);
  if (due) return { state: "DEVIDA", due: true, reasons: ["revisao-vencida"] };

  const m = mastery(entry);
  const c = confidence(entry, evidence, today).value;
  if (m >= FIRME_MASTERY_MIN && c >= FIRME_CONFIDENCE_MIN) {
    return { state: "FIRME", due: false, reasons: ["mastery-alta", "confidence-alta"] };
  }

  return { state: "EM_APRENDIZADO", due: false, reasons: ["em-progresso"] };
}
