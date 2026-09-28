import { describe, expect, test } from "bun:test";
import { hasExplanationLayers } from "@/components/learning/ExplanationLayers";

/**
 * Nível 2 da explicação em camadas (docs/30 §17.1, Fase 7 F7.1/F7.2). Só a
 * lógica pura (`hasExplanationLayers`) — o componente em si é apresentacional
 * e não tem teste de render neste repo (cobertura de UI é via Playwright).
 */
describe("hasExplanationLayers", () => {
  test("undefined não tem nível 2", () => {
    expect(hasExplanationLayers(undefined)).toBe(false);
  });

  test("objeto vazio (sem detalhada nem passos) não conta", () => {
    expect(hasExplanationLayers({})).toBe(false);
  });

  test("passos vazio ([]) não conta", () => {
    expect(hasExplanationLayers({ passos: [] })).toBe(false);
  });

  test("só detalhada conta", () => {
    expect(hasExplanationLayers({ detalhada: "Explicação longa." })).toBe(true);
  });

  test("só passos (não vazio) conta", () => {
    expect(hasExplanationLayers({ passos: ["Passo 1"] })).toBe(true);
  });
});
