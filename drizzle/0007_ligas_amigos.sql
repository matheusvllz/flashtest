CREATE TABLE "amizade" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_a" text NOT NULL,
	"user_b" text NOT NULL,
	"estado" text NOT NULL,
	"pedida_por" text NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"aceita_em" timestamp with time zone,
	"encerrada_em" timestamp with time zone,
	CONSTRAINT "amizade_par_ck" CHECK ("amizade"."user_a" < "amizade"."user_b"),
	CONSTRAINT "amizade_estado_ck" CHECK ("amizade"."estado" in ('pedido', 'ativa', 'encerrada'))
);
--> statement-breakpoint
CREATE TABLE "bloqueio" (
	"user_id" text NOT NULL,
	"bloqueado_id" text NOT NULL,
	"ref" uuid DEFAULT gen_random_uuid() NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bloqueio_user_id_bloqueado_id_pk" PRIMARY KEY("user_id","bloqueado_id")
);
--> statement-breakpoint
CREATE TABLE "convite_amizade" (
	"codigo_hash" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expira_em" timestamp with time zone NOT NULL,
	"usado_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "denuncia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"autor_id" text NOT NULL,
	"alvo_id" text NOT NULL,
	"contexto" text NOT NULL,
	"motivo" text NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"resolvida_em" timestamp with time zone,
	CONSTRAINT "denuncia_contexto_ck" CHECK ("denuncia"."contexto" in ('liga', 'amigos')),
	CONSTRAINT "denuncia_motivo_ck" CHECK ("denuncia"."motivo" in ('apelido', 'menor', 'outro'))
);
--> statement-breakpoint
CREATE TABLE "liga_fechamento" (
	"chave" text PRIMARY KEY NOT NULL,
	"fechada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"participantes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liga_resultado" (
	"semana" text NOT NULL,
	"user_id" text NOT NULL,
	"divisao" smallint NOT NULL,
	"posicao" smallint,
	"pontos" integer NOT NULL,
	"movimento" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "liga_resultado_semana_user_id_pk" PRIMARY KEY("semana","user_id"),
	CONSTRAINT "liga_resultado_movimento_ck" CHECK ("liga_resultado"."movimento" in ('sobe', 'fica', 'desce')),
	CONSTRAINT "liga_resultado_divisao_ck" CHECK ("liga_resultado"."divisao" between 1 and 5)
);
--> statement-breakpoint
ALTER TABLE "ranking_grupo" ADD COLUMN "divisao" smallint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "ranking_participante" ADD COLUMN "divisao" smallint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "ranking_participante" ADD COLUMN "pausado" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ranking_participante" ADD COLUMN "social_suspenso_em" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "amizade" ADD CONSTRAINT "amizade_user_a_user_id_fk" FOREIGN KEY ("user_a") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "amizade" ADD CONSTRAINT "amizade_user_b_user_id_fk" FOREIGN KEY ("user_b") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "amizade" ADD CONSTRAINT "amizade_pedida_por_user_id_fk" FOREIGN KEY ("pedida_por") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bloqueio" ADD CONSTRAINT "bloqueio_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bloqueio" ADD CONSTRAINT "bloqueio_bloqueado_id_user_id_fk" FOREIGN KEY ("bloqueado_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convite_amizade" ADD CONSTRAINT "convite_amizade_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "denuncia" ADD CONSTRAINT "denuncia_autor_id_user_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "denuncia" ADD CONSTRAINT "denuncia_alvo_id_user_id_fk" FOREIGN KEY ("alvo_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liga_resultado" ADD CONSTRAINT "liga_resultado_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "amizade_par_uq" ON "amizade" USING btree ("user_a","user_b");--> statement-breakpoint
CREATE INDEX "amizade_user_b_idx" ON "amizade" USING btree ("user_b");--> statement-breakpoint
CREATE UNIQUE INDEX "bloqueio_ref_uq" ON "bloqueio" USING btree ("ref");--> statement-breakpoint
CREATE INDEX "bloqueio_alvo_idx" ON "bloqueio" USING btree ("bloqueado_id");--> statement-breakpoint
CREATE INDEX "convite_amizade_user_idx" ON "convite_amizade" USING btree ("user_id","criado_em");--> statement-breakpoint
CREATE INDEX "denuncia_alvo_idx" ON "denuncia" USING btree ("alvo_id");--> statement-breakpoint
CREATE INDEX "denuncia_autor_idx" ON "denuncia" USING btree ("autor_id","criada_em");--> statement-breakpoint
CREATE INDEX "liga_resultado_user_idx" ON "liga_resultado" USING btree ("user_id","semana");--> statement-breakpoint
ALTER TABLE "ranking_participante" ADD CONSTRAINT "ranking_divisao_ck" CHECK ("ranking_participante"."divisao" between 1 and 5);