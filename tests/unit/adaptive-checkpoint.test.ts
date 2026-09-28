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
