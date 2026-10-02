CREATE TABLE "conquista" (
	"user_id" text NOT NULL,
	"conquista_id" text NOT NULL,
	"obtida_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conquista_user_id_conquista_id_pk" PRIMARY KEY("user_id","conquista_id")
);
--> statement-breakpoint
CREATE TABLE "desafio_mes" (
	"user_id" text NOT NULL,
	"mes" text NOT NULL,
	"progresso" integer DEFAULT 0 NOT NULL,
	"concluido_em" timestamp with time zone,
	CONSTRAINT "desafio_mes_user_id_mes_pk" PRIMARY KEY("user_id","mes")
);
--> statement-breakpoint
CREATE TABLE "missao_dia" (
	"user_id" text NOT NULL,
	"local_date" text NOT NULL,
	"missao_id" text NOT NULL,
	"ordem" integer NOT NULL,
	"alvo" integer NOT NULL,
	"progresso" integer DEFAULT 0 NOT NULL,
	"concluida_em" timestamp with time zone,
	CONSTRAINT "missao_dia_user_id_local_date_missao_id_pk" PRIMARY KEY("user_id","local_date","missao_id"),
	CONSTRAINT "missao_dia_ck" CHECK ("missao_dia"."alvo" > 0 and "missao_dia"."progresso" >= 0)
);
--> statement-breakpoint
ALTER TABLE "conquista" ADD CONSTRAINT "conquista_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "desafio_mes" ADD CONSTRAINT "desafio_mes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missao_dia" ADD CONSTRAINT "missao_dia_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;