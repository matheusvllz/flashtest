/**
 * Missões, desafio do mês e conquistas (spec 50 §5.4, §12.1 migração 0005).
 * - `missao_dia`: as 3 missões sorteadas para o aluno num dia (determinístico) e o progresso; limpeza: 90 dias.
 * - `desafio_mes`: missões concluídas no mês; 20 → medalha + Pérolas, uma vez.
 * - `conquista`: conquistas permanentes já obtidas.
 */
import { sql } from "drizzle-orm";
import { check, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

const idUsuario = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

export const missaoDia = pgTable(
  "missao_dia",
  {
    userId: idUsuario(),
    localDate: text("local_date").notNull(),
    missaoId: text("missao_id").notNull(),
    /** Ordem na tela (0 fazer, 1 acertar, 2 conteúdo). */
    ordem: integer("ordem").notNull(),
    alvo: integer("alvo").notNull(),
    progresso: integer("progresso").notNull().default(0),
    concluidaEm: timestamp("concluida_em", { withTimezone: true }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.localDate, t.missaoId] }),
    check("missao_dia_ck", sql`${t.alvo} > 0 and ${t.progresso} >= 0`),
  ],
);

export const desafioMes = pgTable(
  "desafio_mes",
  {
    userId: idUsuario(),
    mes: text("mes").notNull(),
    progresso: integer("progresso").notNull().default(0),
    concluidoEm: timestamp("concluido_em", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.mes] })],
);

export const conquista = pgTable(
  "conquista",
  {
    userId: idUsuario(),
    conquistaId: text("conquista_id").notNull(),
    obtidaEm: timestamp("obtida_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.conquistaId] })],
);
