/**
 * Funções sociais só para maiores de 18 (spec 50 §5.5, §5.6, §12.1 migração 0009). Tudo com `ON DELETE CASCADE` no
 * aluno. Nenhuma tabela guarda data de nascimento, contato, nome ou foto: a identidade social é o apelido de
 * `ranking_participante` (que também guarda a divisão da liga e a suspensão por denúncia).
 *
 * - `liga_resultado`: resultado de cada semana fechada (posição, pontos, movimento). Retenção: até sair + 30 dias.
 * - `liga_fechamento`: uma linha por semana fechada (chave `liga:<semana>`), para o cron ser idempotente.
 * - `convite_amizade`: só o SHA-256 do código (o código em si nunca é guardado); uso único, 72 h. Retenção: 7 dias.
 * - `amizade`: a dupla, com o par ordenado (`user_a < user_b`) único. Encerrada: apagada em 30 dias.
 * - `bloqueio`: nos dois sentidos na prática (quem bloqueou e quem foi bloqueado não se convidam). Fica enquanto as
 *   duas contas existirem. `ref` é um identificador opaco para desbloquear sem mandar id de aluno ao navegador.
 * - `denuncia`: motivo fixo, sem texto livre. Apagada 90 dias depois de resolvida.
 */
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

const refUsuario = (coluna: string) =>
  text(coluna)
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });
const quando = (nome: string) => timestamp(nome, { withTimezone: true });

export const ligaResultado = pgTable(
  "liga_resultado",
  {
    semana: text("semana").notNull(),
    userId: refUsuario("user_id"),
    /** Divisão em que jogou a semana. */
    divisao: smallint("divisao").notNull(),
    /** `null` = semana sem pontos (pausa). */
    posicao: smallint("posicao"),
    pontos: integer("pontos").notNull(),
    movimento: text("movimento").notNull(),
    criadoEm: quando("criado_em").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.semana, t.userId] }),
    index("liga_resultado_user_idx").on(t.userId, t.semana),
    check("liga_resultado_movimento_ck", sql`${t.movimento} in ('sobe', 'fica', 'desce')`),
    check("liga_resultado_divisao_ck", sql`${t.divisao} between 1 and 5`),
  ],
);

export const ligaFechamento = pgTable("liga_fechamento", {
  chave: text("chave").primaryKey(),
  fechadaEm: quando("fechada_em").notNull().defaultNow(),
  participantes: integer("participantes").notNull().default(0),
});

export const conviteAmizade = pgTable(
  "convite_amizade",
  {
    /** SHA-256 (hex) do código de 128 bits. */
    codigoHash: text("codigo_hash").primaryKey(),
    userId: refUsuario("user_id"),
    expiraEm: quando("expira_em").notNull(),
    usadoEm: quando("usado_em"),
    criadoEm: quando("criado_em").notNull().defaultNow(),
  },
  (t) => [index("convite_amizade_user_idx").on(t.userId, t.criadoEm)],
);

export const amizade = pgTable(
  "amizade",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userA: refUsuario("user_a"),
    userB: refUsuario("user_b"),
    estado: text("estado").notNull(),
    pedidaPor: refUsuario("pedida_por"),
    criadaEm: quando("criada_em").notNull().defaultNow(),
    aceitaEm: quando("aceita_em"),
    encerradaEm: quando("encerrada_em"),
  },
  (t) => [
    uniqueIndex("amizade_par_uq").on(t.userA, t.userB),
    index("amizade_user_b_idx").on(t.userB),
    check("amizade_par_ck", sql`${t.userA} < ${t.userB}`),
    check("amizade_estado_ck", sql`${t.estado} in ('pedido', 'ativa', 'encerrada')`),
  ],
);

export const bloqueio = pgTable(
  "bloqueio",
  {
    userId: refUsuario("user_id"),
    bloqueadoId: refUsuario("bloqueado_id"),
    ref: uuid("ref").notNull().defaultRandom(),
    criadoEm: quando("criado_em").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.bloqueadoId] }),
    uniqueIndex("bloqueio_ref_uq").on(t.ref),
    index("bloqueio_alvo_idx").on(t.bloqueadoId),
  ],
);

export const denuncia = pgTable(
  "denuncia",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    autorId: refUsuario("autor_id"),
    alvoId: refUsuario("alvo_id"),
    contexto: text("contexto").notNull(),
    motivo: text("motivo").notNull(),
    criadaEm: quando("criada_em").notNull().defaultNow(),
    resolvidaEm: quando("resolvida_em"),
  },
  (t) => [
    index("denuncia_alvo_idx").on(t.alvoId),
    index("denuncia_autor_idx").on(t.autorId, t.criadaEm),
    check("denuncia_contexto_ck", sql`${t.contexto} in ('liga', 'amigos')`),
    check("denuncia_motivo_ck", sql`${t.motivo} in ('apelido', 'menor', 'outro')`),
  ],
);
