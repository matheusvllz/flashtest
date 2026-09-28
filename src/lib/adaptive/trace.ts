/**
 * Trace de decisão do planejador (docs/30 §27, Fase 8 do docs/31 F8.8) —
 * anel de 20 em memória (não persiste; é depuração de sessão, não dado do
 * aluno). `formatTrace` no formato de linha do `30` §27, pro painel `/debug`.
 */
import type { ActivityKind, PlannedActivity } from "./types";
import type { ScoreResult } from "./scoring";

export interface DecisionTraceEntry {
  activity: PlannedActivity;
  skillName: string;
  mastery: number | null;
  confidence: number | null;
  breakdown: ScoreResult["breakdown"];
  targetP?: number;
  bAlvo?: number;
}

const LIMITE_TRACE = 20;
let anel: DecisionTraceEntry[] = [];

export function recordTrace(entry: DecisionTraceEntry): void {
  anel.push(entry);
  if (anel.length > LIMITE_TRACE) anel.shift();
}

export function getTrace(): DecisionTraceEntry[] {
  return [...anel];
}

/** Só para teste — evita trace vazando entre casos isolados. */
export function _resetTraceForTests(): void {
  anel = [];
}

const NOME_KIND: Record<ActivityKind, string> = {
  aula: "Aula",
  pratica: "Prática",
  revisao: "Revisão",
  desafio: "Desafio",
  checkpoint: "Checkpoint",
  legado: "Lição",
  reforco: "Reforço",
};

/** Formata UMA entrada no formato de linha do `30` §27. */
export function formatTrace(entry: DecisionTraceEntry): string {
  const { activity, breakdown } = entry;
  const linhas = [
    `Atividade: ${NOME_KIND[activity.kind]} · ${entry.skillName} (${activity.skillIds[0] ?? "—"})`,
    `Motivo: ${activity.reasons.join(" + ")}`,
    `Score ${activity.score.toFixed(2)} = necessidade ${breakdown.necessidade.toFixed(2)} · objetivo ${breakdown.objetivo.toFixed(2)} · urgência ${breakdown.urgencia.toFixed(2)} · ordem ${breakdown.ordem.toFixed(2)} · equilíbrio ${breakdown.equilibrio.toFixed(2)} · variedade ${breakdown.variedade.toFixed(2)}`,
  ];
  if (entry.mastery !== null || entry.confidence !== null) {
    linhas.push(
      `Mastery ${entry.mastery ?? "—"} · Confidence ${entry.confidence ?? "—"}${entry.targetP ? ` · p-alvo ${entry.targetP}` : ""}${entry.bAlvo !== undefined ? ` · b-alvo ${entry.bAlvo.toFixed(2)}` : ""}`,
    );
  }
  return linhas.join("\n");
}
