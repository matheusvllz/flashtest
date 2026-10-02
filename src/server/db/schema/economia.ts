/**
 * Economia e ofensiva (spec 50 §5.2–§5.3, §12.1 migração 0004).
 * - `perola_movimento`: livro-razão das Pérolas. Saldo = soma; a chave única por aluno impede pagar o mesmo fato duas
 *   vezes (reenvio, dois aparelhos, sincronização atrasada). Gasto = movimento negativo com `compra:<pedidoId>`.
 * - `combo_dia`: combo do dia decidido no servidor (a verdade das recompensas do combo). Limpeza: 30 dias.
 * - `meta_ofensiva`: meta escolhida pelo aluno (7/14/30/50), uma ativa por vez.
 * - `marco_ofensiva`: marcos já alcançados (o baú abre só na primeira vez).
 * - `inventario` e `cosmetico_equipado`: roupas da Foca e temas comprados ou ganhos.
 */
import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

const idUsuario = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

export const perolaMovimento = pgTable(
  "perola_movimento",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: idUsuario(),
    chave: text("chave").notNull(),
    quantidade: integer("quantidade").notNull(),
    motivo: text("motivo").notNull(),
    /** Referência legível (ex.: id da missão, item comprado). */
    ref: text("ref"),
    localDate: text("local_date").notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("perola_movimento_chave_uq").on(t.userId, t.chave),
    index("perola_movimento_user_idx").on(t.userId, t.criadoEm),
    check("perola_movimento_qtd_ck", sql`${t.quantidade} <> 0`),
    check(
      "perola_movimento_motivo_ck",
      sql`${t.motivo} in ('bloco', 'perfeita', 'missao', 'missoes-completas', 'meta-ofensiva', 'marco', 'conquista', 'desafio', 'nivel', 'simulado', 'compra')`,
    ),
  ],
);

export const comboDia = pgTable(
  "combo_dia",
  {
    userId: idUsuario(),
    localDate: text("local_date").notNull(),
    atual: integer("atual").notNull().default(0),
    maximo: integer("maximo").notNull().default(0),
    ultimaRespostaEm: timestamp("ultima_resposta_em", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.localDate] }), check("combo_dia_ck", sql`${t.atual} >= 0 and ${t.maximo} >= ${t.atual}`)],
);

export const metaOfensiva = pgTable(
  "meta_ofensiva",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: idUsuario(),
    alvo: integer("alvo").notNull(),
    /** Sequência que já existia quando a meta foi escolhida (sem contar hoje): cumprida quando `sequencia - inicial >= alvo`. */
    sequenciaInicial: integer("sequencia_inicial").notNull(),
    /** Primeiro dia da sequência a que a meta está ligada; `null` = começou sem sequência viva (liga na próxima). */
    inicioSequencia: text("inicio_sequencia"),
    /** Dia local em que a meta foi escolhida. */
    inicio: text("inicio").notNull(),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
    concluidaEm: timestamp("concluida_em", { withTimezone: true }),
    encerradaEm: timestamp("encerrada_em", { withTimezone: true }),
  },
  (t) => [index("meta_ofensiva_user_idx").on(t.userId), check("meta_ofensiva_alvo_ck", sql`${t.alvo} in (7, 14, 30, 50)`)],
);

export const marcoOfensiva = pgTable(
  "marco_ofensiva",
  {
    userId: idUsuario(),
    dias: integer("dias").notNull(),
    alcancadoEm: timestamp("alcancado_em", { withTimezone: true }).notNull().defaultNow(),
    /** O aluno já viu o momento do marco (evita repetir a celebração em outro aparelho). */
    vistoEm: timestamp("visto_em", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.dias] })],
);

export const inventario = pgTable(
  "inventario",
  {
    userId: idUsuario(),
    itemId: text("item_id").notNull(),
    obtidoEm: timestamp("obtido_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
);

export const cosmeticoEquipado = pgTable("cosmetico_equipado", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  roupa: text("roupa"),
  tema: text("tema"),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
});
