import { describe, expect, test } from "bun:test";
import { buildSystemPrompt, localFallback, type TutorContext, type TutorFocus } from "@/lib/tutor-prompt";

function baseFocus(overrides: Partial<TutorFocus>): TutorFocus {
  return {
    questionId: "q1",
    subjectName: "Matemática",
    topic: "Frações",
    statement: "Quanto é 1/2 + 1/4?",
    alternatives: [
      { key: "A", text: "3/4" },
      { key: "B", text: "1/4" },
    ],
    correct: "A",
    chosen: null,
    answered: false,
    wasCorrect: false,
    explanation: "1/2 = 2/4; 2/4 + 1/4 = 3/4.",
    hint: "Reduza ao mesmo denominador.",
    ...overrides,
  };
}

function baseContext(focus: TutorFocus | null): TutorContext {
  return {
    firstName: "Ana",
    targetInstitution: "",
    targetCourse: "",
    level: "",
    gaps: [],
    performance: [],
    focus,
  };
}

describe("buildSystemPrompt — contexto do tutor usa answered/wasCorrect", () => {
  test("não respondido: não afirma acerto/erro, pede pra não entregar o gabarito", () => {
    const prompt = buildSystemPrompt(baseContext(baseFocus({ answered: false })));
    expect(prompt).toContain("AINDA NÃO RESPONDEU");
    expect(prompt).not.toContain("JÁ RESPONDEU");
  });

  test("respondido e correto (com chosen=null, caso composto): não diz 'não respondeu'", () => {
    // Caso que o B2 corrigiu: chosen pode ser null mesmo respondido (resposta
    // composta sem shownBlocks); answered/wasCorrect são a fonte da verdade.
    const prompt = buildSystemPrompt(
      baseContext(baseFocus({ answered: true, wasCorrect: true, chosen: null })),
    );
    expect(prompt).toContain("JÁ RESPONDEU e ACERTOU");
    expect(prompt).not.toContain("AINDA NÃO RESPONDEU");
  });

  test("respondido e errado: menciona o que foi marcado e pede pra explicar o desvio", () => {
    const prompt = buildSystemPrompt(
      baseContext(baseFocus({ answered: true, wasCorrect: false, chosen: "B" })),
    );
    expect(prompt).toContain("JÁ RESPONDEU e ERROU");
    expect(prompt).toContain("marcou B");
  });
});

describe("localFallback — usa answered/wasCorrect, não a truthiness de chosen", () => {
  test("errou com resposta composta (chosen preenchido) cita o gabarito", () => {
    const focus = baseFocus({ answered: true, wasCorrect: false, chosen: "O → dorme → gato" });
    const reply = localFallback("me explica", focus);
    expect(reply).toContain("O → dorme → gato");
    expect(reply).toContain(focus.correct);
  });

  test("sem foco nenhum, não quebra", () => {
    const reply = localFallback("quais são minhas lacunas?", null);
    expect(typeof reply).toBe("string");
    expect(reply.length).toBeGreaterThan(0);
  });
});
