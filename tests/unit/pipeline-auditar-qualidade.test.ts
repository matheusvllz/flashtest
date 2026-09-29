import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  amostraPorMateria,
  auditar,
  classificarEstrato,
  EXEMPLOS_35,
  percentil,
  serializarAuditoria,
} from "../../scripts/content/auditar-qualidade";
import { metricasForma } from "../../scripts/content/qualidade-forma";

/**
 * Auditoria de qualidade (docs/36 T-07.1, §G.6): atribuição de estratos, amostras determinísticas
 * e uma rodada de ponta a ponta sobre um banco de fixture (diretório temporário — nunca o real).
 */

const ALTAS = ["a", "b", "c", "d"].map((x) => x.repeat(10));

describe("classificarEstrato", () => {
  test("razão ≥ 2,0 → 1a", () => {
    const m = metricasForma(["a".repeat(50), "bbbbbbbbbbbbbbbbbbbbbbbbb", "ccccc", "dddddd"], 0);
    expect(classificarEstrato({ id: "x", diagnostico: false, metricas: m }).principal).toBe("1a");
  });

  test("correta estritamente a mais longa + distrator com absolutismo → 1b (sem 1a)", () => {
    const m = metricasForma(["resposta mais longa", "nunca acontece", "curta", "outra curta"], 0);
    const r = classificarEstrato({ id: "x", diagnostico: false, metricas: m });
    expect(r.marcas).toContain("1b");
    expect(r.marcas).not.toContain("1a");
  });

  test("travessão → 1c; exemplos do docs/35 → 1d; diagnóstico → 1e e vira o principal", () => {
    const comTravessao = metricasForma(["igual", "com — travessão", "outra", "mais uma"], 0);
    expect(classificarEstrato({ id: "x", diagnostico: false, metricas: comTravessao }).principal).toBe("1c");
    const neutra = metricasForma(ALTAS, 0);
    expect(classificarEstrato({ id: EXEMPLOS_35[0], diagnostico: false, metricas: neutra }).marcas).toContain("1d");
    const r = classificarEstrato({ id: "x", diagnostico: true, metricas: comTravessao });
    expect(r.marcas).toEqual(["1e", "1c"]);
    expect(r.principal).toBe("1e");
  });

  test("correta a mais longa com razão 1,5–2,0 fora do estrato 1 → 2; o restante → 3", () => {
    const medio = metricasForma(["a".repeat(18), "b".repeat(10), "c".repeat(10), "d".repeat(10)], 0);
    expect(classificarEstrato({ id: "x", diagnostico: false, metricas: medio }).principal).toBe("2");
    expect(classificarEstrato({ id: "x", diagnostico: false, metricas: metricasForma(ALTAS, 0) }).principal).toBe("3");
    // Item que não é MC (sem métricas) e não é diagnóstico cai no baixo risco.
    expect(classificarEstrato({ id: "x", diagnostico: false, metricas: null }).principal).toBe("3");
  });
});

describe("amostraPorMateria / percentil", () => {
  const itens = Array.from({ length: 40 }, (_, i) => ({ id: `mat-${i}`, subjectId: "mat" })).concat(
    Array.from({ length: 4 }, (_, i) => ({ id: `fil-${i}`, subjectId: "fil" })),
  );

  test("taxa por matéria com mínimo, sem passar do total, independente da ordem", () => {
    const a = amostraPorMateria(itens, 0.3, 5);
    expect(a.filter((id) => id.startsWith("mat-"))).toHaveLength(12); // ceil(0,3 · 40)
    expect(a.filter((id) => id.startsWith("fil-"))).toHaveLength(4); // mínimo 5, limitado a 4
    expect(amostraPorMateria([...itens].reverse(), 0.3, 5)).toEqual(a);
  });

  test("percentil interpola", () => {
    expect(percentil([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(percentil([], 0.9)).toBeNull();
  });
});

describe("auditar (ponta a ponta, banco de fixture)", () => {
  function item(id: string, opcoes: string[], roles: string[]) {
    return {
      id,
      exercise: { type: "multipla-escolha", pergunta: "p", opcoes, correta: 0, explicacao: "e" },
      meta: {
        id,
        version: 1,
        skillIds: ["mat:operacoes-fundamentais"],
        difficulty: 2,
        irt: { a: 1, b: 0, c: 0.25, source: "estimado" },
        roles,
        estimatedSeconds: 60,
        dontKnowAllowed: true,
        source: { kind: "ia-validada" },
        validation: { status: "revisada-humano", reviewKind: "ia-delegada" },
        examProfiles: ["enem"],
      },
    };
  }

  test("conta, estratifica, ignora retirados e é determinística", async () => {
    const dir = mkdtempSync(join(tmpdir(), "foca-auditoria-"));
    try {
      mkdirSync(join(dir, "mat"), { recursive: true });
      writeFileSync(
        join(dir, "mat", "x.json"),
        JSON.stringify({
          subjectId: "mat",
          items: [
            item("t:longa", ["a".repeat(60), "b".repeat(10), "c".repeat(10), "d".repeat(10)], ["pratica"]),
            item("t:diag", ["1", "2", "3", "4"], ["pratica", "diagnostico"]),
            { ...item("t:retirado", ["a".repeat(60), "b", "c", "d"], ["pratica"]), retired: true },
          ],
          lessons: [],
        }),
      );
      const r1 = await auditar({ bancoDir: dir });
      const r2 = await auditar({ bancoDir: dir });
      expect(serializarAuditoria(r1.auditoria)).toBe(serializarAuditoria(r2.auditoria));

      const contagens = r1.auditoria.contagens as { itensTotal: number; retirados: number; porReviewKind: Record<string, number> };
      expect(contagens.itensTotal).toBe(3);
      expect(contagens.retirados).toBe(1);
      expect(contagens.porReviewKind["ia-delegada"]).toBe(3);

      const estratos = r1.estratos as { principal: Record<string, string[]> };
      expect(estratos.principal["1a"]).toEqual(["t:longa"]);
      expect(estratos.principal["1e"]).toEqual(["t:diag"]);
      // O retirado não entra em estrato nenhum.
      expect(Object.values(estratos.principal).flat()).not.toContain("t:retirado");
      expect(r1.markdown).toContain("Estrato 1 (união de 1a–1e)");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
