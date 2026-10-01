import { beforeEach, describe, expect, test } from "bun:test";
import {
  clearTutorAutoSend,
  getState,
  openTutor,
  openTutorWithContext,
  reset,
  setTutorFocus,
} from "@/lib/store";
import type { PedagogicalContext } from "@/lib/tutor-context";
import type { TutorFocus } from "@/lib/tutor-prompt";

/**
 * Ações do balão do tutor no store — `pedagogy`/`autoSend` (docs/30 §17,
 * Fase 7 do docs/31, F7.6) e o evento de observabilidade que
 * `openTutorWithContext` grava quando abre COM contexto pedagógico.
 */
beforeEach(() => reset());

function focus(overrides: Partial<TutorFocus> = {}): TutorFocus {
  return {
    questionId: "q1",
    subjectName: "Matemática",
    topic: "Porcentagem",
    statement: "Quanto é 20% de 300?",
    alternatives: [{ key: "A", text: "60" }],
    correct: "A",
    chosen: null,
    answered: false,
    wasCorrect: false,
    explanation: "20% de 300 = 60.",
    hint: "Multiplique por 0,2.",
    ...overrides,
  };
}

function pedagogy(overrides: Partial<PedagogicalContext> = {}): PedagogicalContext {
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

describe("openTutorWithContext — pedagogy/autoSend (docs/30 §17.2)", () => {
  test("sem opts, abre com pedagogy e autoSend nulos", () => {
    openTutorWithContext(focus());
    const s = getState();
    expect(s.tutor.open).toBe(true);
    expect(s.tutor.pedagogy).toBeNull();
    expect(s.tutor.autoSend).toBeNull();
  });

  test("com opts, grava pedagogy e a mensagem de auto-envio", () => {
    openTutorWithContext(focus(), { pedagogy: pedagogy(), autoSend: "Me ensina isso do começo." });
    const s = getState();
    expect(s.tutor.pedagogy?.skillId).toBe("mat:porcentagem-valor");
    expect(s.tutor.autoSend).toBe("Me ensina isso do começo.");
  });

  test("grava evento ai-help-opened só quando abre COM pedagogy", () => {
    openTutorWithContext(focus());
    expect(getState().learning.events).toHaveLength(0);

    openTutorWithContext(focus(), { pedagogy: pedagogy({ mode: "ensinar-do-zero" }) });
    const eventos = getState().learning.events;
    expect(eventos).toHaveLength(1);
    expect(eventos[0].type).toBe("ai-help-opened");
    expect(eventos[0].skillId).toBe("mat:porcentagem-valor");
    expect(eventos[0].meta?.mode).toBe("ensinar-do-zero");
  });

  test("abrir o balão genérico (openTutor) não grava evento nenhum", () => {
    openTutor();
    expect(getState().learning.events).toHaveLength(0);
  });
});

describe("clearTutorAutoSend", () => {
  test("zera só autoSend, preserva pedagogy/focus", () => {
    openTutorWithContext(focus(), { pedagogy: pedagogy(), autoSend: "oi" });
    clearTutorAutoSend();
    const s = getState();
    expect(s.tutor.autoSend).toBeNull();
    expect(s.tutor.pedagogy).not.toBeNull();
    expect(s.tutor.focus).not.toBeNull();
  });
});

describe("setTutorFocus — zera pedagogy pra não vazar contexto de outra questão", () => {
  test("trocar de foco sem pedagogy novo limpa o pedagogy anterior", () => {
    openTutorWithContext(focus(), { pedagogy: pedagogy() });
    expect(getState().tutor.pedagogy).not.toBeNull();

    setTutorFocus(focus({ questionId: "q2" }));
    expect(getState().tutor.pedagogy).toBeNull();
    expect(getState().tutor.focus?.questionId).toBe("q2");
  });
});

describe("histórico guardado no aparelho (spec 48 D48-09, B-102)", () => {
  test("passado o limite, só as 40 mensagens mais recentes ficam", async () => {
    const { pushTutorMessage, TUTOR_MENSAGENS_GUARDADAS_NO_APARELHO } = await import("@/lib/store");
    for (let i = 0; i < 300; i++) pushTutorMessage({ role: i % 2 ? "assistant" : "user", content: `m${i}` });
    const msgs = getState().tutor.messages;
    expect(msgs).toHaveLength(TUTOR_MENSAGENS_GUARDADAS_NO_APARELHO);
    expect(msgs[msgs.length - 1].content).toBe("m299");
  });

  test("histórico antigo enorme ou malformado no localStorage é aparado na leitura", async () => {
    const { normalizarMensagensDoTutor } = await import("@/lib/store");
    const bruto = [...Array.from({ length: 300 }, (_, i) => ({ role: "user", content: `m${i}` })), { role: "system", content: "x" }, null, 7];
    const lidas = normalizarMensagensDoTutor(bruto);
    expect(lidas).toHaveLength(40);
    expect(lidas.every((m) => m.role === "user")).toBe(true);
    expect(normalizarMensagensDoTutor("lixo")).toEqual([]);
  });
});
