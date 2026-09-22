import { describe, expect, test } from "bun:test";
import { buildSystemPrompt, type TutorContext } from "@/lib/tutor-prompt";
import { VOZ } from "@/lib/voz";

/**
 * Fase 3 (docs/20 §7, precedência): sarcasmo/cobrança que constrange por erro
 * ou ausência saiu da voz do produto — companhia direta e respeitosa entrou
 * no lugar. Regressão pra não deixar a cobrança voltar silenciosamente.
 */
describe("persona do tutor — sem sarcasmo/cobrança (docs/20 §7)", () => {
  const ctx: TutorContext = {
    firstName: "Ana",
    targetInstitution: "",
    targetCourse: "",
    level: "",
    gaps: [],
    performance: [],
    focus: null,
  };

  test("prompt não descreve a Foca como sarcástica nem cobradora de disciplina", () => {
    const prompt = buildSystemPrompt(ctx).toLowerCase();
    expect(prompt).not.toContain("sarcástic");
    expect(prompt).not.toContain("cobra disciplina");
  });

  test("prompt não autoriza cobrança por ausência", () => {
    const prompt = buildSystemPrompt(ctx).toLowerCase();
    expect(prompt).not.toContain("implica com ausência");
  });
});

describe("voz.ts — slot 'errou' sem cobrança sobre resultado", () => {
  test("nenhuma fala de erro ameaça cobrança futura", () => {
    for (const fala of VOZ.errou) {
      expect(fala.toLowerCase()).not.toContain("cobrar");
    }
  });
});
