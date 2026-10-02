/**
 * Vidas do Free e créditos de protetor de sequência (spec 49 §12, entrega E2; D49-03, D49-05).
 * - `vidas_dia`: quantas vidas o aluno do Free perdeu e ganhou por anúncio num dia (fuso dele). Limpeza: 30 dias.
 * - `protetor_credito`: protetores comprados (e estornos). O bônus mensal do plano é derivado das assinaturas, não
 *   gravado; os ganhos a cada 7 dias continuam derivados de `study_day`.
 */
import { sql } from "drizzle-orm";
import { check, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

const idUsuario = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

export const vidasDia = pgTable(
  "vidas_dia",
  {
    userId: idUsuario(),
    localDate: text("local_date").notNull(),
    perdidas: integer("perdidas").notNull().default(0),
    ganhasAnuncio: integer("ganhas_anuncio").notNull().default(0),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.localDate] }),
    check("vidas_dia_anuncio_ck", sql`${t.ganhasAnuncio} between 0 and 1`),
    check("vidas_dia_perdidas_ck", sql`${t.perdidas} >= 0`),
  ],
);

export const protetorCredito = pgTable(
  "protetor_credito",
  {
    userId: idUsuario(),
    /** `compra:<id>` ou `estorno:<id>`: idempotente por chave. */
    chave: text("chave").notNull(),
    quantidade: integer("quantidade").notNull(),
    motivo: text("motivo").notNull(),
    localDate: text("local_date").notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.chave] }), check("protetor_credito_motivo_ck", sql`${t.motivo} in ('compra', 'estorno')`)],
);
