/**
 * Entrega E3 da spec 49 (§12): ranking semanal de maiores de 18 e as funções pagas.
 * Tudo com `ON DELETE CASCADE` no aluno. Nenhuma tabela guarda data de nascimento (só `maior_desde`).
 */
import { sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, pgTable, primaryKey, smallint, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import type { Json, JsonObjeto } from "@/lib/json";
import { user } from "./auth";

const idUsuario = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });
const quando = (nome: string) => timestamp(nome, { withTimezone: true });

/** Participação no ranking (opt-in). O apelido é único sem diferenciar maiúsculas. */
export const rankingParticipante = pgTable(
  "ranking_participante",
  {
    userId: idUsuario().primaryKey(),
    apelido: text("apelido").notNull(),
    /** Quando a maioridade foi confirmada (ano do cadastro, ou dia e mês no ano limítrofe). Nunca a data em si. */
    maiorDesde: quando("maior_desde").notNull(),
    entrouEm: quando("entrou_em").notNull().defaultNow(),
    saiuEm: quando("saiu_em"),
    ocultoPorDenuncia: boolean("oculto_por_denuncia").notNull().default(false),
    /** Liga (spec 50 §5.5): divisão atual, de 1 (Areia) a 5 (Abismo). */
    divisao: smallint("divisao").notNull().default(1),
    /** Liga: semana inteira sem pontos; volta à mesma divisão quando estudar. */
    pausado: boolean("pausado").notNull().default(false),
    /**
     * Funções sociais (liga e amigos) suspensas até a revisão do suporte (denúncia "parece menor de 18", spec 50
     * §5.6.5). Fica aqui porque esta linha é a identidade social do aluno: o apelido da liga é o mesmo dos amigos.
     */
    socialSuspensoEm: quando("social_suspenso_em"),
  },
  (t) => [uniqueIndex("ranking_apelido_uq").on(sql`lower(${t.apelido})`), check("ranking_divisao_ck", sql`${t.divisao} between 1 and 5`)],
);

/**
 * Grupo da semana. Ranking da 49: até 30, na ordem de entrada. Liga (spec 50 §5.5): até 20 por divisão, numerados
 * dentro da divisão.
 */
export const rankingGrupo = pgTable(
  "ranking_grupo",
  {
    semana: text("semana").notNull(),
    userId: idUsuario(),
    grupo: integer("grupo").notNull(),
    divisao: smallint("divisao").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.semana, t.userId] }), index("ranking_grupo_idx").on(t.semana, t.grupo)],
);

/** Caderno de erros (Basic e Pro): questão errada volta em revisão espaçada. */
export const cadernoItem = pgTable(
  "caderno_item",
  {
    userId: idUsuario(),
    itemId: text("item_id").notNull(),
    entrouEm: quando("entrou_em").notNull().defaultNow(),
    proximaRevisao: text("proxima_revisao").notNull(),
    etapa: smallint("etapa").notNull().default(0),
    acertosSeguidos: smallint("acertos_seguidos").notNull().default(0),
    estado: text("estado").notNull().default("ativo"),
    atualizadoEm: quando("atualizado_em").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.itemId] }),
    check("caderno_estado_ck", sql`${t.estado} in ('ativo', 'resolvido')`),
  ],
);

/** Cronograma até o ENEM (Basic e Pro). */
export const cronograma = pgTable("cronograma", {
  userId: idUsuario().primaryKey(),
  diasSemana: smallint("dias_semana").notNull(),
  minutosDia: smallint("minutos_dia").notNull(),
  dataProva: text("data_prova").notNull(),
  plano: jsonb("plano").$type<Json>().notNull().default(sql`'{}'::jsonb`),
  versao: smallint("versao").notNull().default(1),
  geradoEm: quando("gerado_em").notNull().defaultNow(),
});

/** Simulado ENEM (Pro). As respostas vão para `attempt` com fonte `simulado`. */
export const simulado = pgTable(
  "simulado",
  {
    id: text("id").primaryKey(),
    userId: idUsuario(),
    tipo: text("tipo").notNull(),
    area: text("area"),
    itens: jsonb("itens").$type<string[]>().notNull(),
    respostas: jsonb("respostas").$type<JsonObjeto>().notNull().default(sql`'{}'::jsonb`),
    iniciadoEm: quando("iniciado_em").notNull().defaultNow(),
    concluidoEm: quando("concluido_em"),
    resultado: jsonb("resultado").$type<JsonObjeto>(),
  },
  (t) => [index("simulado_user_idx").on(t.userId), check("simulado_tipo_ck", sql`${t.tipo} in ('area', 'dia')`)],
);

/** Redações corrigidas e treinos por partes (Pro). Texto apagável pelo aluno. */
export const redacao = pgTable(
  "redacao",
  {
    id: text("id").primaryKey(),
    userId: idUsuario(),
    tipo: text("tipo").notNull(),
    tema: text("tema").notNull(),
    texto: text("texto").notNull(),
    resultado: jsonb("resultado").$type<JsonObjeto>(),
    versaoRubrica: smallint("versao_rubrica").notNull().default(1),
    criadaEm: quando("criada_em").notNull().defaultNow(),
  },
  (t) => [index("redacao_user_idx").on(t.userId, t.criadaEm), check("redacao_tipo_ck", sql`${t.tipo} in ('correcao', 'treino')`)],
);
