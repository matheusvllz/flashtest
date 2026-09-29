import { beforeEach, describe, expect, test } from "bun:test";
import {
  abandonPlacement,
  applyPlacementOutcome,
  beginPlacement,
  commitPlan,
  finishPlacement,
  getState,
  reset,
  startJourneyActivity,
  submitPlacementResponse,
} from "@/lib/store";
import { PLACEMENT_APPLY_VERSION } from "@/lib/adaptive/constants";
import type { PlannedActivity } from "@/lib/adaptive/types";
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

  // docs/36 T-03.1 (RF-10): guardas contra duplo envio e envio depois de concluir.
  test("duplo envio do MESMO item conta uma resposta só (e não mexe de novo no skillModel)", () => {
    beginPlacement("seed-1");
    const itemsById = new Map([[ITEM_A.id, ITEM_A]]);
    submitPlacementResponse(SCOPE, itemsById, ITEM_A, true, false);
    const depoisDaPrimeira = JSON.stringify({
      p: getState().learning.placement,
      m: getState().learning.skillModel,
    });
    submitPlacementResponse(SCOPE, itemsById, ITEM_A, false, false); // duplo toque, resposta diferente
    const area = getState().learning.placement?.areas.MT;
    expect(area?.itemIds).toEqual(["p1"]);
    expect(area?.responses).toHaveLength(1);
    expect(area?.responses[0].correct).toBe(true);
    expect(
      JSON.stringify({ p: getState().learning.placement, m: getState().learning.skillModel }),
    ).toBe(depoisDaPrimeira);
  });

  test("envio depois de 'concluido' não muda nada (nem placement nem skillModel nem eventos)", () => {
    beginPlacement("seed-1");
    const pool = [ITEM_A, ITEM_B, { ...ITEM_A, id: "p3" }, { ...ITEM_A, id: "p4" }];
    const itemsById = new Map(pool.map((i) => [i.id, i]));
    for (const it of pool) submitPlacementResponse(SCOPE, itemsById, it, true, false);
    expect(getState().learning.placement?.status).toBe("concluido");
    const antes = JSON.stringify(getState().learning);
    const tardio: PlacementPoolItem = { ...ITEM_A, id: "p5", skillId: "mat:tardio" };
    submitPlacementResponse(SCOPE, new Map([[tardio.id, tardio]]), tardio, true, false);
    expect(JSON.stringify(getState().learning)).toBe(antes);
    expect(getState().learning.skillModel["mat:tardio"]).toBeUndefined();
    expect(getState().learning.events.filter((e) => e.type === "placement-completed")).toHaveLength(1);
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

/* -------------------------------------------------------------------------
 * docs/36 T-03.3 (RF-10/RF-11) — `applyPlacementOutcome`: aplicação única,
 * idempotente, numa transação só.
 * ---------------------------------------------------------------------- */

function entrada(skillId: string, over: Partial<SkillModelEntry> = {}): SkillModelEntry {
  return {
    skillId,
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
    updatedAt: "2026-09-28",
    ...over,
  };
}

function atv(id: string): PlannedActivity {
  return {
    id,
    kind: "pratica",
    skillIds: ["mat:x"],
    subjectId: "mat",
    estimatedMinutes: 2,
    reasons: ["consolidar"],
    score: 1,
    scoreBreakdown: {},
  };
}

/** Termina o nivelamento pelo caminho normal (última resposta fecha o status) — SEM aplicar. */
function terminarNivelamento() {
  beginPlacement("seed-1");
  const pool = [ITEM_A, ITEM_B, { ...ITEM_A, id: "p3" }, { ...ITEM_A, id: "p4" }];
  const itemsById = new Map(pool.map((i) => [i.id, i]));
  for (const it of pool) submitPlacementResponse(SCOPE, itemsById, it, true, false);
  expect(getState().learning.placement?.status).toBe("concluido");
  expect(getState().learning.placement?.appliedAt).toBeUndefined();
}

describe("applyPlacementOutcome", () => {
  test("aplica UMA vez: mescla priors, grava appliedAt/appliedVersion, esvazia a fila e registra o evento", () => {
    terminarNivelamento();
    commitPlan([atv("a1"), atv("a2"), atv("a3")], [atv("a4")]);
    const modelo = { "mat:novo": entrada("mat:novo") };

    expect(applyPlacementOutcome({ skillModel: modelo, appliedAt: "2026-09-28T11:00:00.000Z" })).toBe(true);
    const s = getState();
    expect(s.learning.placement?.appliedAt).toBe("2026-09-28T11:00:00.000Z");
    expect(s.learning.placement?.appliedVersion).toBe(PLACEMENT_APPLY_VERSION);
    expect(s.learning.skillModel["mat:novo"]?.source).toBe("prior-nivelamento");
    expect(s.learning.skillModel["mat:x"]).toBeDefined(); // evidência medida (submitPlacementResponse) continua
    expect(s.learning.journey.committed).toEqual([]);
    expect(s.learning.journey.upcoming).toEqual([]);
    expect(s.learning.events.filter((e) => e.type === "placement-applied")).toHaveLength(1);
  });

  test("aplicar 2x: a segunda devolve false e nada muda (skillModel, fila, appliedAt, eventos)", () => {
    terminarNivelamento();
    const modelo = { "mat:novo": entrada("mat:novo") };
    expect(applyPlacementOutcome({ skillModel: modelo, appliedAt: "2026-09-28T11:00:00.000Z" })).toBe(true);
    const depoisDaPrimeira = JSON.stringify(getState().learning);
    commitPlan([atv("b1")], []); // a fila foi reposta entre as duas chamadas
    const comFilaNova = JSON.stringify(getState().learning);
    expect(
      applyPlacementOutcome({ skillModel: { "mat:outro": entrada("mat:outro") }, appliedAt: "2026-09-28T12:00:00.000Z" }),
    ).toBe(false);
    expect(JSON.stringify(getState().learning)).toBe(comFilaNova); // a fila reposta NÃO foi esvaziada de novo
    expect(getState().learning.skillModel["mat:outro"]).toBeUndefined();
    expect(getState().learning.placement?.appliedAt).toBe("2026-09-28T11:00:00.000Z");
    expect(depoisDaPrimeira).not.toBe(comFilaNova); // (controle: a reposição mudou o estado)
  });

  test("com status 'em-andamento' (ou sem placement): false, nada muda", () => {
    expect(applyPlacementOutcome({ skillModel: {}, appliedAt: "x" })).toBe(false);
    beginPlacement("seed-1");
    commitPlan([atv("a1")], []);
    const antes = JSON.stringify(getState().learning);
    expect(applyPlacementOutcome({ skillModel: { "mat:novo": entrada("mat:novo") }, appliedAt: "x" })).toBe(false);
    expect(JSON.stringify(getState().learning)).toBe(antes);
  });

  test("a atividade INICIADA fica no topo da fila (RF-8); o resto é recomposto", () => {
    terminarNivelamento();
    commitPlan([atv("a1"), atv("a2"), atv("a3")], [atv("a4")]);
    startJourneyActivity(atv("a1"));
    applyPlacementOutcome({ skillModel: {}, appliedAt: "2026-09-28T11:00:00.000Z" });
    const j = getState().learning.journey;
    expect(j.activeActivity?.id).toBe("a1");
    expect(j.committed.map((a) => a.id)).toEqual(["a1"]);
    expect(j.upcoming).toEqual([]);
  });

  test("nunca sobrescreve entrada 'evidencia' gravada depois do cálculo; prior de matéria é substituído", () => {
    terminarNivelamento();
    const s0 = getState();
    // Estado FRESCO no momento de aplicar: evidência nova + prior de matéria antigo.
    s0.learning.skillModel["mat:e"] = entrada("mat:e", { source: "evidencia", nEff: 2, theta: 1.4, updatedAt: "2026-09-28T10:59:00.000Z" });
    s0.learning.skillModel["mat:pm"] = entrada("mat:pm", { source: "prior-materia", theta: -0.7 });
    const calculado = {
      "mat:e": entrada("mat:e", { source: "evidencia", nEff: 1, theta: 0.2, updatedAt: "2026-09-28T10:00:00.000Z" }), // fotografia velha
      "mat:pm": entrada("mat:pm", { theta: -1.2 }),
    };
    expect(applyPlacementOutcome({ skillModel: calculado, appliedAt: "2026-09-28T11:00:00.000Z" })).toBe(true);
    expect(getState().learning.skillModel["mat:e"]?.theta).toBe(1.4); // a mais nova vence
    expect(getState().learning.skillModel["mat:pm"]?.source).toBe("prior-nivelamento");
    expect(getState().learning.skillModel["mat:pm"]?.theta).toBe(-1.2);
  });

  test("um prior calculado nunca substitui evidência atual, mesmo mais nova no papel", () => {
    terminarNivelamento();
    getState().learning.skillModel["mat:e"] = entrada("mat:e", { source: "evidencia", nEff: 2, theta: 1.4, updatedAt: "2026-09-01" });
    applyPlacementOutcome({
      skillModel: { "mat:e": entrada("mat:e", { source: "prior-nivelamento", theta: -2, updatedAt: "2026-09-28" }) },
      appliedAt: "2026-09-28T11:00:00.000Z",
    });
    expect(getState().learning.skillModel["mat:e"]?.source).toBe("evidencia");
    expect(getState().learning.skillModel["mat:e"]?.theta).toBe(1.4);
  });

  test("ausentes > 0 vai para meta do evento placement-applied", () => {
    terminarNivelamento();
    applyPlacementOutcome({ skillModel: {}, appliedAt: "2026-09-28T11:00:00.000Z", ausentes: 2 });
    const ev = getState().learning.events.find((e) => e.type === "placement-applied");
    expect(ev?.meta).toEqual({ ausentes: 2 });
  });
});
