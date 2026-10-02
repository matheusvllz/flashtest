import { describe, expect, test } from "bun:test";
import {
  advancePlacement,
  cotasDoNivelamento,
  cotasParaRetomar,
  currentPlacementArea,
  pickPlacementItem,
  placementConcluido,
  startPlacement,
  totalDoNivelamento,
  type EnemAreaLike,
  type PlacementPoolItem,
  type PlacementScope,
} from "@/lib/adaptive/placement";
import { PLACEMENT_MAX_ITENS_TOTAL, PLACEMENT_TOTAL_ITENS } from "@/lib/adaptive/constants";

/**
 * Nivelamento de tamanho fixo (spec 49 D49-11, T-49.4.2): 30 questões divididas entre as áreas, sem parada antecipada
 * por SE, para o aviso "São 30 questões" ser verdadeiro. Estado sem `cotas` (começado antes) segue a regra antiga.
 */

const AREAS: EnemAreaLike[] = ["LC", "MT", "CN", "CH"];
const tamanhoFixo = (n: number) => () => n;

function poolDe(area: EnemAreaLike, n: number): PlacementPoolItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${area}-${i}`,
    skillId: `${area.toLowerCase()}:h${i}`,
    subjectId: `${area.toLowerCase()}${i % 2}`,
    area,
    irt: { a: 1, b: (i % 9) / 3 - 1.3, c: 0.2 },
    incidence: 2 as const,
  }));
}

describe("cotasDoNivelamento", () => {
  test("2 prioritárias + 2 normais = 9, 9, 6, 6", () => {
    const scope: PlacementScope = { areas: ["MT", "CN", "LC", "CH"], priorityAreas: new Set(["MT", "CN"]) };
    expect(cotasDoNivelamento(scope, tamanhoFixo(40))).toEqual({ MT: 9, CN: 9, LC: 6, CH: 6 });
  });

  test("todas prioritárias (padrão sem matéria difícil) = 8, 8, 7, 7 e soma 30", () => {
    const scope: PlacementScope = { areas: AREAS, priorityAreas: new Set(AREAS) };
    const cotas = cotasDoNivelamento(scope, tamanhoFixo(40));
    expect(Object.values(cotas).reduce((a, n) => a + n, 0)).toBe(30);
    expect(Object.values(cotas).sort()).toEqual([7, 7, 8, 8]);
  });

  test("uma área só fica com as 30", () => {
    expect(cotasDoNivelamento({ areas: ["MT"], priorityAreas: new Set(["MT"]) }, tamanhoFixo(34))).toEqual({ MT: 30 });
  });

  test("área com pool curto: a sobra vai para as outras, sem passar do pool", () => {
    const scope: PlacementScope = { areas: AREAS, priorityAreas: new Set(AREAS) };
    const cotas = cotasDoNivelamento(scope, (a) => (a === "CN" ? 3 : 40));
    expect(cotas.CN).toBe(3);
    expect(Object.values(cotas).reduce((a, n) => a + n, 0)).toBe(30);
  });

  test("pool total menor que 30: a soma é o que existe", () => {
    const scope: PlacementScope = { areas: ["MT", "CN"], priorityAreas: new Set(["MT"]) };
    expect(cotasDoNivelamento(scope, tamanhoFixo(5))).toEqual({ MT: 5, CN: 5 });
  });

  test("retomar nivelamento antigo: nenhuma cota fica abaixo do já respondido", () => {
    const scope: PlacementScope = { areas: ["MT", "CN", "LC", "CH"], priorityAreas: new Set(["MT", "CN"]) };
    const antigo = startPlacement("s", "2026-10-02T00:00:00Z");
    antigo.areas.LC = { itemIds: ["a", "b", "c", "d", "e", "f", "g"], responses: [], theta: 0, se: 0.5, done: false };
    expect(cotasParaRetomar(antigo, scope, tamanhoFixo(40)).LC).toBe(7);
  });
});

describe("motor com cotas", () => {
  const scope: PlacementScope = { areas: ["MT", "CN", "LC", "CH"], priorityAreas: new Set(["MT", "CN"]) };
  const pools = Object.fromEntries(AREAS.map((a) => [a, poolDe(a, 40)])) as Record<EnemAreaLike, PlacementPoolItem[]>;
  const poolDaArea = (a: EnemAreaLike) => pools[a] ?? [];
  const itemsById = new Map(AREAS.flatMap((a) => pools[a]).map((i) => [i.id, i]));

  test("responde exatamente 30, mesmo acertando tudo (sem parada por SE), e respeita a cota de cada área", () => {
    let state = { ...startPlacement("seed-30", "2026-10-02T00:00:00Z"), cotas: cotasDoNivelamento(scope, () => 40) };
    expect(totalDoNivelamento(state)).toBe(PLACEMENT_TOTAL_ITENS);
    let respondidas = 0;
    for (let i = 0; i < 100; i++) {
      const { item, state: s2 } = pickPlacementItem(state, scope, poolDaArea, state.seed, null);
      state = s2;
      if (!item) break;
      state = advancePlacement(state, scope, item, true, false, itemsById);
      respondidas++;
    }
    expect(respondidas).toBe(30);
    expect(placementConcluido(state, scope)).toBe(true);
    expect(Object.fromEntries(Object.entries(state.areas).map(([a, s]) => [a, s.itemIds.length]))).toEqual({ MT: 9, CN: 9, LC: 6, CH: 6 });
  });

  test("sem cotas (nivelamento antigo) o teto continua 24 e a área pode parar antes por SE", () => {
    let state = startPlacement("seed-antigo", "2026-10-02T00:00:00Z");
    expect(totalDoNivelamento(state)).toBe(PLACEMENT_MAX_ITENS_TOTAL);
    let respondidas = 0;
    for (let i = 0; i < 100; i++) {
      const { item, state: s2 } = pickPlacementItem(state, scope, poolDaArea, state.seed, null);
      state = s2;
      if (!item) break;
      state = advancePlacement(state, scope, item, true, false, itemsById);
      respondidas++;
    }
    expect(respondidas).toBeLessThanOrEqual(24);
    expect(currentPlacementArea(state, scope)).toBeNull();
  });
});
