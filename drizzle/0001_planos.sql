CREATE TABLE "ai_budget_pagos" (
	"day" text PRIMARY KEY NOT NULL,
	"cost_micros" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assinatura" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provedor" text NOT NULL,
	"origem" text NOT NULL,
	"id_externo" text,
	"produto" text NOT NULL,
	"plano" text NOT NULL,
	"estado" text NOT NULL,
	"inicio" timestamp with time zone,
	"valido_ate" timestamp with time zone,
	"cancelada_em" timestamp with time zone,
	"reembolsavel_ate" timestamp with time zone,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizada_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assinatura_provedor_ck" CHECK ("assinatura"."provedor" in ('asaas', 'apple', 'google', 'teste')),
	CONSTRAINT "assinatura_origem_ck" CHECK ("assinatura"."origem" in ('web', 'apple', 'google')),
	CONSTRAINT "assinatura_plano_ck" CHECK ("assinatura"."plano" in ('basic', 'pro')),
	CONSTRAINT "assinatura_estado_ck" CHECK ("assinatura"."estado" in ('pendente', 'ativa', 'atrasada', 'cancelada', 'reembolsada', 'expirada'))
);
--> statement-breakpoint
CREATE TABLE "cobranca" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provedor" text NOT NULL,
	"id_externo" text NOT NULL,
	"compra_id" text,
	"assinatura_id" text,
	"valor_centavos" integer NOT NULL,
	"metodo" text,
	"estado" text NOT NULL,
	"paga_em" timestamp with time zone,
	"reembolsada_em" timestamp with time zone,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compra" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"produto" text NOT NULL,
	"estado" text DEFAULT 'aberta' NOT NULL,
	"provedor" text NOT NULL,
	"checkout_id" text,
	"assinatura_id" text,
	"declarou_maioridade_em" timestamp with time zone NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"paga_em" timestamp with time zone,
	CONSTRAINT "compra_estado_ck" CHECK ("compra"."estado" in ('aberta', 'paga', 'expirada', 'cancelada', 'reembolsada'))
);
--> statement-breakpoint
CREATE TABLE "evento_pagamento" (
	"provedor" text NOT NULL,
	"id_evento" text NOT NULL,
	"tipo" text NOT NULL,
	"recebido_em" timestamp with time zone DEFAULT now() NOT NULL,
	"processado_em" timestamp with time zone,
	"resultado" text,
	CONSTRAINT "evento_pagamento_provedor_id_evento_pk" PRIMARY KEY("provedor","id_evento")
);
--> statement-breakpoint
ALTER TABLE "profile" DROP CONSTRAINT "profile_plano_ck";--> statement-breakpoint
ALTER TABLE "assinatura" ADD CONSTRAINT "assinatura_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cobranca" ADD CONSTRAINT "cobranca_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compra" ADD CONSTRAINT "compra_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assinatura_externo_uq" ON "assinatura" USING btree ("provedor","id_externo");--> statement-breakpoint
CREATE INDEX "assinatura_user_idx" ON "assinatura" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cobranca_externo_uq" ON "cobranca" USING btree ("provedor","id_externo");--> statement-breakpoint
CREATE INDEX "cobranca_user_idx" ON "cobranca" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "compra_user_idx" ON "compra" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "compra_checkout_uq" ON "compra" USING btree ("provedor","checkout_id");--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_plano_ck" CHECK ("profile"."plano" in ('gratis', 'basic', 'pro'));