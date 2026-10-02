CREATE TABLE "pulo_tentativa" (
	"user_id" text NOT NULL,
	"capitulo_id" text NOT NULL,
	"local_date" text NOT NULL,
	"id" text NOT NULL,
	"subject_id" text NOT NULL,
	"itens" jsonb NOT NULL,
	"licoes" jsonb NOT NULL,
	"sem_questao" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"resultado" text,
	"acertos" smallint,
	"detalhe" jsonb,
	"iniciado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"concluido_em" timestamp with time zone,
	CONSTRAINT "pulo_tentativa_user_id_capitulo_id_local_date_pk" PRIMARY KEY("user_id","capitulo_id","local_date"),
	CONSTRAINT "pulo_tentativa_resultado_ck" CHECK ("pulo_tentativa"."resultado" is null or "pulo_tentativa"."resultado" in ('passou', 'nao-passou'))
);
--> statement-breakpoint
ALTER TABLE "pulo_tentativa" ADD CONSTRAINT "pulo_tentativa_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pulo_tentativa_id_uq" ON "pulo_tentativa" USING btree ("id");--> statement-breakpoint
CREATE INDEX "pulo_tentativa_user_dia_idx" ON "pulo_tentativa" USING btree ("user_id","local_date");