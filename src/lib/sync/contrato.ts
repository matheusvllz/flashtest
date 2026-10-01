/**
 * Contrato da sincronização de estudo (docs/specs/46-producao §E.4, T-06.3). Compartilhado pelo
 * cliente (outbox no store) e pelo servidor (`src/server/estudo/`), para os dois validarem igual.
 *
 * Princípio: o cliente relata FATOS (respondeu tal item, concluiu tal lição/atividade, estudou
 * hoje). O servidor decide as RECOMPENSAS: recalcula a correção pelo gabarito, calcula o XP pelas
 * regras de `src/lib/recompensas.ts` com teto por chave e soma a sequência pelos dias. Nenhum
 * campo de XP, sequência ou nota vem do cliente.
 */
import { z } from "zod";

const id = z.string().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/);
const quando = z.string().datetime({ offset: true });
const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const textoCurto = z.string().min(1).max(200);

/** Resposta do aluno como o player grava: índice, lista de índices (ordenar/parear) ou `null` ("Não sei"). */
const resposta = z.union([z.number().int().min(0).max(50), z.array(z.number().int().min(0).max(50)).max(20), z.null()]);

export const FONTES_DE_RESPOSTA = [
  "questao-geral",
  "atividade",
  "licao",
  "redacao",
  "nivelamento",
  "flashcard",
] as const;

export const eventoResposta = z.object({
  tipo: z.literal("resposta"),
  id,
  itemId: textoCurto,
  resposta,
  /** Ordem exibida dos blocos (ordenar) ou da coluna B (parear) — necessária para corrigir. */
  exibidos: z.array(z.string().max(500)).max(20).optional(),
  fonte: z.enum(FONTES_DE_RESPOSTA),
  /** Tentativa de atividade da trilha a que a resposta pertence (`<id>@<startedAt>`). */
  attemptKey: z.string().min(1).max(200).optional(),
  ocorreuEm: quando,
  dataLocal: dia,
  duracaoMs: z.number().int().min(0).max(3_600_000).optional(),
});

export const eventoLicaoConcluida = z.object({
  tipo: z.literal("licao-concluida"),
  id,
  licaoId: textoCurto,
  tipoLicao: z.enum(["redacao", "micro"]),
  versao: z.number().int().min(0).max(1000).optional(),
  acertos: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(100),
  ocorreuEm: quando,
  dataLocal: dia,
});

export const eventoAtividadeConcluida = z.object({
  tipo: z.literal("atividade-concluida"),
  id,
  attemptKey: z.string().min(1).max(200),
  atividadeId: textoCurto,
  kind: z.string().min(1).max(40),
  ocorreuEm: quando,
  dataLocal: dia,
});

/** Aula de 60 s (`/study`) ou lote de flashcards: contam como um bloco do dia, sem XP próprio. */
export const eventoBlocoConcluido = z.object({
  tipo: z.literal("bloco-concluido"),
  id,
  bloco: z.enum(["aula-60s", "flashcards"]),
  ocorreuEm: quando,
  dataLocal: dia,
});

/** Fim do onboarding (bônus único de entrada). */
export const eventoEntrada = z.object({
  tipo: z.literal("entrada"),
  id,
  ocorreuEm: quando,
  dataLocal: dia,
});

export const eventoEstudo = z.discriminatedUnion("tipo", [
  eventoResposta,
  eventoLicaoConcluida,
  eventoAtividadeConcluida,
  eventoBlocoConcluido,
  eventoEntrada,
]);
export type EventoEstudo = z.infer<typeof eventoEstudo>;

export const LIMITE_EVENTOS_POR_ENVIO = 200;

export const pedidoEnvio = z.object({
  eventos: z.array(eventoEstudo).min(1).max(LIMITE_EVENTOS_POR_ENVIO),
});

/** O que o servidor considera verdade sobre recompensas (sobrescreve o local). */
export interface Agregado {
  xp: number;
  sequencia: number;
  melhorSequencia: number;
  congelamentos: number;
  /** Último dia com atividade (`AAAA-MM-DD`) ou `null`. */
  ultimoDia: string | null;
  diasComAtividade: number;
  /** Último dia parado coberto por proteção (spec 48 D48-14), ou `null`. Aditivo: servidor antigo não manda. */
  diaProtegido?: string | null;
}

export type MotivoRejeicao =
  | "ITEM_DESCONHECIDO"
  | "LICAO_DESCONHECIDA"
  | "DATA_FORA_DA_JANELA"
  | "ATIVIDADE_SEM_RESPOSTAS"
  | "DUPLICADO";

export interface RespostaEnvio {
  ok: true;
  aplicados: string[];
  rejeitados: Array<{ id: string; motivo: MotivoRejeicao }>;
  agregado: Agregado;
}
