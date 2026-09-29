import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import {
  advancePlacement,
  pickPlacementItem,
  startPlacement,
  type PlacementPoolItem,
  type PlacementScope,
} from "@/lib/adaptive/placement";
import {
  applyPlacement,
  areaTemPoolSuficiente,
  computePlacementOutcome,
  placementItemsById,
  poolDiagnosticoDaArea,
} from "@/lib/adaptive/placement-pool";
import { itemIndex, itemMetaOf, _setRetiredForTests } from "@/content/items";
import { resolveExercise } from "@/content/microlicoes";
import { carregarPacotesReais } from "./helpers/pacotes-reais";
import { activeSkills, SKILL_MAP } from "@/content/taxonomy";
import { areaOfSubject } from "@/content/taxonomy/areas";
import type { SkillModelEntry } from "@/lib/learning/types";

/**
 * Ponte com o catálogo real (docs/30 §12.3, Fase 13 do docs/31 F13.3/F13.5)
 * — `applyPlacement` usa habilidades ATIVAS de verdade (`activeSkills()`),
 * por isso está separado do motor puro em `placement.ts`/`placement.test.ts`
 * (regra de fronteira de bundle, `store-bundle-boundary.test.ts`).
 */

function item(id: string, skillId: string, subjectId: string, b: number): PlacementPoolItem {
  return { id, skillId, subjectId, area: "MT", irt: { a: 1, b, c: 0.2 }, incidence: 2 };
}

describe("applyPlacement — prior pras habilidades não medidas", () => {
  const scope: PlacementScope = { areas: ["MT"], priorityAreas: new Set() };
  const pool = [item("p1", "mat:operacoes-fundamentais", "mat", 0)];
  const itemsById = new Map(pool.map((i) => [i.id, i]));

  test("habilidade respondida (evidência real) não é sobrescrita; outras ativas de MT recebem prior", () => {
    let state = startPlacement("seed", "2026-09-24T10:00:00.000Z");
    state = advancePlacement(state, scope, pool[0], true, false, itemsById);
    state = { ...state, status: "concluido", finishedAt: "2026-09-24T10:05:00.000Z" };

    // Evidência real simulada (é isso que `store.ts` faz em tempo real a cada resposta).
    const medida: SkillModelEntry = {
      skillId: "mat:operacoes-fundamentais",
      theta: 0.5,
      sigma: 1.0,
      nEff: 1.2,
      difficultiesSeen: [2],
      recent: [1],
      independentShare: 1,
      lastEvidenceDate: "2026-09-24",
      lapses: 0,
      dontKnowRecent: 0,
      helpHeavyRecent: 0,
      source: "evidencia",
      algoVersion: 1,
      updatedAt: "2026-09-24T10:00:00.000Z",
    };
    const skillModelAntes = { "mat:operacoes-fundamentais": medida };

    const resultado = applyPlacement(state, skillModelAntes, itemsById, "2026-09-24");

    // A habilidade medida diretamente não muda.
    expect(resultado["mat:operacoes-fundamentais"]).toBe(medida);

    // Outra habilidade ativa de MT sem resposta ganha prior da área, nEff 0, Confidence 0.
    expect(resultado["mat:razao-proporcao"]).toBeDefined();
    expect(resultado["mat:razao-proporcao"]?.source).toBe("prior-nivelamento");
    expect(resultado["mat:razao-proporcao"]?.nEff).toBe(0);
    expect(resultado["mat:razao-proporcao"]?.theta).toBe(state.areas.MT?.theta);
  });

  test("nunca sobrescreve source 'evidencia', mesmo se a habilidade não tem resposta no nivelamento", () => {
    let state = startPlacement("seed", "now");
    state = advancePlacement(state, scope, pool[0], true, false, itemsById);
    state = { ...state, status: "concluido", finishedAt: "now" };

    const jaTinhaEvidencia: SkillModelEntry = {
      skillId: "mat:razao-proporcao",
      theta: 1.2,
      sigma: 0.5,
      nEff: 5,
      difficultiesSeen: [1, 2, 3],
      recent: [1, 1, 1],
      independentShare: 1,
      lastEvidenceDate: "2026-09-20",
      lapses: 0,
      dontKnowRecent: 0,
      helpHeavyRecent: 0,
      source: "evidencia",
      algoVersion: 1,
      updatedAt: "2026-09-20T10:00:00.000Z",
    };
    const resultado = applyPlacement(
      state,
      { "mat:razao-proporcao": jaTinhaEvidencia },
      itemsById,
      "2026-09-24",
    );
    expect(resultado["mat:razao-proporcao"]).toBe(jaTinhaEvidencia);
  });

  test("área sem nenhuma resposta (theta null) não gera prior nenhum", () => {
    const state = startPlacement("seed", "now"); // nenhuma resposta ainda
    const resultado = applyPlacement(state, {}, new Map(), "2026-09-24");
    expect(Object.keys(resultado).length).toBe(0);
  });
});

describe("poolDiagnosticoDaArea / areaTemPoolSuficiente — estado real do catálogo (docs/32 Fase 13)", () => {
  test("hoje devolve vazio pra toda área — zero itens com papel 'diagnostico' no catálogo (Fase 11 pendente)", () => {
    for (const area of ["LC", "MT", "CN", "CH"] as const) {
      const pool = poolDiagnosticoDaArea(area);
      expect(pool).toEqual([]);
      expect(areaTemPoolSuficiente(pool)).toBe(false);
    }
  });
});

/* -------------------------------------------------------------------------
 * docs/36 T-03.2 (RF-12) — reconstituição do mapa de itens a partir do
 * PlacementState, com o CATÁLOGO REAL (ids de pacote resolvem pela meta do
 * índice leve mesmo sem o pacote em memória).
 * ---------------------------------------------------------------------- */

/** Ids diagnósticos reais (já promovidos) de uma área, na ordem do índice — não depende de o pacote estar carregado. */
function idsDiagnosticosReais(area: "MT" | "CN" | "LC" | "CH", n: number): string[] {
  return itemIndex()
    .filter((e) => e.roles.includes("diagnostico"))
    .filter((e) => e.status === "revisada-humano" || e.status === "oficial-conferida")
    .filter((e) => e.subjectId && areaOfSubject(e.subjectId) === area)
    .slice(0, n)
    .map((e) => e.id);
}

type AreaChave = "MT" | "CN" | "LC" | "CH";

/** PlacementState com respostas dadas (theta/SE recalculados pelo motor sobre os itens do mapa). */
function placementComRespostas(
  porArea: Partial<Record<AreaChave, { ids: string[]; certas: boolean[] }>>,
  status: "em-andamento" | "concluido" = "concluido",
) {
  const areas = Object.keys(porArea) as AreaChave[];
  const scope: PlacementScope = { areas, priorityAreas: new Set() };
  let state = startPlacement("seed-real", "2026-09-28T10:00:00.000Z");
  const { byId } = placementItemsById({
    ...state,
    areas: Object.fromEntries(
      areas.map((a) => [a, { itemIds: porArea[a]!.ids, responses: [], theta: null, se: null, done: false }]),
    ),
  });
  for (const a of areas) {
    porArea[a]!.ids.forEach((id, i) => {
      state = advancePlacement(state, scope, byId.get(id)!, porArea[a]!.certas[i], false, byId);
    });
  }
  return status === "concluido" ? { ...state, status, finishedAt: "2026-09-28T10:08:00.000Z" } : state;
}

describe("placementItemsById — reconstituição (docs/36 T-03.2, RF-12, C3)", () => {
  test("cada id respondido volta com skillId/subjectId/area/irt da meta atual; nenhum ausente", () => {
    const ids = idsDiagnosticosReais("MT", 4);
    expect(ids).toHaveLength(4);
    const p = placementComRespostas({ MT: { ids, certas: [true, false, true, false] } }, "em-andamento");
    const { byId, ausentes } = placementItemsById(p);
    expect(ausentes).toEqual([]);
    expect([...byId.keys()].sort()).toEqual([...ids].sort());
    for (const id of ids) {
      const it = byId.get(id)!;
      const meta = itemMetaOf(id);
      expect(it.skillId).toBe(meta.skillIds[0]);
      expect(it.subjectId).toBe(SKILL_MAP[it.skillId].subjectId);
      expect(it.area).toBe("MT");
      expect(it.irt).toEqual({ a: meta.irt.a, b: meta.irt.b, c: meta.irt.c });
    }
  });

  test("item que NÃO é (mais) diagnóstico continua resolvendo pela meta (banco geral 'q10')", () => {
    expect(itemMetaOf("q10").roles.includes("diagnostico")).toBe(false);
    const p = {
      ...startPlacement("s", "now"),
      areas: {
        MT: {
          itemIds: ["q10"],
          responses: [{ itemId: "q10", correct: true, dontKnow: false }],
          theta: 0,
          se: 1,
          done: false,
        },
      },
    };
    const { byId, ausentes } = placementItemsById(p);
    expect(ausentes).toEqual([]);
    expect(byId.get("q10")?.skillId).toBe(itemMetaOf("q10").skillIds[0]);
  });

  test("id que nem a meta resolve vai para 'ausentes' e não quebra o resto", () => {
    const [real] = idsDiagnosticosReais("MT", 1);
    const p = {
      ...startPlacement("s", "now"),
      areas: {
        MT: {
          itemIds: [real, "id-que-nao-existe-mais"],
          responses: [
            { itemId: real, correct: true, dontKnow: false },
            { itemId: "id-que-nao-existe-mais", correct: false, dontKnow: false },
          ],
          theta: 0,
          se: 1,
          done: false,
        },
      },
    };
    let r!: ReturnType<typeof placementItemsById>;
    expect(() => {
      r = placementItemsById(p);
    }).not.toThrow();
    expect(r.ausentes).toEqual(["id-que-nao-existe-mais"]);
    expect(r.byId.has(real)).toBe(true);
  });

  test("CAT com itens REAIS: retomar com o mapa reconstituído = execução contínua (θ̂/SE idênticos, 1e-9)", () => {
    const ids = idsDiagnosticosReais("MT", 10);
    expect(ids.length).toBeGreaterThanOrEqual(8);
    const { byId: todos } = placementItemsById({
      ...startPlacement("s", "now"),
      areas: { MT: { itemIds: ids, responses: [], theta: null, se: null, done: false } },
    });
    const pool = ids.map((id) => todos.get(id)!);
    const scope: PlacementScope = { areas: ["MT"], priorityAreas: new Set(["MT"]) };
    const SEED = "seed-real-c3";

    function rodar(recarregarAntesDe: number | null, sequencia?: string[]) {
      let state = startPlacement(SEED, "2026-09-28T10:00:00.000Z");
      let mapa = new Map<string, PlacementPoolItem>();
      let ultima: string | null = null;
      const escolhidos: string[] = [];
      for (let i = 0; i < 6; i++) {
        if (recarregarAntesDe === i) mapa = placementItemsById(state).byId; // nova montagem da rota
        const escolha = pickPlacementItem(state, scope, () => pool, SEED, ultima);
        const item = sequencia ? pool.find((p) => p.id === sequencia[i]) : escolha.item;
        if (!item) break;
        mapa.set(item.id, item);
        escolhidos.push(item.id);
        state = advancePlacement(escolha.state, scope, item, i % 2 === 0, false, mapa);
        ultima = item.subjectId;
      }
      return { state, escolhidos };
    }

    const continuo = rodar(null);
    expect(continuo.escolhidos).toHaveLength(6);
    for (const ponto of [1, 3, 5]) {
      const retomado = rodar(ponto, continuo.escolhidos);
      expect(Math.abs(retomado.state.areas.MT!.theta! - continuo.state.areas.MT!.theta!)).toBeLessThan(1e-9);
      expect(Math.abs(retomado.state.areas.MT!.se! - continuo.state.areas.MT!.se!)).toBeLessThan(1e-9);
    }
  });
});

describe("computePlacementOutcome (docs/36 T-03.3, RF-10)", () => {
  test("2 áreas medidas: habilidades ativas delas viram prior-nivelamento (nEff 0); área NÃO medida fica sem mudança", () => {
    const mt = idsDiagnosticosReais("MT", 4);
    const cn = idsDiagnosticosReais("CN", 4);
    const p = placementComRespostas({
      MT: { ids: mt, certas: [true, true, true, false] },
      CN: { ids: cn, certas: [false, false, true, false] },
    });
    const antes: Record<string, SkillModelEntry> = {};
    const { skillModel, ausentes } = computePlacementOutcome(p, antes, "2026-09-28");
    expect(ausentes).toEqual([]);
    expect(antes).toEqual({}); // não muta a entrada

    const doArea = (area: string) => activeSkills().filter((s) => s.area === area);
    for (const area of ["MT", "CN"]) {
      expect(doArea(area).length).toBeGreaterThan(0);
      for (const sk of doArea(area)) {
        expect(skillModel[sk.id]?.source).toBe("prior-nivelamento");
        expect(skillModel[sk.id]?.nEff).toBe(0);
      }
    }
    // A área de CN foi pior que a de MT → o prior de uma habilidade de CN é menor que o de MT.
    expect(skillModel[doArea("CN")[0].id].theta).toBeLessThan(skillModel[doArea("MT")[0].id].theta);
    // Áreas não medidas: nenhuma entrada nova.
    for (const area of ["LC", "CH", "RED"]) {
      for (const sk of doArea(area)) expect(skillModel[sk.id]).toBeUndefined();
    }
  });

  test("com ausentes: aplica o que resolveu e devolve os ids não resolvidos", () => {
    const mt = idsDiagnosticosReais("MT", 3);
    const p = placementComRespostas({ MT: { ids: mt, certas: [true, true, false] } });
    p.areas.MT!.itemIds = [...p.areas.MT!.itemIds, "sumiu"];
    p.areas.MT!.responses = [...p.areas.MT!.responses, { itemId: "sumiu", correct: true, dontKnow: false }];
    const { skillModel, ausentes } = computePlacementOutcome(p, {}, "2026-09-28");
    expect(ausentes).toEqual(["sumiu"]);
    expect(Object.values(skillModel).some((e) => e.source === "prior-nivelamento")).toBe(true);
  });
});

describe("refazer o nivelamento preserva evidência e troca só priors (docs/36 T-03.4, RF-13)", () => {
  const scope: PlacementScope = { areas: ["MT"], priorityAreas: new Set() };
  const evidencia = (skillId: string): SkillModelEntry => ({
    skillId,
    theta: 0.5,
    sigma: 1.0,
    nEff: 1.2,
    difficultiesSeen: [2],
    recent: [1],
    independentShare: 1,
    lastEvidenceDate: "2026-09-24",
    lapses: 0,
    dontKnowRecent: 0,
    helpHeavyRecent: 0,
    source: "evidencia",
    algoVersion: 1,
    updatedAt: "2026-09-24",
  });

  test("skill medida no 1º (evidência) e NÃO medida no 2º: entrada intacta; prior do 1º p/ skill não medida no 2º é substituído pelo prior do 2º", () => {
    const i1 = item("r1", "mat:operacoes-fundamentais", "mat", 0);
    const i2 = item("r2", "mat:equacao-primeiro-grau", "mat", 0);
    const byId = new Map([i1, i2].map((i) => [i.id, i]));

    // 1º nivelamento: acerta o item da skill "operações" → θ alto; evidência real dessa skill.
    let p1 = advancePlacement(startPlacement("s1", "t1"), scope, i1, true, false, byId);
    p1 = { ...p1, status: "concluido", finishedAt: "t1" };
    const medida = evidencia("mat:operacoes-fundamentais");
    const modelo1 = applyPlacement(p1, { "mat:operacoes-fundamentais": medida }, byId, "2026-09-24");
    const prior1 = modelo1["mat:razao-proporcao"];
    expect(prior1.source).toBe("prior-nivelamento");

    // 2º nivelamento (refazer): só mede a skill "equação", errando → θ baixo.
    let p2 = advancePlacement(startPlacement("s2", "t2"), scope, i2, false, false, byId);
    p2 = { ...p2, status: "concluido", finishedAt: "t2" };
    const evidencia2 = evidencia("mat:equacao-primeiro-grau");
    const modelo2 = applyPlacement(p2, { ...modelo1, "mat:equacao-primeiro-grau": evidencia2 }, byId, "2026-09-28");

    expect(modelo2["mat:operacoes-fundamentais"]).toBe(medida); // evidência do 1º intacta
    expect(modelo2["mat:equacao-primeiro-grau"]).toBe(evidencia2); // evidência do 2º intacta
    const prior2 = modelo2["mat:razao-proporcao"];
    expect(prior2.source).toBe("prior-nivelamento");
    expect(prior2).not.toBe(prior1); // substituído
    expect(prior2.theta).toBeLessThan(prior1.theta); // pelo prior do 2º (pior)
    expect(prior2.updatedAt).toBe("2026-09-28");
  });
});

/**
 * Item retirado (docs/36 T-07.6, §G.6): fora do pool diagnóstico do nivelamento, mas
 * `resolveExercise` e a reconstituição (`placementItemsById`, que retoma uma execução em andamento)
 * continuam resolvendo — retirar um item nunca pode quebrar um nivelamento já iniciado.
 */
describe("item retirado no pool diagnóstico (docs/36 T-07.6)", () => {
  let limpar: () => void;
  const marcados: string[] = [];
  beforeAll(async () => {
    limpar = await carregarPacotesReais(["mat"]);
  });
  afterEach(() => {
    while (marcados.length) _setRetiredForTests(marcados.pop()!, false);
  });
  afterAll(() => limpar());

  test("o item sai de poolDiagnosticoDaArea, mas continua resolvendo por id e na reconstituição", () => {
    const antes = poolDiagnosticoDaArea("MT");
    expect(antes.length, "com o pacote de mat em memória a área MT tem pool").toBeGreaterThan(0);
    const alvo = antes[0].id;

    marcados.push(alvo);
    _setRetiredForTests(alvo, true);
    const depois = poolDiagnosticoDaArea("MT");
    expect(depois.map((i) => i.id)).not.toContain(alvo);
    expect(depois.length).toBe(antes.length - 1);

    expect(resolveExercise(alvo).type).toBe("multipla-escolha");
    const estado = placementComRespostas({ MT: { ids: [alvo], certas: [true] } }, "em-andamento");
    const { byId, ausentes } = placementItemsById(estado);
    expect(ausentes).toEqual([]);
    expect(byId.get(alvo)?.id).toBe(alvo);
  });
});
