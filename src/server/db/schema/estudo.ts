/**
 * Tabelas do Foca (docs/arquitetura/dados.md §2; docs/specs/46-producao §E.2).
 *
 * Toda tabela de dado do aluno tem `user_id` com `ON DELETE CASCADE` (a exclusão da conta apaga
 * tudo) e toda consulta filtra pelo `user_id` da SESSÃO — nunca por um id vindo do cliente.
 * Dados pessoais: só os listados em docs/seguranca/privacidade.md.
 */
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Json, JsonObjeto } from "@/lib/json";
import { user } from "./auth";

const idUsuario = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

/** Perfil de estudo (vem do onboarding). Minimização: sem escola, cidade, telefone ou data completa. */
export const profile = pgTable(
  "profile",
  {
    userId: idUsuario().primaryKey(),
    /** Plano da Foca IA (D-12). Só o servidor altera; todo aluno começa no grátis. */
    plano: text("plano").notNull().default("gratis"),
    firstName: text("first_name"),
    level: text("level"),
    residenceState: text("residence_state"),
    targetCourse: text("target_course"),
    targetInstitution: text("target_institution"),
    examTargets: jsonb("exam_targets").$type<Json[]>().notNull().default(sql`'[]'::jsonb`),
    studyPrefs: jsonb("study_prefs").$type<JsonObjeto>().notNull().default(sql`'{}'::jsonb`),
    onboardingVersion: smallint("onboarding_version"),
    onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
    /** Fuso do aluno, usado para decidir o "dia" do streak. */
    timezone: text("timezone").notNull().default("America/Sao_Paulo"),
    /** A Foca IA pode ser desligada pelo aluno (ECA Digital art. 17 §4 VIII). */
    tutorDesligado: boolean("tutor_desligado").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("profile_plano_ck", sql`${t.plano} in ('gratis', 'pro')`),
    check("profile_uf_ck", sql`${t.residenceState} is null or ${t.residenceState} ~ '^[A-Z]{2}$'`),
    check("profile_nome_ck", sql`${t.firstName} is null or char_length(${t.firstName}) <= 40`),
  ],
);

/** Aceite dos documentos legais (histórico; a versão atual também fica em `user`). */
export const legalAcceptance = pgTable(
  "legal_acceptance",
  {
    id: text("id").primaryKey(),
    userId: idUsuario(),
    document: text("document").notNull(),
    version: text("version").notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("legal_acceptance_uq").on(t.userId, t.document, t.version),
    check("legal_acceptance_doc_ck", sql`${t.document} in ('termos', 'privacidade')`),
  ],
);

/** Consentimentos específicos e revogáveis (separados do aceite contratual). */
export const consent = pgTable(
  "consent",
  {
    id: text("id").primaryKey(),
    userId: idUsuario(),
    purpose: text("purpose").notNull(),
    grantedBy: text("granted_by").notNull(),
    /** Hash do e-mail do responsável (nunca o e-mail em claro). */
    guardianEmailHash: text("guardian_email_hash"),
    grantedAt: timestamp("granted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("consent_user_purpose_idx").on(t.userId, t.purpose),
    check("consent_granted_by_ck", sql`${t.grantedBy} in ('titular', 'responsavel')`),
  ],
);

/** Uma resposta a um item. `correct` é recalculado no servidor pelo gabarito. */
export const attempt = pgTable(
  "attempt",
  {
    userId: idUsuario(),
    /** Gerado no cliente (idempotência). */
    id: text("id").notNull(),
    itemId: text("item_id").notNull(),
    itemVersion: integer("item_version"),
    skillIds: text("skill_ids").array().notNull().default(sql`'{}'::text[]`),
    role: text("role"),
    answer: text("answer"),
    correct: boolean("correct").notNull(),
    source: text("source").notNull(),
    durationMs: integer("duration_ms"),
    answeredAt: timestamp("answered_at", { withTimezone: true }).notNull(),
    localDate: text("local_date").notNull(),
    activityAttemptKey: text("activity_attempt_key"),
    origin: text("origin").notNull().default("live"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index("attempt_user_answered_idx").on(t.userId, t.answeredAt),
    index("attempt_user_item_idx").on(t.userId, t.itemId),
    index("attempt_user_activity_idx").on(t.userId, t.activityAttemptKey),
    check("attempt_origin_ck", sql`${t.origin} in ('live', 'import')`),
  ],
);

/** Conclusão idempotente (contrato 36 RF-6): uma linha por chave. */
export const completion = pgTable(
  "completion",
  {
    userId: idUsuario(),
    key: text("key").notNull(),
    kind: text("kind").notNull(),
    scorePct: smallint("score_pct"),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
    origin: text("origin").notNull().default("live"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.key] })],
);

/**
 * Livro de XP: uma linha por chave de recompensa, com o MAIOR valor já pago para ela (teto por
 * chave). O total do aluno é a soma. O servidor calcula o valor; o cliente nunca o informa.
 */
export const xpLedger = pgTable(
  "xp_ledger",
  {
    userId: idUsuario(),
    key: text("key").notNull(),
    xp: smallint("xp").notNull(),
    reason: text("reason").notNull(),
    localDate: text("local_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.key] }),
    index("xp_ledger_user_day_idx").on(t.userId, t.localDate),
    check("xp_ledger_xp_ck", sql`${t.xp} between 0 and 100`),
  ],
);

/** Dias com atividade (base do streak e dos congelamentos). */
export const studyDay = pgTable(
  "study_day",
  {
    userId: idUsuario(),
    localDate: text("local_date").notNull(),
    blocks: smallint("blocks").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.localDate] })],
);

/** Estado de planejamento do motor adaptativo (não é autoridade de recompensa). */
export const learningDoc = pgTable("learning_doc", {
  userId: idUsuario().primaryKey(),
  rev: integer("rev").notNull().default(0),
  schemaVersion: smallint("schema_version").notNull(),
  doc: jsonb("doc").$type<JsonObjeto>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Importação do estado local para a conta (idempotente por `id`). */
export const dataImport = pgTable(
  "data_import",
  {
    userId: idUsuario(),
    id: text("id").notNull(),
    deviceIdHash: text("device_id_hash").notNull(),
    status: text("status").notNull(),
    summary: jsonb("summary").$type<JsonObjeto>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })],
);

/** Uso diário da Foca IA (cota e custo). O conteúdo da conversa não é guardado (D-13). */
export const aiUsage = pgTable(
  "ai_usage",
  {
    userId: idUsuario(),
    day: text("day").notNull(),
    messages: integer("messages").notNull().default(0),
    images: integer("images").notNull().default(0),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    costMicros: bigint("cost_micros", { mode: "number" }).notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

/** Teto global diário de custo da Foca IA (disjuntor). */
export const aiBudget = pgTable("ai_budget", {
  day: text("day").primaryKey(),
  costMicros: bigint("cost_micros", { mode: "number" }).notNull().default(0),
});

/** Eventos de segurança, sem conteúdo. Retenção: 6 meses. */
export const auditEvent = pgTable(
  "audit_event",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    type: text("type").notNull(),
    requestId: text("request_id"),
    ipPrefix: text("ip_prefix"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_event_created_idx").on(t.createdAt), index("audit_event_user_idx").on(t.userId)],
);
