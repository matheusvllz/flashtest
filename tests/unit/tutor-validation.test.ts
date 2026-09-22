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
