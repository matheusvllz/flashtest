import { describe, expect, test } from "bun:test";
import { buildSystemPrompt, type TutorContext } from "@/lib/tutor-prompt";
import { COPY } from "@/lib/copy";
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

describe("voz.ts — slot 'naosei' (docs/30 §16.1, Fase 6)", () => {
  test("nenhuma fala cobra nem julga o aluno por não saber", () => {
    for (const fala of VOZ.naosei) {
      const minuscula = fala.toLowerCase();
      expect(minuscula).not.toContain("cobrar");
      expect(minuscula).not.toContain("errou");
      expect(minuscula).not.toContain("errado");
    }
  });
});

describe("COPY.jornada.motivos — sem 'domina', sem cobrança (docs/30 §14.2, Fase 12)", () => {
  test("nenhum motivo de card usa 'domina' nem cobra o aluno", () => {
    for (const texto of Object.values(COPY.jornada.motivos)) {
      const minuscula = texto.toLowerCase();
      expect(minuscula).not.toContain("domina");
      expect(minuscula).not.toContain("cobrar");
      expect(minuscula).not.toContain("você precisa");
      expect(minuscula).not.toContain("você deveria");
    }
  });

  test("humor no máximo implícito — nenhum motivo usa exclamação dupla (docs/20 §7.1)", () => {
    for (const texto of Object.values(COPY.jornada.motivos)) {
      expect(texto).not.toContain("!!");
    }
  });
});

describe("COPY.onboarding / COPY.nivelamento — sem nota, sem 'nível N', sem cobrança (docs/30 §12.2/§12.5, Fase 13)", () => {
  function textosDe(bloco: Record<string, unknown>): string[] {
    return Object.values(bloco).filter((v): v is string => typeof v === "string");
  }

  test("nenhum texto manda o aluno fazer algo ('você precisa/deveria' + verbo) nem usa exclamação dupla", () => {
    // Checa o padrão de COBRANÇA ("você precisa estudar"), não a palavra
    // "precisa" sozinha — "mais perto do que você precisa" (oferta de
    // nivelamento, `30` §12.2, copy já aprovada) usa "precisar" no sentido
    // comum, não manda o aluno fazer nada.
    const cobranca = /voc[eê] (precisa|deveria) (estudar|fazer|responder|treinar|praticar|acertar)/i;
    for (const texto of [...textosDe(COPY.onboarding), ...textosDe(COPY.nivelamento)]) {
      expect(cobranca.test(texto)).toBe(false);
      expect(texto).not.toContain("!!");
    }
  });

  test("resultado do nivelamento não menciona nota nem 'nível N' (docs/30 §12.5)", () => {
    for (const texto of textosDe(COPY.nivelamento)) {
      expect(texto.toLowerCase()).not.toContain("nota");
      expect(/nível \d/i.test(texto)).toBe(false);
    }
  });
});
