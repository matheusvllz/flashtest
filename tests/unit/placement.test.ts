import { describe, expect, test } from "bun:test";
import {
  advancePlacement,
  currentPlacementArea,
  estimateEAP,
  fisherInformation3PL,
  maxItensDaArea,
  nextPlacementItem,
  pickPlacementItem,
  placementConcluido,
  recordPlacementResponse,
  shouldStopArea,
  startPlacement,
  type PlacementPoolItem,
  type PlacementScope,
} from "@/lib/adaptive/placement";
import { PLACEMENT_PRIOR_MEAN, PLACEMENT_PRIOR_SD } from "@/lib/adaptive/constants";
import type { PlacementAreaState } from "@/lib/learning/types";

/**
 * Motor PURO do nivelamento (docs/30 §12.3, Fase 13 do docs/31 F13.3) —
 * testado com pools SINTÉTICOS, sem tocar `@/content/*` (ver o comentário no
 * topo de `placement.ts` sobre a fronteira de bundle). A ponte com o
 * catálogo real (`poolDiagnosticoDaArea`, `applyPlacement`) tem seu próprio
 * arquivo de teste, `placement-pool.test.ts`.
 */

function item(id: string, skillId: string, subjectId: string, b: number): PlacementPoolItem {
  return { id, skillId, subjectId, area: "MT", irt: { a: 1, b, c: 0.2 }, incidence: 2 };
}

/** Cálculo de referência INDEPENDENTE (não reusa `estimateEAP`) — mesma definição do `30` §12.3, escrita à parte. */
function referenceEAP(
  responses: Array<{ a: number; b: number; c: number; correct: boolean; dontKnow: boolean }>,
): { theta: number; se: number } {
  const SLIP = 0.1;
  const grid: number[] = [];
  for (let t = -4; t <= 4 + 1e-9; t += 0.2) grid.push(Math.round(t * 100) / 100);
  const dens = (x: number, m: number, s: number) => Math.exp(-0.5 * ((x - m) / s) ** 2);
  const weights = grid.map((theta) => {
    let w = dens(theta, -0.3, 1.0);
    for (const r of responses) {
      const p2 = 1 / (1 + Math.exp(-r.a * (theta - r.b)));
      const p = r.dontKnow ? (1 - SLIP) * p2 : r.c + (1 - r.c - SLIP) * p2;
      const u = !r.dontKnow && r.correct;
      w *= u ? p : 1 - p;
    }
    return w;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  const norm = weights.map((w) => w / total);
  const theta = grid.reduce((acc, t, i) => acc + t * norm[i], 0);
  const variance = grid.reduce((acc, t, i) => acc + (t - theta) ** 2 * norm[i], 0);
  return { theta, se: Math.sqrt(variance) };
}

describe("estimateEAP — bate com cálculo de referência independente, 3 casos fixos (±0,02, AC-13.3)", () => {
  test("sem respostas: theta = prior, se = prior", () => {
    const r = estimateEAP([]);
    expect(Math.abs(r.theta - PLACEMENT_PRIOR_MEAN)).toBeLessThanOrEqual(0.02);
    expect(Math.abs(r.se - PLACEMENT_PRIOR_SD)).toBeLessThanOrEqual(0.02);
  });

  test("1 acerto num item médio (b=0)", () => {
    const irt = { a: 1, b: 0, c: 0.2 };
    const r = estimateEAP([{ irt, correct: true, dontKnow: false }]);
    const ref = referenceEAP([{ a: 1, b: 0, c: 0.2, correct: true, dontKnow: false }]);
    expect(Math.abs(r.theta - ref.theta)).toBeLessThanOrEqual(0.02);
    expect(Math.abs(r.se - ref.se)).toBeLessThanOrEqual(0.02);
  });

  test("3 respostas mistas (2 acertos fáceis, 1 erro difícil) — 1 'não sei' também", () => {
    const facil = { a: 1, b: -1.5, c: 0.2 };
    const dificil = { a: 1, b: 1.5, c: 0.2 };
    const respostas = [
      { irt: facil, correct: true, dontKnow: false },
      { irt: facil, correct: true, dontKnow: false },
      { irt: dificil, correct: false, dontKnow: false },
      { irt: dificil, correct: false, dontKnow: true },
    ];
    const r = estimateEAP(respostas);
    const ref = referenceEAP([
      { a: 1, b: -1.5, c: 0.2, correct: true, dontKnow: false },
      { a: 1, b: -1.5, c: 0.2, correct: true, dontKnow: false },
      { a: 1, b: 1.5, c: 0.2, correct: false, dontKnow: false },
      { a: 1, b: 1.5, c: 0.2, correct: false, dontKnow: true },
    ]);
    expect(Math.abs(r.theta - ref.theta)).toBeLessThanOrEqual(0.02);
    expect(Math.abs(r.se - ref.se)).toBeLessThanOrEqual(0.02);
  });

  test("SE encolhe conforme mais respostas chegam", () => {
    const irt = { a: 1, b: 0, c: 0.2 };
    const se0 = estimateEAP([]).se;
    const se1 = estimateEAP([{ irt, correct: true, dontKnow: false }]).se;
    const se3 = estimateEAP([
      { irt, correct: true, dontKnow: false },
      { irt, correct: true, dontKnow: false },
      { irt, correct: false, dontKnow: false },
    ]).se;
    expect(se1).toBeLessThan(se0);
    expect(se3).toBeLessThan(se1);
  });
});

describe("fisherInformation3PL", () => {
  test("é máxima perto de b (item mais informativo no seu próprio ponto)", () => {
    const irt = { a: 1, b: 0, c: 0.2 };
    const noB = fisherInformation3PL(0, irt);
    const longeDeB = fisherInformation3PL(3, irt);
    expect(noB).toBeGreaterThan(longeDeB);
  });
});

describe("shouldStopArea", () => {
  test("para quando SE <= 0,45", () => {
    const area: Pick<PlacementAreaState, "itemIds" | "se"> = { itemIds: ["a", "b"], se: 0.4 };
    expect(shouldStopArea(area, false, 20)).toBe(true);
  });

  test("não para com SE alto e orçamento disponível", () => {
    const area: Pick<PlacementAreaState, "itemIds" | "se"> = { itemIds: ["a"], se: 0.9 };
    expect(shouldStopArea(area, false, 20)).toBe(false);
  });

  test("para ao atingir o máximo de itens da área (4 normal, 6 prioritária)", () => {
    expect(maxItensDaArea(false)).toBe(4);
    expect(maxItensDaArea(true)).toBe(6);
    const areaNormal: Pick<PlacementAreaState, "itemIds" | "se"> = {
      itemIds: ["a", "b", "c", "d"],
      se: 0.9,
    };
    expect(shouldStopArea(areaNormal, false, 20)).toBe(true);
    expect(shouldStopArea(areaNormal, true, 20)).toBe(false);
  });

  test("para quando o orçamento total acaba", () => {
    const area: Pick<PlacementAreaState, "itemIds" | "se"> = { itemIds: ["a"], se: 0.9 };
    expect(shouldStopArea(area, false, 0)).toBe(true);
  });
});

describe("nextPlacementItem — seleção e balanceamento", () => {
  const pool = [
    item("i1", "mat:a", "mat", 0),
    item("i2", "mat:a", "mat", 0.1),
    item("i3", "mat:b", "mat", -0.2),
    item("i4", "mat:b", "mat", 2),
  ];

  test("primeiro item: b mais próximo de 0", () => {
    const escolhido = nextPlacementItem(pool, { itemIds: [], theta: null }, "seed", null);
    expect(escolhido?.id).toBe("i1");
  });

  test("prioriza habilidade ainda não usada na área", () => {
    // i1 (mat:a) já usado — só i3/i4 (mat:b) ainda não usaram a habilidade.
    const escolhido = nextPlacementItem(pool, { itemIds: ["i1"], theta: 0 }, "seed", null);
    expect(escolhido?.skillId).toBe("mat:b");
  });

  test("devolve null quando o pool acabou", () => {
    const escolhido = nextPlacementItem(
      pool,
      { itemIds: ["i1", "i2", "i3", "i4"], theta: 0 },
      "seed",
      null,
    );
    expect(escolhido).toBeNull();
  });

  test("determinístico: mesma semente, mesma escolha", () => {
    const a = nextPlacementItem(pool, { itemIds: ["i1"], theta: 0 }, "semente-fixa", null);
    const b = nextPlacementItem(pool, { itemIds: ["i1"], theta: 0 }, "semente-fixa", null);
    expect(a?.id).toBe(b?.id);
  });
});

describe("recordPlacementResponse / advancePlacement / currentPlacementArea", () => {
  const scope: PlacementScope = { areas: ["MT"], priorityAreas: new Set() };
  const pool = [
    item("i1", "mat:a", "mat", 0),
    item("i2", "mat:a", "mat", 0.2),
    item("i3", "mat:b", "mat", -0.3),
  ];
  const itemsById = new Map(pool.map((i) => [i.id, i]));

  test("registra resposta e recalcula theta/se da área", () => {
    let state = startPlacement("seed", "2026-09-24T10:00:00.000Z");
    state = recordPlacementResponse(state, pool[0], true, false, itemsById);
    expect(state.areas.MT?.itemIds).toEqual(["i1"]);
    expect(state.areas.MT?.theta).not.toBeNull();
    expect(state.areas.MT?.done).toBe(false);
  });

  test("pickPlacementItem fecha a área sozinho quando o pool (3 itens, < 4) acaba antes de bater SE/limite", () => {
    let state = startPlacement("seed", "now");
    const poolFn = () => pool;
    for (let i = 0; i < pool.length; i++) {
      const escolha = pickPlacementItem(state, scope, poolFn, "seed", null);
      expect(escolha.item).not.toBeNull();
      state = advancePlacement(escolha.state, scope, escolha.item!, true, false, itemsById);
    }
    const semMaisItens = pickPlacementItem(state, scope, poolFn, "seed", null);
    expect(semMaisItens.item).toBeNull();
    expect(placementConcluido(semMaisItens.state, scope)).toBe(true);
  });

  test("marca a área concluída ao bater o máximo de itens (área normal = 4)", () => {
    const poolGrande = [
      item("g1", "mat:a", "mat", 0),
      item("g2", "mat:a", "mat", 0.1),
      item("g3", "mat:b", "mat", -0.1),
      item("g4", "mat:b", "mat", 0.3),
      item("g5", "mat:c", "mat", -0.3),
    ];
    const idsMap = new Map(poolGrande.map((i) => [i.id, i]));
    let state = startPlacement("seed", "now");
    for (const it of poolGrande.slice(0, 4)) {
      state = advancePlacement(state, scope, it, true, false, idsMap);
    }
    expect(state.areas.MT?.done).toBe(true);
    expect(state.areas.MT?.itemIds.length).toBe(4);
  });

  test("pickPlacementItem passa pra próxima área do escopo (CN) quando MT esgota, e termina quando CN também não tem pool", () => {
    const scope2: PlacementScope = { areas: ["MT", "CN"], priorityAreas: new Set() };
    const poolFn = (a: "MT" | "CN") => (a === "MT" ? pool : []);
    let state = startPlacement("seed", "now");
    let voltas = 0;
    for (;;) {
      const escolha = pickPlacementItem(state, scope2, poolFn, "seed", null);
      if (!escolha.item) {
        state = escolha.state;
        break;
      }
      state = advancePlacement(escolha.state, scope2, escolha.item, true, false, itemsById);
      voltas++;
      expect(voltas).toBeLessThanOrEqual(pool.length + 1); // guarda contra loop infinito
    }
    expect(voltas).toBe(pool.length); // os 3 itens de MT, nenhum de CN (pool vazio)
    expect(placementConcluido(state, scope2)).toBe(true);
  });
});

/**
 * docs/36 RF-12 (bug C3, corrigido na T-03.2): retomar o nivelamento depois de
 * recarregar dá o MESMO θ̂/SE da execução contínua.
 *
 * Roteiro sintético de §D C3: pool de 12 itens (a 1,2; b de −1,5 a +1,8;
 * c 0,2), semente fixa, área MT prioritária (6 itens), respostas alternadas
 * (certo, errado, certo…). Execução contínua vs. execução "recarregada": ao
 * remontar `/nivelamento` a rota recriava `itemsShownRef = new Map()`;
 * `recordPlacementResponse` descarta em silêncio as respostas cujo item não
 * está no mapa e θ̂/SE divergiam. A correção da rota é reconstituir o mapa a
 * partir do `PlacementState` (`placementItemsById`, em `placement-pool.ts`,
 * que importa o catálogo e por isso NÃO é usado aqui — este arquivo é o motor
 * puro). `reconstituirDoEstado` abaixo é o mesmo contrato sobre o pool
 * sintético: id respondido → item do pool. A reconstituição REAL, com o
 * catálogo, é coberta em `placement-pool.test.ts`.
 */
describe("nivelamento retomado após reload = execução contínua (docs/36 RF-12, C3)", () => {
  const scope: PlacementScope = { areas: ["MT"], priorityAreas: new Set(["MT"]) };
  const bs = [-1.5, -1.2, -0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8];
  const pool: PlacementPoolItem[] = bs.map((b, i) => ({
    id: `c3-${i}`,
    skillId: `mat:s${i}`,
    subjectId: i % 2 === 0 ? "mat" : "fis",
    area: "MT",
    irt: { a: 1.2, b, c: 0.2 },
    incidence: 2,
  }));
  const poolFn = () => pool;
  const SEED = "seed-fixa";
  const TOTAL = 6;

  /**
   * Roda o CAT respondendo certo/errado alternado; `recarregarAntesDe` = índice
   * (0-based) da resposta em que a página é "recarregada". `sequencia` fixa os
   * itens mostrados (a da execução contínua), isolando a estimativa: só o mapa
   * de itens difere entre as duas execuções (o plano §D C3 mede "mesmos itens
   * escolhidos; só a estimativa diverge").
   */
  function rodar(
    recarregarAntesDe: number | null,
    remontar: (estado: ReturnType<typeof startPlacement>) => Map<string, PlacementPoolItem>,
    sequencia?: string[],
  ) {
    let state = startPlacement(SEED, "2026-09-28T10:00:00.000Z");
    let mapa = new Map<string, PlacementPoolItem>();
    let ultimaMateria: string | null = null;
    const escolhidos: string[] = [];
    for (let i = 0; i < TOTAL; i++) {
      if (recarregarAntesDe === i) mapa = remontar(state); // nova montagem da rota
      const escolha = pickPlacementItem(state, scope, poolFn, SEED, ultimaMateria);
      const item = sequencia ? pool.find((p) => p.id === sequencia[i]) : escolha.item;
      if (!item) break;
      mapa.set(item.id, item); // `itemsShownRef.current.set(...)` da rota
      escolhidos.push(item.id);
      state = advancePlacement(escolha.state, scope, item, i % 2 === 0, false, mapa);
      ultimaMateria = item.subjectId;
    }
    return { state, escolhidos };
  }

  /** O que a rota agora faz ao montar: os itens JÁ respondidos voltam pro mapa (contrato de `placementItemsById`). */
  const reconstituirDoEstado = (estado: ReturnType<typeof startPlacement>) => {
    const mapa = new Map<string, PlacementPoolItem>();
    for (const a of Object.values(estado.areas)) {
      for (const id of a.itemIds) {
        const it = pool.find((p) => p.id === id);
        if (it) mapa.set(id, it);
      }
    }
    return mapa;
  };
  /** O comportamento ANTIGO da rota (a causa do bug): mapa recriado vazio a cada montagem. */
  const mapaVazioDaRotaAntiga = () => new Map<string, PlacementPoolItem>();

  test("6 respostas alternadas, recarregando antes da 4ª: mesmo θ̂ e SE da execução contínua (tolerância 1e-9)", () => {
    const continuo = rodar(null, reconstituirDoEstado);
    const retomado = rodar(3, reconstituirDoEstado, continuo.escolhidos);
    expect(continuo.escolhidos).toHaveLength(TOTAL);
    expect(retomado.escolhidos).toEqual(continuo.escolhidos);
    expect(Math.abs(retomado.state.areas.MT!.theta! - continuo.state.areas.MT!.theta!)).toBeLessThan(1e-9);
    expect(Math.abs(retomado.state.areas.MT!.se! - continuo.state.areas.MT!.se!)).toBeLessThan(1e-9);
  });

  test("controle: SEM reconstituir (mapa vazio, o comportamento antigo) a estimativa diverge — é isso que o teste acima protege", () => {
    const continuo = rodar(null, reconstituirDoEstado);
    const antigo = rodar(3, mapaVazioDaRotaAntiga, continuo.escolhidos);
    const dTheta = Math.abs(antigo.state.areas.MT!.theta! - continuo.state.areas.MT!.theta!);
    expect(dTheta).toBeGreaterThan(0.05);
  });

  test("recarregar em QUALQUER ponto (1ª a 5ª resposta) também preserva θ̂/SE", () => {
    const continuo = rodar(null, reconstituirDoEstado);
    for (let ponto = 1; ponto < TOTAL; ponto++) {
      const retomado = rodar(ponto, reconstituirDoEstado, continuo.escolhidos);
      expect(Math.abs(retomado.state.areas.MT!.theta! - continuo.state.areas.MT!.theta!)).toBeLessThan(1e-9);
      expect(Math.abs(retomado.state.areas.MT!.se! - continuo.state.areas.MT!.se!)).toBeLessThan(1e-9);
    }
  });
});
