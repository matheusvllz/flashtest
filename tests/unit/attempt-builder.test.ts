import { describe, expect, test } from "bun:test";
import { buildAttempt } from "@/lib/learning/attempt-builder";

/** Fase 6 (docs/30 §7.3/§21.1) — construtor único de `Attempt` pras 3 superfícies. */

function base(overrides: Partial<Parameters<typeof buildAttempt>[0]> = {}) {
  return buildAttempt({
    id: "at-1",
    sessionId: "ls-1",
    exerciseId: "q1",
    exerciseVersion: 1,
    skillIds: ["mat:x"],
    role: "pratica",
    answer: 1,
    correct: true,
    firstSubmission: true,
    startedAtMs: 1_000,
    nowMs: 4_000,
    localDate: "2026-09-24",
    source: "estudo",
    ...overrides,
  });
}

describe("buildAttempt", () => {
  test("calcula durationMs a partir de startedAtMs/nowMs", () => {
    expect(base().durationMs).toBe(3000);
  });

  test("nunca deixa duração negativa (relógio estranho)", () => {
    expect(base({ startedAtMs: 9000, nowMs: 4000 }).durationMs).toBe(0);
  });

  test("satura em 10 minutos (aluno saiu e voltou)", () => {
    expect(base({ startedAtMs: 0, nowMs: 999_999_999 }).durationMs).toBe(600_000);
  });

  test("response ausente vira 'answered'", () => {
    expect(base().response).toBe("answered");
  });

  test("response 'dont-know' força correct: false mesmo se correct: true foi passado", () => {
    const a = base({ response: "dont-know", correct: true });
    expect(a.correct).toBe(false);
    expect(a.response).toBe("dont-know");
  });

  test("assisted é true se hintUsed OU tutorUsed", () => {
    expect(base({ hintUsed: true }).assisted).toBe(true);
    expect(base({ tutorUsed: true }).assisted).toBe(true);
    expect(base().assisted).toBe(false);
  });

  test("helpLevel sempre começa em 0", () => {
    expect(base().helpLevel).toBe(0);
  });

  test("propaga skillIds, role, itemDifficulty, source, presentedOrder", () => {
    const a = base({
      skillIds: ["mat:a", "mat:b"],
      role: "revisao",
      itemDifficulty: 3,
      source: "legado",
      presentedOrder: ["x", "y"],
    });
    expect(a.skillIds).toEqual(["mat:a", "mat:b"]);
    expect(a.role).toBe("revisao");
    expect(a.itemDifficulty).toBe(3);
    expect(a.source).toBe("legado");
    expect(a.presentedOrder).toEqual(["x", "y"]);
  });
});
