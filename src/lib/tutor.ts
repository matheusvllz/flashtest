import { createServerFn } from "@tanstack/react-start";
import { generateTutorReply, type TutorRequest } from "@/lib/tutor-core";

/**
 * Transporte do balão do tutor: só a server function do TanStack Start.
 *
 * A lógica de verdade vive em `tutor-core.ts`, que não importa nada do
 * TanStack — assim ela é exercitável fora do transporte (o RPC serializa com
 * seroval, o que torna a server function impossível de chamar num teste).
 */
export const askTutor = createServerFn({ method: "POST" })
  .inputValidator((data: TutorRequest) => data)
  .handler(({ data }) => generateTutorReply(data));

export type { TutorImage, TutorRequest, TutorReply } from "@/lib/tutor-core";
