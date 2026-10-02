/**
 * Assinaturas, compras e pagamentos (spec 49 §12, T-49.2.2; segurança L3).
 *
 * - O plano do aluno é DERIVADO de `assinatura` (válida e não vencida), sempre no servidor (regra dura 5).
 * - `compra.id` é o `externalReference` mandado ao provedor: é por ele que o webhook liga o pagamento ao aluno.
 * - `evento_pagamento` guarda só o id e o tipo do evento (idempotência); o corpo do evento não é guardado.
 * - Dado do pagador (nome, CPF, endereço) fica só no provedor (DV49-03); aqui, nenhum.
 * - Tudo com `ON DELETE CASCADE` no aluno: a guarda fiscal é do provedor (Asaas), que emite a cobrança e a nota.
 */
import { sql } from "drizzle-orm";
import { bigint, check, index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";

const idUsuario = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

const quando = (nome: string) => timestamp(nome, { withTimezone: true });

/** Uma assinatura (Basic ou Pro, mensal ou anual) num provedor. */
export const assinatura = pgTable(
  "assinatura",
  {
    id: text("id").primaryKey(),
    userId: idUsuario(),
    provedor: text("provedor").notNull(),
    /** Onde foi comprada: web (Asaas) agora; apple e google quando houver app nas lojas (D49-08). */
    origem: text("origem").notNull(),
    /** Id da assinatura no provedor (`sub_…` no Asaas); nulo até o provedor criar. */
    idExterno: text("id_externo"),
    produto: text("produto").notNull(),
    plano: text("plano").notNull(),
    estado: text("estado").notNull(),
    inicio: quando("inicio"),
    /** Até quando o plano vale. Cancelada continua valendo até aqui; vencida sem pagamento, não. */
    validoAte: quando("valido_ate"),
    canceladaEm: quando("cancelada_em"),
    /** Fim do arrependimento de 7 dias (CDC art. 49): até aqui o reembolso é integral e automático. */
    reembolsavelAte: quando("reembolsavel_ate"),
    criadaEm: quando("criada_em").notNull().defaultNow(),
    atualizadaEm: quando("atualizada_em").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("assinatura_externo_uq").on(t.provedor, t.idExterno),
    index("assinatura_user_idx").on(t.userId),
    check("assinatura_provedor_ck", sql`${t.provedor} in ('asaas', 'apple', 'google', 'teste')`),
    check("assinatura_origem_ck", sql`${t.origem} in ('web', 'apple', 'google')`),
    check("assinatura_plano_ck", sql`${t.plano} in ('basic', 'pro')`),
    check("assinatura_estado_ck", sql`${t.estado} in ('pendente', 'ativa', 'atrasada', 'cancelada', 'reembolsada', 'expirada')`),
  ],
);

/** Uma ida ao checkout: assinatura nova ou pacote de protetores. `id` = `externalReference` no provedor. */
export const compra = pgTable(
  "compra",
  {
    id: text("id").primaryKey(),
    userId: idUsuario(),
    produto: text("produto").notNull(),
    estado: text("estado").notNull().default("aberta"),
    provedor: text("provedor").notNull(),
    /** Id do checkout no provedor (página hospedada). */
    checkoutId: text("checkout_id"),
    assinaturaId: text("assinatura_id"),
    /** O pagador declarou ser maior de 18 (e responsável, se o aluno for menor) antes de ir ao provedor (D49-09). */
    declarouMaioridadeEm: quando("declarou_maioridade_em").notNull(),
    criadaEm: quando("criada_em").notNull().defaultNow(),
    pagaEm: quando("paga_em"),
  },
  (t) => [
    index("compra_user_idx").on(t.userId),
    uniqueIndex("compra_checkout_uq").on(t.provedor, t.checkoutId),
    check("compra_estado_ck", sql`${t.estado} in ('aberta', 'paga', 'expirada', 'cancelada', 'reembolsada')`),
  ],
);

/** Cada cobrança (mensalidade, anuidade, pacote) confirmada pelo provedor. */
export const cobranca = pgTable(
  "cobranca",
  {
    id: text("id").primaryKey(),
    userId: idUsuario(),
    provedor: text("provedor").notNull(),
    idExterno: text("id_externo").notNull(),
    compraId: text("compra_id"),
    assinaturaId: text("assinatura_id"),
    valorCentavos: integer("valor_centavos").notNull(),
    metodo: text("metodo"),
    estado: text("estado").notNull(),
    pagaEm: quando("paga_em"),
    reembolsadaEm: quando("reembolsada_em"),
    criadaEm: quando("criada_em").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("cobranca_externo_uq").on(t.provedor, t.idExterno), index("cobranca_user_idx").on(t.userId)],
);

/** Eventos de webhook já recebidos (idempotência). Sem o corpo do evento. */
export const eventoPagamento = pgTable(
  "evento_pagamento",
  {
    provedor: text("provedor").notNull(),
    idEvento: text("id_evento").notNull(),
    tipo: text("tipo").notNull(),
    recebidoEm: quando("recebido_em").notNull().defaultNow(),
    processadoEm: quando("processado_em"),
    resultado: text("resultado"),
  },
  (t) => [primaryKey({ columns: [t.provedor, t.idEvento] })],
);

/** Teto diário de custo da Foca IA de quem paga (D49-10): o Free (tabela `ai_budget`) nunca consome esta reserva. */
export const aiBudgetPagos = pgTable("ai_budget_pagos", {
  day: text("day").primaryKey(),
  costMicros: bigint("cost_micros", { mode: "number" }).notNull().default(0),
});
