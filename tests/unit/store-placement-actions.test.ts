import { beforeEach, describe, expect, test } from "bun:test";
import {
  abandonPlacement,
  beginPlacement,
  finishPlacement,
  getState,
  reset,
  submitPlacementResponse,
} from "@/lib/store";
import type { PlacementPoolItem, PlacementScope } from "@/lib/adaptive/placement";
import type { SkillModelEntry } from "@/lib/learning/types";

/**
 * Ações de store do nivelamento (docs/30 §12.3, Fase 13 do docs/31 F13.5) —
 * `beginPlacement`/`submitPlacementResponse`/`finishPlacement`/
 * `abandonPlacement`. Pool/scope construídos à mão (mesma forma que a rota
 * `/nivelamento` vai passar) — `store.ts` nunca importa `@/content/*`.
 */
beforeEach(() => reset());

const ITEM_A: PlacementPoolItem = {
  id: "p1",
  skillId: "mat:x",
  subjectId: "mat",
  area: "MT",
  irt: { a: 1, b: 0, c: 0.2 },
  incidence: 2,
};
const ITEM_B: PlacementPoolItem = {
  id: "p2",
  skillId: "mat:y",
  subjectId: "mat",
  area: "MT",
  irt: { a: 1, b: 0.2, c: 0.2 },
  incidence: 2,
};
const SCOPE: PlacementScope = { areas: ["MT"], priorityAreas: new Set() };

describe("beginPlacement", () => {
  test("cria learning.placement 'em-andamento'", () => {
    beginPlacement("seed-1");
    const p = getState().learning.placement;
    expect(p?.status).toBe("em-andamento");
    expect(p?.seed).toBe("seed-1");
    expect(p?.areas).toEqual({});
  });

  test("não substitui um nivelamento já em andamento (não apaga respostas)", () => {
    beginPlacement("seed-1");
    const itemsById = new Map([[ITEM_A.id, ITEM_A]]);
    submitPlacementResponse(SCOPE, itemsById, ITEM_A, true, false);
    beginPlacement("seed-2"); // tentativa de recomeçar
    expect(getState().learning.placement?.seed).toBe("seed-1"); // ignorado
    expect(getState().learning.placement?.areas.MT?.itemIds).toEqual(["p1"]);
  });

  test("começa do zero se o anterior já estava concluído (refazer)", () => {
    beginPlacement("seed-1");
    finishPlacement({});
    setPlacementStatusConcluidoParaTeste();
    beginPlacement("seed-2");
    expect(getState().learning.placement?.seed).toBe("seed-2");
  });
});

function setPlacementStatusConcluidoParaTeste() {
  // `finishPlacement` só troca o skillModel (docs/32 F13.5) — quem marca
  // `status: "concluido"` é `submitPlacementResponse` ao detectar o fim do
  // escopo. Pra testar "refazer" sem rodar o CAT inteiro, simulamos direto.
  const s = getState();
  if (s.learning.placement) {
    s.learning.placement = { ...s.learning.placement, status: "concluido" };
  }
}

describe("submitPlacementResponse", () => {
  test("recalcula theta/se da área e atualiza skillModel da habilidade (papel diagnostico, source evidencia)", () => {
    beginPlacement("seed-1");
    const itemsById = new Map([[ITEM_A.id, ITEM_A]]);
    submitPlacementResponse(SCOPE, itemsById, ITEM_A, true, false);
    const s = getState();
    expect(s.learning.placement?.areas.MT?.itemIds).toEqual(["p1"]);
    expect(s.learning.placement?.areas.MT?.theta).not.toBeNull();
    expect(s.learning.skillModel["mat:x"]).toBeDefined();
    expect(s.learning.skillModel["mat:x"].source).toBe("evidencia");
  });

  test("marca 'concluido' + evento placement-completed quando o escopo termina (área normal, 4 itens)", () => {
    beginPlacement("seed-1");
    const pool = [ITEM_A, ITEM_B, { ...ITEM_A, id: "p3" }, { ...ITEM_A, id: "p4" }];
    const itemsById = new Map(pool.map((i) => [i.id, i]));
    for (const it of pool) submitPlacementResponse(SCOPE, itemsById, it, true, false);
    const s = getState();
    expect(s.learning.placement?.status).toBe("concluido");
    expect(s.learning.placement?.finishedAt).not.toBeNull();
    expect(s.learning.events.some((e) => e.type === "placement-completed")).toBe(true);
  });

  test("sem placement em andamento: não faz nada (nunca lança)", () => {
    expect(() => submitPlacementResponse(SCOPE, new Map(), ITEM_A, true, false)).not.toThrow();
    expect(getState().learning.placement).toBeNull();
  });
});

describe("finishPlacement", () => {
  test("substitui learning.skillModel pelo resultado de applyPlacement", () => {
    const entries: Record<string, SkillModelEntry> = {
      "mat:z": {
        skillId: "mat:z",
        theta: 0.1,
        sigma: 1.1,
        nEff: 0,
        difficultiesSeen: [],
        recent: [],
        independentShare: 0,
        lastEvidenceDate: null,
        lapses: 0,
        dontKnowRecent: 0,
        helpHeavyRecent: 0,
        source: "prior-nivelamento",
        algoVersion: 1,
        updatedAt: "2026-09-24",
      },
    };
    finishPlacement(entries);
    expect(getState().learning.skillModel).toEqual(entries);
  });
});

describe("abandonPlacement", () => {
  test("marca 'abandonado' sem apagar respostas já dadas; sem placement, não faz nada", () => {
    expect(() => abandonPlacement()).not.toThrow();
    beginPlacement("seed-1");
    const itemsById = new Map([[ITEM_A.id, ITEM_A]]);
    submitPlacementResponse(SCOPE, itemsById, ITEM_A, true, false);
    abandonPlacement();
    const s = getState();
    expect(s.learning.placement?.status).toBe("abandonado");
    expect(s.learning.placement?.areas.MT?.itemIds).toEqual(["p1"]);
  });
});
