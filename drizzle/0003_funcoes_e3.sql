CREATE TABLE "caderno_item" (
	"user_id" text NOT NULL,
	"item_id" text NOT NULL,
	"entrou_em" timestamp with time zone DEFAULT now() NOT NULL,
	"proxima_revisao" text NOT NULL,
	"etapa" smallint DEFAULT 0 NOT NULL,
	"acertos_seguidos" smallint DEFAULT 0 NOT NULL,
	"estado" text DEFAULT 'ativo' NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "caderno_item_user_id_item_id_pk" PRIMARY KEY("user_id","item_id"),
	CONSTRAINT "caderno_estado_ck" CHECK ("caderno_item"."estado" in ('ativo', 'resolvido'))
);
--> statement-breakpoint
CREATE TABLE "cronograma" (
	"user_id" text PRIMARY KEY NOT NULL,
	"dias_semana" smallint NOT NULL,
	"minutos_dia" smallint NOT NULL,
	"data_prova" text NOT NULL,
	"plano" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"versao" smallint DEFAULT 1 NOT NULL,
	"gerado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ranking_grupo" (
	"semana" text NOT NULL,
	"user_id" text NOT NULL,
	"grupo" integer NOT NULL,
	CONSTRAINT "ranking_grupo_semana_user_id_pk" PRIMARY KEY("semana","user_id")
);
--> statement-breakpoint
CREATE TABLE "ranking_participante" (
	"user_id" text PRIMARY KEY NOT NULL,
	"apelido" text NOT NULL,
	"maior_desde" timestamp with time zone NOT NULL,
	"entrou_em" timestamp with time zone DEFAULT now() NOT NULL,
	"saiu_em" timestamp with time zone,
	"oculto_por_denuncia" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redacao" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tipo" text NOT NULL,
	"tema" text NOT NULL,
	"texto" text NOT NULL,
	"resultado" jsonb,
	"versao_rubrica" smallint DEFAULT 1 NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "redacao_tipo_ck" CHECK ("redacao"."tipo" in ('correcao', 'treino'))
);
--> statement-breakpoint
CREATE TABLE "simulado" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tipo" text NOT NULL,
	"area" text,
	"itens" jsonb NOT NULL,
	"respostas" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"iniciado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"concluido_em" timestamp with time zone,
	"resultado" jsonb,
	CONSTRAINT "simulado_tipo_ck" CHECK ("simulado"."tipo" in ('area', 'dia'))
);
--> statement-breakpoint
ALTER TABLE "caderno_item" ADD CONSTRAINT "caderno_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cronograma" ADD CONSTRAINT "cronograma_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking_grupo" ADD CONSTRAINT "ranking_grupo_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking_participante" ADD CONSTRAINT "ranking_participante_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redacao" ADD CONSTRAINT "redacao_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulado" ADD CONSTRAINT "simulado_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ranking_grupo_idx" ON "ranking_grupo" USING btree ("semana","grupo");--> statement-breakpoint
CREATE UNIQUE INDEX "ranking_apelido_uq" ON "ranking_participante" USING btree (lower("apelido"));--> statement-breakpoint
CREATE INDEX "redacao_user_idx" ON "redacao" USING btree ("user_id","criada_em");--> statement-breakpoint
CREATE INDEX "simulado_user_idx" ON "simulado" USING btree ("user_id");