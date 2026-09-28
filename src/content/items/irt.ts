import type { Exercise } from "@/lib/lessons/types";
import type { ItemIrt } from "./types";

/**
 * Parâmetros IRT estimados a partir da dificuldade editorial (docs/30 §8.4,
 * Fase 3 T-3.2) — `a` fixo, `b` por faixa de dificuldade, `c` (chute) pelo
 * formato do exercício. Não é TRI calibrada (ver docs/30 §12.4): serve só
 * pra escolher item de dificuldade-alvo (Fase 8) até haver dado real.
 */
const B_POR_DIFICULDADE: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: -1.6,
  2: -0.8,
  3: 0,
  4: 0.8,
  5: 1.6,
};

const A_PADRAO = 1.0;

/** Probabilidade de acerto só pelo chute, por tipo de exercício (docs/30 §8.4). */
export function guessingProbability(exercise: Exercise): number {
  switch (exercise.type) {
    case "multipla-escolha":
    case "complete-lacuna":
    case "interpretacao":
      return exercise.opcoes.length > 0 ? 1 / exercise.opcoes.length : 0.25;
    case "verdadeiro-falso":
      return 0.5;
    case "encontre-o-erro": {
      const nPalavras = exercise.frase.trim().split(/\s+/).filter(Boolean).length;
      return nPalavras > 0 ? Math.min(0.1, 1 / nPalavras) : 0.1;
    }
    case "ordenar":
    case "parear":
      return 0.05;
  }
}

export function irtFromDifficulty(difficulty: 1 | 2 | 3 | 4 | 5, exercise: Exercise): ItemIrt {
  return {
    a: A_PADRAO,
    b: B_POR_DIFICULDADE[difficulty],
    c: guessingProbability(exercise),
    source: "estimado",
  };
}

/** Distribuição real de `b` por (área, habilidade) — mediana e amplitude interquartil, dos parâmetros do Inep já importados (docs/30 §12.4, Fase 10 F10.4). */
export interface CalibracaoHabilidade {
  mediana: number;
  iqr: number;
}

/**
 * Calibra `b` pela distribuição real do Inep pra habilidade correspondente
 * (docs/30 §12.4, F10.4): `mediana + (b_editorial / 1,6) · (iqr / 1,35)` —
 * preserva a ORDEM editorial por construção (o termo de `b_editorial` entra
 * multiplicado por um fator positivo, então dificuldade maior sempre gera
 * `b` calibrado maior, qualquer que seja a mediana/iqr da habilidade) e só
 * CENTRA a escala na distribuição real em vez do palpite editorial cru.
 * Nunca mexe em item já com `irt.source !== "estimado"` (oficial/calibrado
 * de novo por engano) nem sem `enemSkills` mapeado — sem tabela, sem ajuste.
 */
export function calibrarB(
  irt: ItemIrt,
  difficulty: 1 | 2 | 3 | 4 | 5,
  enemSkills: string[] | undefined,
  tabela: Record<string, CalibracaoHabilidade>,
): ItemIrt {
  if (irt.source !== "estimado" || !enemSkills || enemSkills.length === 0) return irt;
  const calibracao = tabela[enemSkills[0]];
  if (!calibracao) return irt;
  const bEditorial = B_POR_DIFICULDADE[difficulty];
  const bAjustado = calibracao.mediana + (bEditorial / 1.6) * (calibracao.iqr / 1.35);
  return { ...irt, b: bAjustado, calibratedFrom: "inep-distribuicao" };
}
