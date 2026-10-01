/**
 * Contrato do pedido à Foca IA (spec 48 T-48.2.1, T-48.2.3, T-48.2.5; 46 §E.7). O mesmo esquema valida no cliente
 * e no servidor.
 *
 * O cliente manda **só**: as últimas mensagens, o item em foco com a resposta crua, o modo e a foto. Perfil,
 * desempenho, enunciado, gabarito e contexto pedagógico são montados no servidor (`src/server/tutor/contexto.ts`).
 * Campos antigos (`context`, `pedagogy`, `image`) são descartados pelo zod — não chegam ao prompt (B-101).
 */
import { z } from "zod";

/** Quantas mensagens vão em cada pedido (46 §E.7). O servidor recusa mais que isso. */
export const TUTOR_MENSAGENS_POR_PEDIDO = 20;
/** Quantas mensagens o aparelho guarda (D48-09). As mais antigas saem. */
export const TUTOR_MENSAGENS_GUARDADAS = 40;
export const TUTOR_TAMANHO_MENSAGEM = 4000;
/** Foto: limite no servidor (46 §E.7). A compressão no cliente deixa bem abaixo disso. */
export const TUTOR_FOTO_MAX_BYTES = 2 * 1024 * 1024;
export const TUTOR_FOTO_TIPOS = ["image/jpeg", "image/png", "image/webp"] as const;
/** Compressão no cliente: lado maior e qualidade do JPEG (46 §E.7). */
export const TUTOR_FOTO_LADO_MAIOR = 1600;
export const TUTOR_FOTO_QUALIDADE = 0.8;

const base64Max = Math.ceil((TUTOR_FOTO_MAX_BYTES * 4) / 3) + 4;

export const pedidoTutor = z.object({
  mensagens: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(TUTOR_TAMANHO_MENSAGEM) }))
    .min(1)
    .max(TUTOR_MENSAGENS_POR_PEDIDO)
    .refine((m) => m[m.length - 1]?.role === "user", "a última mensagem é do aluno"),
  foco: z
    .object({
      itemId: z.string().min(1).max(200),
      respondeu: z.boolean(),
      /** Resposta crua (índice, lista de índices ou nada), no formato do contrato de sincronização. */
      resposta: z.union([z.number().int().min(0).max(50), z.array(z.number().int().min(0).max(50)).max(20), z.null()]),
      /** Ordem exibida dos blocos (ordenar) ou da coluna B (parear). */
      exibidos: z.array(z.string().max(500)).max(20).optional(),
    })
    .nullable(),
  modo: z.enum(["duvida", "ensinar-do-zero"]),
  foto: z
    .object({ tipo: z.enum(TUTOR_FOTO_TIPOS), base64: z.string().min(1).max(base64Max) })
    .nullable(),
});

export type PedidoTutor = z.infer<typeof pedidoTutor>;

/**
 * Resultado. `ok` = resposta da IA; `local` = resposta local (sem chave, modo de demonstração ou falha técnica);
 * os outros são estados que a interface mostra com texto próprio.
 */
export type RespostaTutor =
  | { ok: true; tipo: "ia" | "local"; texto: string; restantes: number | null }
  | {
      ok: false;
      tipo:
        | "sem-sessao"
        | "limite" // cota diária do plano
        | "indisponivel" // teto global de custo ou falha de configuração
        | "consentimento" // 17 anos sem consentimento do responsável
        | "desligado" // o aluno desligou a Foca IA no perfil
        | "autocuidado" // protocolo de autolesão (46 §E.7.5)
        | "recusado" // moderação
        | "foto-invalida"
        | "invalido"
        | "erro";
      texto?: string;
    };

/** Apara o histórico para o pedido: as últimas N, começando por uma mensagem do aluno. */
export function mensagensParaEnviar<T extends { role: "user" | "assistant" }>(todas: T[], n = TUTOR_MENSAGENS_POR_PEDIDO): T[] {
  const fatia = todas.slice(-n);
  const inicio = fatia.findIndex((m) => m.role === "user");
  return inicio <= 0 ? fatia : fatia.slice(inicio);
}
