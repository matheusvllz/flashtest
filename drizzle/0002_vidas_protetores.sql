CREATE TABLE "protetor_credito" (
	"user_id" text NOT NULL,
	"chave" text NOT NULL,
	"quantidade" integer NOT NULL,
	"motivo" text NOT NULL,
	"local_date" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "protetor_credito_user_id_chave_pk" PRIMARY KEY("user_id","chave"),
	CONSTRAINT "protetor_credito_motivo_ck" CHECK ("protetor_credito"."motivo" in ('compra', 'estorno'))
);
--> statement-breakpoint
CREATE TABLE "vidas_dia" (
	"user_id" text NOT NULL,
	"local_date" text NOT NULL,
	"perdidas" integer DEFAULT 0 NOT NULL,
	"ganhas_anuncio" integer DEFAULT 0 NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vidas_dia_user_id_local_date_pk" PRIMARY KEY("user_id","local_date"),
	CONSTRAINT "vidas_dia_anuncio_ck" CHECK ("vidas_dia"."ganhas_anuncio" between 0 and 1),
	CONSTRAINT "vidas_dia_perdidas_ck" CHECK ("vidas_dia"."perdidas" >= 0)
);
--> statement-breakpoint
ALTER TABLE "protetor_credito" ADD CONSTRAINT "protetor_credito_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vidas_dia" ADD CONSTRAINT "vidas_dia_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;