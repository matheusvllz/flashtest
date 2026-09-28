/**
 * Pontuação de um candidato (docs/30 §11.4, Fase 8 do docs/31 F8.4) — pura,
 * cada fator isolado e testável, `scoreBreakdown` pro painel de debug
 * (docs/30 §27) e pra `planner.ts` decompor o "por quê".
 */
import { SUBJECT_AREA, topologicalOrder, type EnemArea } from "@/content/taxonomy";
import type { SkillDef } from "@/content/taxonomy/types";
import { mastery } from "./model";
import { confidence } from "./confidence";
import { PESOS_SCORE, PESO_MATERIA } from "./constants";
import type { SkillClassification } from "./classify";
import type { LearningState } from "@/lib/learning/types";

export type MateriaPeso = "prioritaria" | "normal" | "vaiBem";

export interface ScoreInput {
  skill: SkillDef;
  allSkillsOfSubject: SkillDef[];
  state: SkillClassification;
  entry: LearningState["skillModel"][string] | undefined;
  evidence: LearningState["skillEvidence"][string] | undefined;
  today: string;
  /** Dias de atraso da revisão (0 se não DEVIDA). */
  diasAtraso: number;
  pesoMateria: MateriaPeso;
  /** Últimas `JANELA_EQUILIBRIO` atividades (mais recente por último) já decididas nesta janela+plano parcial. */
  areasRecentes: EnemArea[];
  /** Fatia-alvo por área — tipicamente 1/nº de áreas no foco. */
  fatiaAlvoArea: number;
  /** Matéria da atividade imediatamente anterior no plano (ou `null`). */
  materiaAnterior: string | null;
  /** Matéria da penúltima atividade (ou `null`). */
  materiaPenultima: string | null;
}

export interface ScoreResult {
  score: number;
  breakdown: {
    necessidade: number;
    objetivo: number;
    urgencia: number;
    ordem: number;
    equilibrio: number;
    variedade: number;
  };
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function necessidade(state: SkillClassification, m: number, c: number): number {
  if (state === "NOVA") return 0.8;
  return (1 - m / 100) * (c < 60 ? 1 : 0.7);
}

function objetivo(pesoMateria: MateriaPeso, incidence: 1 | 2 | 3): number {
  const peso = PESO_MATERIA[pesoMateria];
  return clamp01((peso * (incidence / 3)) / PESO_MATERIA.prioritaria);
}

function urgenciaRevisao(state: SkillClassification, diasAtraso: number): number {
  if (state !== "DEVIDA") return 0;
  return Math.min(1, 0.5 + 0.1 * diasAtraso);
}

function ordemCurricular(state: SkillClassification, skill: SkillDef, allSkillsOfSubject: SkillDef[]): number {
  if (state !== "NOVA") return 0;
  const ordenado = topologicalOrder(allSkillsOfSubject, skill.subjectId);
  const posicao = ordenado.findIndex((s) => s.id === skill.id);
  if (posicao < 0 || ordenado.length === 0) return 0;
  return 1 - posicao / ordenado.length;
}

function equilibrio(area: EnemArea, areasRecentes: EnemArea[], fatiaAlvoArea: number, objetivoScore: number): number {
  if (areasRecentes.length === 0 || fatiaAlvoArea <= 0) return 0;
  const proporcaoReal = areasRecentes.filter((a) => a === area).length / areasRecentes.length;
  const deficit = Math.max(0, fatiaAlvoArea - proporcaoReal);
  return clamp01(deficit / fatiaAlvoArea) * objetivoScore;
}

function variedade(subjectId: string, materiaAnterior: string | null, materiaPenultima: string | null): number {
  if (materiaAnterior === null) return 1;
  if (subjectId === materiaAnterior) return 0;
  if (subjectId === materiaPenultima) return 0.5;
  return 1;
}

export function scoreCandidate(input: ScoreInput): ScoreResult {
  const m = mastery(input.entry);
  const c = confidence(input.entry, input.evidence, input.today).value;
  const area = SUBJECT_AREA[input.skill.subjectId];

  const fNecessidade = necessidade(input.state, m, c);
  const fObjetivo = objetivo(input.pesoMateria, input.skill.incidence);
  const fUrgencia = urgenciaRevisao(input.state, input.diasAtraso);
  const fOrdem = ordemCurricular(input.state, input.skill, input.allSkillsOfSubject);
  const fEquilibrio = area ? equilibrio(area, input.areasRecentes, input.fatiaAlvoArea, fObjetivo) : 0;
  const fVariedade = variedade(input.skill.subjectId, input.materiaAnterior, input.materiaPenultima);

  const score =
    PESOS_SCORE.necessidade * fNecessidade +
    PESOS_SCORE.objetivo * fObjetivo +
    PESOS_SCORE.urgencia * fUrgencia +
    PESOS_SCORE.ordem * fOrdem +
    PESOS_SCORE.equilibrio * fEquilibrio +
    PESOS_SCORE.variedade * fVariedade;

  return {
    score,
    breakdown: {
      necessidade: fNecessidade,
      objetivo: fObjetivo,
      urgencia: fUrgencia,
      ordem: fOrdem,
      equilibrio: fEquilibrio,
      variedade: fVariedade,
    },
  };
}
