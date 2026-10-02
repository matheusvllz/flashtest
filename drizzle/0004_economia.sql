CREATE TABLE "combo_dia" (
	"user_id" text NOT NULL,
	"local_date" text NOT NULL,
	"atual" integer DEFAULT 0 NOT NULL,
	"maximo" integer DEFAULT 0 NOT NULL,
	"ultima_resposta_em" timestamp with time zone,
	CONSTRAINT "combo_dia_user_id_local_date_pk" PRIMARY KEY("user_id","local_date"),
	CONSTRAINT "combo_dia_ck" CHECK ("combo_dia"."atual" >= 0 and "combo_dia"."maximo" >= "combo_dia"."atual")
);
--> statement-breakpoint
CREATE TABLE "cosmetico_equipado" (
	"user_id" text PRIMARY KEY NOT NULL,
	"roupa" text,
	"tema" text,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventario" (
	"user_id" text NOT NULL,
	"item_id" text NOT NULL,
	"obtido_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventario_user_id_item_id_pk" PRIMARY KEY("user_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "marco_ofensiva" (
	"user_id" text NOT NULL,
	"dias" integer NOT NULL,
	"alcancado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"visto_em" timestamp with time zone,
	CONSTRAINT "marco_ofensiva_user_id_dias_pk" PRIMARY KEY("user_id","dias")
);
--> statement-breakpoint
CREATE TABLE "meta_ofensiva" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"alvo" integer NOT NULL,
	"sequencia_inicial" integer NOT NULL,
	"inicio_sequencia" text,
	"inicio" text NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"concluida_em" timestamp with time zone,
	"encerrada_em" timestamp with time zone,
	CONSTRAINT "meta_ofensiva_alvo_ck" CHECK ("meta_ofensiva"."alvo" in (7, 14, 30, 50))
);
--> statement-breakpoint
CREATE TABLE "perola_movimento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"chave" text NOT NULL,
	"quantidade" integer NOT NULL,
	"motivo" text NOT NULL,
	"ref" text,
	"local_date" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "perola_movimento_qtd_ck" CHECK ("perola_movimento"."quantidade" <> 0),
	CONSTRAINT "perola_movimento_motivo_ck" CHECK ("perola_movimento"."motivo" in ('bloco', 'perfeita', 'missao', 'missoes-completas', 'meta-ofensiva', 'marco', 'conquista', 'desafio', 'nivel', 'simulado', 'compra'))
);
--> statement-breakpoint
ALTER TABLE "protetor_credito" DROP CONSTRAINT "protetor_credito_motivo_ck";--> statement-breakpoint
ALTER TABLE "attempt" ADD COLUMN "tentativa" text DEFAULT 'primeira' NOT NULL;--> statement-breakpoint
ALTER TABLE "attempt" ADD COLUMN "assistida" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "attempt" ADD COLUMN "combo" integer;--> statement-breakpoint
ALTER TABLE "attempt" ADD COLUMN "pontuada" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "vidas_dia" ADD COLUMN "ganhas_combo" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vidas_dia" ADD COLUMN "ganhas_recarga" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vidas_dia" ADD COLUMN "recargas" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "combo_dia" ADD CONSTRAINT "combo_dia_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cosmetico_equipado" ADD CONSTRAINT "cosmetico_equipado_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marco_ofensiva" ADD CONSTRAINT "marco_ofensiva_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ofensiva" ADD CONSTRAINT "meta_ofensiva_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perola_movimento" ADD CONSTRAINT "perola_movimento_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meta_ofensiva_user_idx" ON "meta_ofensiva" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "perola_movimento_chave_uq" ON "perola_movimento" USING btree ("user_id","chave");--> statement-breakpoint
CREATE INDEX "perola_movimento_user_idx" ON "perola_movimento" USING btree ("user_id","criado_em");--> statement-breakpoint
ALTER TABLE "protetor_credito" ADD CONSTRAINT "protetor_credito_motivo_ck" CHECK ("protetor_credito"."motivo" in ('compra', 'estorno', 'perolas'));--> statement-breakpoint
ALTER TABLE "vidas_dia" ADD CONSTRAINT "vidas_dia_combo_ck" CHECK ("vidas_dia"."ganhas_combo" between 0 and 2);--> statement-breakpoint
ALTER TABLE "vidas_dia" ADD CONSTRAINT "vidas_dia_recarga_ck" CHECK ("vidas_dia"."ganhas_recarga" between 0 and 5 and "vidas_dia"."recargas" between 0 and 1);