/**
 * Lembrete diário por push (spec 50 §5.2.5, §12.1 migração 0010).
 * - `push_assinatura`: uma linha por aparelho que ligou o lembrete. O `endpoint` é o endereço do serviço de push do
 *   navegador (identificador técnico: nunca em log, nunca na exportação). A janela é a mesma para todos os aparelhos
 *   do aluno (uma preferência por aluno).
 * - `ultimo_envio_dia`: dia local (fuso do perfil) do último lembrete entregue — no máximo 1 por dia.
 * - `sem_estudo_seguidos`: lembretes seguidos sem estudo depois deles; em 7, pausa (`pausada_em`) até o aluno religar.
 * - `falhas`: erros seguidos do serviço de push (fora 404/410, que apagam na hora); em 5, a assinatura sai.
 * Retenção: sai ao desligar, ao sair da conta no aparelho ou depois de 30 dias sem poder entregar (`retencao.ts`).
 */
import { sql } from "drizzle-orm";
import { check, index, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { JANELAS_DO_LEMBRETE, type JanelaDoLembrete } from "../../../lib/lembretes/regras";
import { user } from "./auth";

export { JANELAS_DO_LEMBRETE, type JanelaDoLembrete };

export const pushAssinatura = pgTable(
  "push_assinatura",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    janela: text("janela").$type<JanelaDoLembrete>().notNull(),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
    ultimoEnvioDia: text("ultimo_envio_dia"),
    semEstudoSeguidos: smallint("sem_estudo_seguidos").notNull().default(0),
    pausadaEm: timestamp("pausada_em", { withTimezone: true }),
    falhas: smallint("falhas").notNull().default(0),
  },
  (t) => [
    uniqueIndex("push_assinatura_endpoint_uq").on(t.endpoint),
    index("push_assinatura_user_idx").on(t.userId),
    index("push_assinatura_janela_idx").on(t.janela, t.id),
    check("push_assinatura_janela_ck", sql`${t.janela} in ('manha', 'tarde', 'fim-de-tarde', 'noite')`),
    check("push_assinatura_contagens_ck", sql`${t.semEstudoSeguidos} >= 0 and ${t.falhas} >= 0`),
  ],
);
