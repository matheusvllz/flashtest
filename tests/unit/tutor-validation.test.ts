import { describe, expect, test } from "bun:test";
import {
  TutorRequestInvalido,
  TUTOR_IMAGEM_MAX_BYTES,
  TUTOR_MAX_MENSAGENS,
  validateTutorRequest,
} from "@/lib/tutor-core";

/**
 * Fase 7, item 8 (docs/20 §14.2): "Validar payload do tutor, tamanho/tipo de
 * imagem". O `.inputValidator` da server function era um cast antes desta
 * fase — este é o teste de que ele agora recusa payload perigoso/quebrado.
 */
function contextoValido() {
  return { firstName: "Ana", targetInstitution: "", targetCourse: "", level: "", gaps: [], performance: [], focus: null };
}

describe("validateTutorRequest", () => {
  test("payload mínimo válido passa", () => {
    const req = validateTutorRequest({
      messages: [{ role: "user", content: "oi" }],
      context: contextoValido(),
    });
    expect(req.messages).toHaveLength(1);
  });

  test("rejeita payload que não é objeto", () => {
    expect(() => validateTutorRequest("string qualquer")).toThrow(TutorRequestInvalido);
    expect(() => validateTutorRequest(null)).toThrow(TutorRequestInvalido);
  });

  test("rejeita mensagens vazias/ausentes", () => {
    expect(() => validateTutorRequest({ messages: [], context: contextoValido() })).toThrow(
      TutorRequestInvalido,
    );
    expect(() => validateTutorRequest({ context: contextoValido() })).toThrow(TutorRequestInvalido);
  });

  test("rejeita conversa maior que o limite", () => {
    const messages = Array.from({ length: TUTOR_MAX_MENSAGENS + 1 }, () => ({
      role: "user" as const,
      content: "x",
    }));
    expect(() => validateTutorRequest({ messages, context: contextoValido() })).toThrow(
      TutorRequestInvalido,
    );
  });

  test("rejeita mensagem com role inválido ou conteúdo vazio", () => {
    expect(() =>
      validateTutorRequest({ messages: [{ role: "system", content: "x" }], context: contextoValido() }),
    ).toThrow(TutorRequestInvalido);
    expect(() =>
      validateTutorRequest({ messages: [{ role: "user", content: "" }], context: contextoValido() }),
    ).toThrow(TutorRequestInvalido);
  });

  test("rejeita imagem com tipo não suportado", () => {
    expect(() =>
      validateTutorRequest({
        messages: [{ role: "user", content: "olha isso" }],
        context: contextoValido(),
        image: { mediaType: "image/gif", data: "QQ==" },
      }),
    ).toThrow(TutorRequestInvalido);
  });

  test("rejeita imagem maior que 5 MiB", () => {
    // base64 de ~6 MiB: cada 4 chars decodificam ~3 bytes.
    const bytesAlvo = TUTOR_IMAGEM_MAX_BYTES + 1024;
    const base64Grande = "A".repeat(Math.ceil(bytesAlvo / 3) * 4);
    expect(() =>
      validateTutorRequest({
        messages: [{ role: "user", content: "olha isso" }],
        context: contextoValido(),
        image: { mediaType: "image/png", data: base64Grande },
      }),
    ).toThrow(TutorRequestInvalido);
  });

  test("aceita imagem dentro do limite e tipo permitido", () => {
    const req = validateTutorRequest({
      messages: [{ role: "user", content: "olha isso" }],
      context: contextoValido(),
      image: { mediaType: "image/webp", data: "QUJD" },
    });
    expect(req.image?.mediaType).toBe("image/webp");
  });

  test("rejeita contexto ausente", () => {
    expect(() => validateTutorRequest({ messages: [{ role: "user", content: "x" }] })).toThrow(
      TutorRequestInvalido,
    );
  });
});

/** Fase 7 F7.5 (docs/30 §17.3): `pedagogy` é payload de cliente como qualquer outro — validar de verdade, não confiar no cast TS. */
describe("validateTutorRequest — pedagogy", () => {
  function pedagogiaValida() {
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
    };
  }

  test("ausente (undefined ou null) passa — nem toda tela manda pedagogy", () => {
    expect(() =>
      validateTutorRequest({ messages: [{ role: "user", content: "x" }], context: contextoValido() }),
    ).not.toThrow();
    expect(() =>
      validateTutorRequest({
        messages: [{ role: "user", content: "x" }],
        context: { ...contextoValido(), pedagogy: null },
      }),
    ).not.toThrow();
  });

  test("pedagogy válido passa", () => {
    expect(() =>
      validateTutorRequest({
        messages: [{ role: "user", content: "x" }],
        context: { ...contextoValido(), pedagogy: pedagogiaValida() },
      }),
    ).not.toThrow();
  });

  test("rejeita confidenceLabel fora do vocabulário fechado", () => {
    expect(() =>
      validateTutorRequest({
        messages: [{ role: "user", content: "x" }],
        context: { ...contextoValido(), pedagogy: { ...pedagogiaValida(), confidenceLabel: "<script>" } },
      }),
    ).toThrow(TutorRequestInvalido);
  });

  test("rejeita mastery fora de 0–100", () => {
    expect(() =>
      validateTutorRequest({
        messages: [{ role: "user", content: "x" }],
        context: { ...contextoValido(), pedagogy: { ...pedagogiaValida(), mastery: 150 } },
      }),
    ).toThrow(TutorRequestInvalido);
  });

  test("rejeita mode fora do vocabulário fechado", () => {
    expect(() =>
      validateTutorRequest({
        messages: [{ role: "user", content: "x" }],
        context: { ...contextoValido(), pedagogy: { ...pedagogiaValida(), mode: "hackear-sistema" } },
      }),
    ).toThrow(TutorRequestInvalido);
  });

  test("rejeita recentErrors maior que o teto", () => {
    const muitos = Array.from({ length: 20 }, () => ({ statement: "x", chosen: "A", correct: "B" }));
    expect(() =>
      validateTutorRequest({
        messages: [{ role: "user", content: "x" }],
        context: { ...contextoValido(), pedagogy: { ...pedagogiaValida(), recentErrors: muitos } },
      }),
    ).toThrow(TutorRequestInvalido);
  });

  test("rejeita string longa demais em qualquer campo de texto", () => {
    expect(() =>
      validateTutorRequest({
        messages: [{ role: "user", content: "x" }],
        context: { ...contextoValido(), pedagogy: { ...pedagogiaValida(), skillName: "x".repeat(5000) } },
      }),
    ).toThrow(TutorRequestInvalido);
  });

  test("rejeita pedagogy cujo total serializado passa de 2000 caracteres, mesmo com cada campo dentro do próprio teto", () => {
    const grande = {
      ...pedagogiaValida(),
      recentErrors: Array.from({ length: 5 }, () => ({
        statement: "x".repeat(490),
        chosen: "y".repeat(490),
        correct: "z".repeat(490),
      })),
    };
    expect(() =>
      validateTutorRequest({
        messages: [{ role: "user", content: "x" }],
        context: { ...contextoValido(), pedagogy: grande },
      }),
    ).toThrow(TutorRequestInvalido);
  });

  test("rejeita weakPrerequisites que não é array de string", () => {
    expect(() =>
      validateTutorRequest({
        messages: [{ role: "user", content: "x" }],
        context: { ...contextoValido(), pedagogy: { ...pedagogiaValida(), weakPrerequisites: [123] } },
      }),
    ).toThrow(TutorRequestInvalido);
  });
});
