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
  /** Checagem da trilha (spec 49 D49-03: não custa vida). Antes ia como "atividade". */
  "checagem",
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
  /**
   * Spec 50 §5.1.4: "revisao" = a mesma questão respondida de novo na revisão de erros do fim da lição. Não custa
   * vida, não entra no caderno, não conta para combo nem para a nota da atividade. Ausente = "primeira" (cliente antigo).
   */
  tentativa: z.enum(["primeira", "revisao"]).optional(),
  /** A Foca IA foi aberta ANTES de responder (spec 50 §5.1.1): o acerto não soma no combo nem na lição perfeita. */
  assistida: z.boolean().optional(),
  /** `false` = questão de checagem dentro da lição (não pontuada): não conta nem zera o combo. Ausente = pontuada. */
  pontuada: z.boolean().optional(),
});

export const eventoLicaoConcluida = z.object({
  tipo: z.literal("licao-concluida"),
  id,
  licaoId: textoCurto,
  tipoLicao: z.enum(["redacao", "micro"]),
  versao: z.number().int().min(0).max(1000).optional(),
  acertos: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(100),
  /** Tentativa da lição (spec 50 §5.1.6): liga a conclusão às respostas dela (lição perfeita, bônus do combo). Aditivo. */
  attemptKey: z.string().min(1).max(200).optional(),
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
  /** Plano decidido no servidor (spec 49 D49-08). Aditivo. */
  plano?: "gratis" | "basic" | "pro";
  /** Teto de protetores do plano (spec 49 D49-05). Aditivo. */
  protetoresMax?: number;
  /** Vidas de hoje (spec 49 D49-03); `null` = sem vidas (plano pago ou desligado). Aditivo. */
  vidas?: { dia: string; restantes: number; anuncioUsado: boolean; recargaUsada?: boolean; doCombo?: number } | null;
  /** Spec 50 §5.3.4: saldo de Pérolas (verdade do servidor). Aditivo; ausente quando as Pérolas estão desligadas. */
  perolas?: number;
  /** Spec 50 §5.3.3: roupa da Foca e tema da trilha em uso. Aditivo. */
  cosmeticos?: { roupa: string | null; tema: string | null };
  /** Spec 50 §5.1.1: combo do dia no servidor. Aditivo. */
  combo?: { dia: string; atual: number; maximo: number } | null;
  /** Spec 50: acontecimentos deste envio que o app celebra (uma vez). Aditivo. */
  novidades?: NovidadesDoServidor;
}

/** O que aconteceu neste envio e merece um momento na tela (spec 50 §5.12.3). Só informa; quem decide é o servidor. */
export interface NovidadesDoServidor {
  perolasGanhas: number;
  vidasDoCombo: number;
  metaCumprida: { alvo: number; perolas: number } | null;
  marco: { dias: number; perolas: number; item: string | null } | null;
  perfeitas: number;
  conquistas: string[];
  missoesConcluidas: string[];
  desafioDoMes: boolean;
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
