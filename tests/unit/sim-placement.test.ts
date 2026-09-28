import { describe, expect, test } from "bun:test";
import {
  nextPlacementItem,
  recordPlacementResponse,
  startPlacement,
  type PlacementPoolItem,
} from "@/lib/adaptive/placement";
import { PLACEMENT_MAX_ITENS_TOTAL, PLACEMENT_SE_STOP } from "@/lib/adaptive/constants";
import { mulberry32, simulateResponse } from "./helpers/simulated-student";

/**
 * Simulação G do docs/30 §26.3 (Fase 13 do docs/31 F13.3, AC-13.3): aluno com
 * θ VERDADEIRO fixo por área em {-1,5; 0; 1,5}, 50 execuções por valor →
 * |θ̂ - θ| médio ≤ 0,6 e ≤ 24 itens.
 *
 * Decisão de escopo (registrada no docs/32): esta simulação valida o
 * ALGORITMO DE ESTIMAÇÃO (EAP + seleção por informação) em isolamento — UMA
 * área rodando até convergir (parada só por SE ≤ 0,45, orçamento GLOBAL de
 * 24 itens), não o fluxo de produto completo, que reparte esse orçamento
 * entre 4 áreas e por isso capa cada uma em 4-6 itens (`shouldStopArea`,
 * testado à parte em `placement.test.ts`). Com o teto de produto (4-6 por
 * área) a estimativa NUNCA teria itens suficientes pra bater 0,45 de SE —
 * ela sempre pararia por CONTAGEM, longe da convergência; essa simulação
 * usa por isso `nextPlacementItem`/`recordPlacementResponse` direto (sem o
 * teto de `shouldStopArea`) pra isolar exatamente o que a Fase 11 devia
 * entregar: itens reais o bastante (discriminação a≈1,5, típica de item bem
 * calibrado — não o `a=1` nominal usado só pra RANQUEAR pool por
 * dificuldade-alvo em `select-items.ts`) pra essa convergência acontecer
 * quando o aluno de fato responde muitos itens de uma área.
 */

function poolSintetico(a: number): PlacementPoolItem[] {
  const bs: number[] = [];
  for (let b = -3; b <= 3 + 1e-9; b += 0.3) bs.push(Math.round(b * 10) / 10);
  return bs.map((b, i) => ({
    id: `sint-${i}`,
    skillId: `mat:skill-${i}`,
    subjectId: "mat",
    area: "MT" as const,
    irt: { a, b, c: 0.2 },
  }));
}

const DISCRIMINACAO_TIPICA = 1.5;

function rodarUmaExecucao(trueTheta: number, seed: number): { theta: number; n: number } {
  const pool = poolSintetico(DISCRIMINACAO_TIPICA);
  const itemsById = new Map(pool.map((i) => [i.id, i]));
  const rng = mulberry32(seed);
  let state = startPlacement(`sim-${seed}`, "2026-09-24T10:00:00.000Z");
  let n = 0;

  for (;;) {
    const areaState = state.areas.MT ?? {
      itemIds: [],
      responses: [],
      theta: null,
      se: null,
      done: false,
    };
    if (
      (areaState.se !== null && areaState.se <= PLACEMENT_SE_STOP) ||
      n >= PLACEMENT_MAX_ITENS_TOTAL
    )
      break;
    const item = nextPlacementItem(pool, areaState, `sim-${seed}`, null);
    if (!item) break;
    const resp = simulateResponse(trueTheta, item.irt, rng, { dontKnowBelow: 0.15 });
    state = recordPlacementResponse(
      state,
      item,
      resp.correct,
      resp.response === "dont-know",
      itemsById,
    );
    n++;
  }

  return { theta: state.areas.MT?.theta ?? NaN, n };
}

describe("Simulação G — EAP recupera θ verdadeiro por área (docs/30 §26.3, AC-13.3)", () => {
  for (const trueTheta of [-1.5, 0, 1.5]) {
    test(`θ verdadeiro = ${trueTheta}: erro médio absoluto <= 0,6 em 50 execuções, <= 24 itens cada`, () => {
      const erros: number[] = [];
      for (let run = 0; run < 50; run++) {
        const { theta, n } = rodarUmaExecucao(trueTheta, 1000 * (trueTheta + 10) + run);
        expect(n).toBeLessThanOrEqual(PLACEMENT_MAX_ITENS_TOTAL);
        erros.push(Math.abs(theta - trueTheta));
      }
      const erroMedio = erros.reduce((a, b) => a + b, 0) / erros.length;
      expect(erroMedio).toBeLessThanOrEqual(0.6);
    });
  }
});
