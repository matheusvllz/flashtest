import { describe, expect, test } from "bun:test";
import { calibrarB } from "@/content/items/irt";
import type { ItemIrt } from "@/content/items/types";

/**
 * Calibração de `b` pela distribuição real do Inep (docs/30 §12.4, Fase 10
 * do docs/31 F10.4) — AC-10.4: a ordem editorial precisa se manter depois
 * de calibrar (dificuldade maior sempre vira `b` calibrado maior).
 */

const ESTIMADO: ItemIrt = { a: 1, b: 0, c: 0.2, source: "estimado" };
const TABELA = { "MT:H16": { mediana: 0.3, iqr: 1.2 } };

describe("calibrarB", () => {
  test("sem enemSkills, devolve o irt intacto", () => {
    expect(calibrarB(ESTIMADO, 3, undefined, TABELA)).toBe(ESTIMADO);
    expect(calibrarB(ESTIMADO, 3, [], TABELA)).toBe(ESTIMADO);
  });

  test("enemSkills sem entrada na tabela, devolve intacto", () => {
    expect(calibrarB(ESTIMADO, 3, ["MT:H99"], TABELA)).toBe(ESTIMADO);
  });

  test("item já não-estimado (oficial/calibrado antes) nunca é recalibrado", () => {
    const oficial: ItemIrt = { a: 1, b: 0, c: 0.2, source: "inep" };
    expect(calibrarB(oficial, 3, ["MT:H16"], TABELA)).toBe(oficial);
  });

  test("com tabela, ajusta b e marca calibratedFrom", () => {
    const r = calibrarB(ESTIMADO, 3, ["MT:H16"], TABELA);
    expect(r.calibratedFrom).toBe("inep-distribuicao");
    expect(r.b).not.toBe(ESTIMADO.b);
    expect(r.a).toBe(ESTIMADO.a); // só `b` muda
    expect(r.source).toBe("estimado"); // continua "estimado" — a fonte do palpite não virou TRI oficial
  });

  test("AC-10.4: ordem editorial preservada — b calibrado cresce estritamente com a dificuldade, pra QUALQUER mediana/iqr", () => {
    const tabelas = [
      { "MT:H16": { mediana: 0.3, iqr: 1.2 } },
      { "MT:H16": { mediana: -1.5, iqr: 0.4 } },
      { "MT:H16": { mediana: 2.0, iqr: 2.5 } },
    ];
    for (const tabela of tabelas) {
      const bs = ([1, 2, 3, 4, 5] as const).map(
        (d) => calibrarB(ESTIMADO, d, ["MT:H16"], tabela).b,
      );
      for (let i = 1; i < bs.length; i++) expect(bs[i]).toBeGreaterThan(bs[i - 1]);
    }
  });

  test("usa só o PRIMEIRO enemSkills quando o item mapeia mais de um", () => {
    const r = calibrarB(ESTIMADO, 3, ["MT:H16", "MT:H99"], TABELA);
    expect(r.calibratedFrom).toBe("inep-distribuicao");
  });
});
