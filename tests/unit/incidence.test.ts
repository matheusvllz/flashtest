import { describe, expect, test } from "bun:test";
import { computeIncidence, formatIncidenceReport } from "../../scripts/content/incidence";
import type { InepItemParams } from "../../scripts/content/import-inep-params";

/** Incidência sugerida por (área, habilidade) (docs/30 §12.4, Fase 10 F10.3) — só relatório, nunca altera a taxonomia. */

function item(overrides: Partial<InepItemParams> = {}): InepItemParams {
  return {
    ano: 2019,
    area: "MT",
    coItem: 1,
    coPosicao: 1,
    habilidade: 16,
    gabarito: "A",
    a: 1,
    b: 0,
    c: 0.2,
    adaptado: false,
    abandonado: false,
    ...overrides,
  };
}

describe("computeIncidence", () => {
  test("habilidade abandonada não conta", () => {
    const entradas = computeIncidence([
      item({ habilidade: 1, abandonado: true }),
      item({ habilidade: 1, coItem: 2, abandonado: true }),
    ]);
    expect(entradas).toEqual([]);
  });

  test("mais itens ao longo dos anos -> peso mais alto (tercil superior)", () => {
    const muitos = Array.from({ length: 9 }, (_, i) => item({ habilidade: 1, coItem: i }));
    const poucos = [item({ habilidade: 2, coItem: 100 })];
    const entradas = computeIncidence([...muitos, ...poucos]);
    const h1 = entradas.find((e) => e.habilidade === 1)!;
    const h2 = entradas.find((e) => e.habilidade === 2)!;
    expect(h1.contagem).toBe(9);
    expect(h2.contagem).toBe(1);
    expect(h1.peso).toBeGreaterThanOrEqual(h2.peso);
  });

  test("agrupa por área+habilidade separadamente (mesma H, áreas diferentes não se misturam)", () => {
    const entradas = computeIncidence([
      item({ area: "MT", habilidade: 5 }),
      item({ area: "CH", habilidade: 5, coItem: 2 }),
    ]);
    expect(entradas).toHaveLength(2);
    expect(new Set(entradas.map((e) => e.area))).toEqual(new Set(["MT", "CH"]));
  });

  test("lista vazia não lança", () => {
    expect(computeIncidence([])).toEqual([]);
  });
});

describe("formatIncidenceReport", () => {
  test("deixa claro que é sugestão, não aplicação automática", () => {
    const md = formatIncidenceReport(computeIncidence([item()]));
    expect(md).toContain("NÃO aplicada à taxonomia automaticamente");
    expect(md).toContain("H16");
  });
});
