import { describe, expect, test } from "bun:test";
import { buildSystemPrompt, localFallback, type TutorContext, type TutorFocus } from "@/lib/tutor-prompt";
import type { PedagogicalContext } from "@/lib/tutor-context";

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

function basePedagogy(overrides: Partial<PedagogicalContext> = {}): PedagogicalContext {
  return {
    skillId: "mat:porcentagem-valor",
    skillName: "Calcular porcentagem de um valor",
    subjectName: "Matemática",
    topicName: "Porcentagem",
    mastery: 42,
    confidenceLabel: "evidência razoável",
    recentErrors: [],
    dontKnowRecent: 0,
    explanationSeen: "nenhuma",
    weakPrerequisites: [],
    examName: null,
    mode: "duvida",
    ...overrides,
  };
}

describe("buildSystemPrompt — contexto pedagógico (docs/30 §17, Fase 7)", () => {
  test("sem pedagogy, não menciona motor adaptativo", () => {
    const prompt = buildSystemPrompt(baseContext(null));
    expect(prompt).not.toContain("MOTOR ADAPTATIVO");
  });

  test("com pedagogy, cita habilidade, domínio e confiança", () => {
    const ctx = { ...baseContext(null), pedagogy: basePedagogy() };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain("Calcular porcentagem de um valor");
    expect(prompt).toContain("42/100");
    expect(prompt).toContain("evidência razoável");
  });

  test("mastery null vira 'ainda não medido', nunca um número inventado", () => {
    const ctx = { ...baseContext(null), pedagogy: basePedagogy({ mastery: null, confidenceLabel: "ainda medindo" }) };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain("ainda não medido");
    expect(prompt).not.toContain("null/100");
  });

  test("erros recentes da mesma habilidade aparecem no prompt", () => {
    const ctx = {
      ...baseContext(null),
      pedagogy: basePedagogy({
        recentErrors: [{ statement: "Quanto é 20% de 300?", chosen: "40", correct: "60" }],
      }),
    };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain("Quanto é 20% de 300?");
    expect(prompt).toContain("marcou 40");
  });

  test("pré-requisitos fracos aparecem quando existem", () => {
    const ctx = { ...baseContext(null), pedagogy: basePedagogy({ weakPrerequisites: ["Calcular razão entre dois valores"] }) };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain("Calcular razão entre dois valores");
  });

  test("mode 'ensinar-do-zero' troca a instrução de AÇÃO — ensina do zero em vez de guiar com pista", () => {
    const ctx = { ...baseContext(null), pedagogy: basePedagogy({ mode: "ensinar-do-zero" }) };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain("ENSINAR DO COMEÇO");
    expect(prompt).not.toContain("nunca entregue a resposta de graça");
  });

  test("mode 'duvida' mantém a instrução padrão de guiar com pista", () => {
    const ctx = { ...baseContext(null), pedagogy: basePedagogy({ mode: "duvida" }) };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain("nunca entregue a resposta de graça");
  });

  test("explicação já vista pede pra não repetir do zero", () => {
    const ctx = { ...baseContext(null), pedagogy: basePedagogy({ explanationSeen: "detalhada" }) };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain("JÁ VIU uma explicação detalhada");
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
