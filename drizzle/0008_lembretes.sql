CREATE TABLE "push_assinatura" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"janela" text NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"ultimo_envio_dia" text,
	"sem_estudo_seguidos" smallint DEFAULT 0 NOT NULL,
	"pausada_em" timestamp with time zone,
	"falhas" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "push_assinatura_janela_ck" CHECK ("push_assinatura"."janela" in ('manha', 'tarde', 'fim-de-tarde', 'noite')),
	CONSTRAINT "push_assinatura_contagens_ck" CHECK ("push_assinatura"."sem_estudo_seguidos" >= 0 and "push_assinatura"."falhas" >= 0)
);
--> statement-breakpoint
ALTER TABLE "push_assinatura" ADD CONSTRAINT "push_assinatura_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "push_assinatura_endpoint_uq" ON "push_assinatura" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "push_assinatura_user_idx" ON "push_assinatura" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "push_assinatura_janela_idx" ON "push_assinatura" USING btree ("janela","id");