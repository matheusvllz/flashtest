/**
 * Trilha (spec 50 §5.7.1, E7): o teste "pular para cá". Uma linha por aluno, capítulo e dia local — a chave primária
 * é o próprio limite de 1 tentativa por capítulo por dia. As respostas vão para `attempt` com fonte `pulo` só ao
 * terminar; as lições puladas viram `completion` com `kind = 'pulo'` (chave `pulo:<tipo>:<licaoId>`).
 */
import { sql } from "drizzle-orm";
import { check, index, jsonb, pgTable, primaryKey, smallint, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import type { JsonObjeto } from "@/lib/json";
import { user } from "./auth";

export const puloTentativa = pgTable(
  "pulo_tentativa",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    capituloId: text("capitulo_id").notNull(),
    localDate: text("local_date").notNull(),
    /** Referência que o aparelho usa (`pulo-<uuid>`). */
    id: text("id").notNull(),
    subjectId: text("subject_id").notNull(),
    /** `[{ itemId, skillId }]`, na ordem do teste. */
    itens: jsonb("itens").$type<{ itemId: string; skillId: string }[]>().notNull(),
    /** Lições do caminho no começo do teste: `[{ id, tipo, capituloId }]`. */
    licoes: jsonb("licoes").$type<{ id: string; tipo: "micro" | "redacao"; capituloId: string }[]>().notNull(),
    /** Habilidades do caminho sem questão no teste (ganham revisão agendada; o domínio não muda). */
    semQuestao: jsonb("sem_questao").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    resultado: text("resultado"),
    acertos: smallint("acertos"),
    /** O que a tela de resultado mostra (devolvido igual em uma segunda chamada). */
    detalhe: jsonb("detalhe").$type<JsonObjeto>(),
    iniciadoEm: timestamp("iniciado_em", { withTimezone: true }).notNull().defaultNow(),
    concluidoEm: timestamp("concluido_em", { withTimezone: true }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.capituloId, t.localDate] }),
    uniqueIndex("pulo_tentativa_id_uq").on(t.id),
    index("pulo_tentativa_user_dia_idx").on(t.userId, t.localDate),
    check("pulo_tentativa_resultado_ck", sql`${t.resultado} is null or ${t.resultado} in ('passou', 'nao-passou')`),
  ],
);
