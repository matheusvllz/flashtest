import { createServerFn } from "@tanstack/react-start";
import { generateTutorReply, validateTutorRequest } from "@/lib/tutor-core";

/**
 * Transporte do balão do tutor: só a server function do TanStack Start.
 *
 * A lógica de verdade vive em `tutor-core.ts`, que não importa nada do
 * TanStack — assim ela é exercitável fora do transporte (o RPC serializa com
 * seroval, o que torna a server function impossível de chamar num teste).
 *
 * `.inputValidator` chama `validateTutorRequest` de verdade (docs/20 §14.2,
 * Fase 7) — antes era um cast (`(data) => data`), que não barrava mensagem
 * vazia, conversa enorme ou imagem fora do tipo/tamanho permitido.
 */
export const askTutor = createServerFn({ method: "POST" })
  .inputValidator(validateTutorRequest)
  .handler(({ data }) => generateTutorReply(data));

export type { TutorImage, TutorRequest, TutorReply } from "@/lib/tutor-core";
