import type { SkillEvidenceEntry, SkillModelEntry } from "@/lib/learning/types";
import {
  CONFIDENCE_D_DATAS_ALVO,
  CONFIDENCE_D_DIFICULDADES_ALVO,
  CONFIDENCE_D_ITENS_ALVO,
  CONFIDENCE_D_PESO_DATAS,
  CONFIDENCE_D_PESO_DIFICULDADES,
  CONFIDENCE_D_PESO_ITENS,
  CONFIDENCE_I_FAIXA,
  CONFIDENCE_I_PISO,
  CONFIDENCE_Q_ESCALA,
  CONFIDENCE_R_COM_RETENCAO,
  CONFIDENCE_R_SEM_RETENCAO,
  CONFIDENCE_S_PESO_VOLATILIDADE,
  CONFIDENCE_T_DECAIMENTO_DIAS,
  CONFIDENCE_T_JANELA_DIAS,
} from "./constants";

/**
 * Confidence (docs/30 §10, Fase 5 do docs/31) — SEMPRE derivada, nunca
 * gravada (docs/30 §10.1). Lê `SkillModelEntry` (nEff, difficultiesSeen,
 * independentShare, lastEvidenceDate, recent) e `SkillEvidenceEntry`
 * (distinctExerciseIds/distinctLocalDates/hasReviewCorrectAfter24h — o
 * critério já existente do selo "consistente", docs/20 §13).
 */

export interface ConfidenceParts {
  Q: number;
  D: number;
  R: number;
  T: number;
  S: number;
  I: number;
}

export interface ConfidenceResult {
  value: number;
  parts: ConfidenceParts;
}

function diasEntreISO(anterior: string, hoje: string): number {
  const a = new Date(`${anterior}T00:00:00`);
  const b = new Date(`${hoje}T00:00:00`);
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

/** Trocas certo↔errado↔"não sei" nos últimos 6 resultados, normalizada por (n-1) — 0 sem dado suficiente. */
function volatilidade(recent: Array<0 | 1 | 2>): number {
  const ultimos = recent.slice(-6);
  if (ultimos.length < 2) return 0;
  let trocas = 0;
  for (let i = 1; i < ultimos.length; i++) if (ultimos[i] !== ultimos[i - 1]) trocas++;
  return trocas / (ultimos.length - 1);
}

/**
 * Calcula Confidence (0–100) e a decomposição por fator — a decomposição é
 * o que o painel de debug (Fase 8) mostra pra explicar o número.
 */
export function confidence(
  entry: SkillModelEntry | undefined,
  evidence: SkillEvidenceEntry | undefined,
  today: string,
): ConfidenceResult {
  if (!entry || entry.nEff <= 0) {
    const partsZero: ConfidenceParts = { Q: 0, D: 0, R: CONFIDENCE_R_SEM_RETENCAO, T: 1, S: 1, I: CONFIDENCE_I_PISO };
    return { value: 0, parts: partsZero };
  }

  const Q = 1 - Math.exp(-entry.nEff / CONFIDENCE_Q_ESCALA);

  const itens = evidence?.distinctExerciseIds.length ?? 0;
  const datas = evidence?.distinctLocalDates.length ?? 0;
  const dificuldades = entry.difficultiesSeen.length;
  const D =
    CONFIDENCE_D_PESO_ITENS * Math.min(1, itens / CONFIDENCE_D_ITENS_ALVO) +
    CONFIDENCE_D_PESO_DATAS * Math.min(1, datas / CONFIDENCE_D_DATAS_ALVO) +
    CONFIDENCE_D_PESO_DIFICULDADES * Math.min(1, dificuldades / CONFIDENCE_D_DIFICULDADES_ALVO);

  const R = evidence?.hasReviewCorrectAfter24h ? CONFIDENCE_R_COM_RETENCAO : CONFIDENCE_R_SEM_RETENCAO;

  const dias = entry.lastEvidenceDate ? diasEntreISO(entry.lastEvidenceDate, today) : 0;
  const T = dias <= CONFIDENCE_T_JANELA_DIAS ? 1 : Math.exp(-(dias - CONFIDENCE_T_JANELA_DIAS) / CONFIDENCE_T_DECAIMENTO_DIAS);

  const S = 1 - CONFIDENCE_S_PESO_VOLATILIDADE * volatilidade(entry.recent);

  const I = CONFIDENCE_I_PISO + CONFIDENCE_I_FAIXA * entry.independentShare;

  const value = Math.round(100 * Q * (0.4 + 0.6 * D) * R * T * S * I);
  return { value: Math.max(0, Math.min(100, value)), parts: { Q, D, R, T, S, I } };
}
