import { describe, expect, test } from "bun:test";
import {
  advancePlacement,
  startPlacement,
  type PlacementPoolItem,
  type PlacementScope,
} from "@/lib/adaptive/placement";
import {
  applyPlacement,
  areaTemPoolSuficiente,
  poolDiagnosticoDaArea,
} from "@/lib/adaptive/placement-pool";
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
