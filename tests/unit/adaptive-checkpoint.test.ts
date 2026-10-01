import { describe, expect, test } from "bun:test";
import { deveInserirCheckpoint } from "@/lib/adaptive/checkpoint";
import { journeyVazia } from "@/lib/learning/types";

/**
 * Quando inserir checkpoint (docs/30 §13.1, Fase 8 — composição real é Fase 14).
 */

function learningBase(overrides: Partial<ReturnType<typeof journeyVazia>> = {}) {
  return {
    skillModel: {},
    skillEvidence: {},
    journey: { ...journeyVazia(), ...overrides },
  };
}

describe("deveInserirCheckpoint", () => {
  test("flag desligada → nunca (Fase 8 não liga checkpointsTrilha)", () => {
    const r = deveInserirCheckpoint(learningBase(), [], "2026-09-24", false);
    expect(r).toBe(false);
  });

  test("já concluiu um checkpoint hoje → não insere outro", () => {
    const r = deveInserirCheckpoint(
      learningBase({ lastCheckpointDate: "2026-09-24", sinceCheckpoint: 30 }),
      [],
      "2026-09-24",
      true,
    );
    expect(r).toBe(false);
  });

  test("poucas atividades desde o último (< 20) e sem sinal de dificuldade → não insere", () => {
    const janela = Array.from({ length: 5 }, (_, i) => ({ skillIds: [`mat:s${i}`], completedAt: "2026-09-24" }));
    const r = deveInserirCheckpoint(learningBase({ sinceCheckpoint: 5 }), janela, "2026-09-24", true);
    expect(r).toBe(false);
  });

  test(">= 25 desde o último → forçado, mesmo sem 3 habilidades distintas", () => {
    const r = deveInserirCheckpoint(learningBase({ sinceCheckpoint: 25 }), [], "2026-09-24", true);
    expect(r).toBe(true);
  });

  test(">= 20 desde o último, 3+ habilidades distintas, >= 6 atividades totais → insere", () => {
    const janela = [
      { skillIds: ["mat:a"], completedAt: "2026-09-24" },
      { skillIds: ["mat:b"], completedAt: "2026-09-24" },
      { skillIds: ["mat:c"], completedAt: "2026-09-24" },
    ];
    const r = deveInserirCheckpoint(
      learningBase({ sinceCheckpoint: 20, history: Array.from({ length: 10 }, () => ({} as never)) }),
      janela,
      "2026-09-24",
      true,
    );
    expect(r).toBe(true);
  });
});

describe("resultadoDaChecagem (spec 48 T-48.5.1, D48-13)", () => {
  test("Δ ≥ +5 → Subiu; |Δ| < 5 → Firme; Δ ≤ −5 → Vale revisar", async () => {
    const { resultadoDaChecagem } = await import("@/lib/adaptive/checkpoint");
    const r = resultadoDaChecagem(
      { a: 40, b: 50, c: 60 },
      { a: 47, b: 52, c: 54 },
      [
        { skillId: "a", predictedP: 0.6, correct: true },
        { skillId: "b", predictedP: 0.6, correct: true },
        { skillId: "c", predictedP: 0.6, correct: false },
      ],
    );
    expect(r.map((l) => [l.skillId, l.rotulo])).toEqual([["a", "subiu"], ["b", "firme"], ["c", "revisar"]]);
  });

  test("erro com previsão ≥ 0,8 é 'Vale revisar' com revisão amanhã, mesmo sem queda grande; acerto com previsão baixa libera desafio", async () => {
    const { resultadoDaChecagem } = await import("@/lib/adaptive/checkpoint");
    const r = resultadoDaChecagem(
      { x: 80, y: 30 },
      { x: 78, y: 40 },
      [
        { skillId: "x", predictedP: 0.85, correct: false },
        { skillId: "y", predictedP: 0.3, correct: true },
      ],
    );
    expect(r[0]).toEqual({ skillId: "x", rotulo: "revisar", revisaoAmanha: true, desafio: false });
    expect(r[1]).toEqual({ skillId: "y", rotulo: "subiu", revisaoAmanha: false, desafio: true });
  });

  test("só entram habilidades respondidas; sem retrato de antes, fica 'Firme' (nunca inventa 'Subiu')", async () => {
    const { resultadoDaChecagem } = await import("@/lib/adaptive/checkpoint");
    const r = resultadoDaChecagem(undefined, { a: 90, z: 10 }, [{ skillId: "a", predictedP: 0.5, correct: true }]);
    expect(r).toEqual([{ skillId: "a", rotulo: "firme", revisaoAmanha: false, desafio: false }]);
    expect(resultadoDaChecagem({}, {}, [])).toEqual([]);
  });
});
