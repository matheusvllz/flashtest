CREATE TABLE "questao_reporte" (
	"user_id" text NOT NULL,
	"item_id" text NOT NULL,
	"motivo" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questao_reporte_user_id_item_id_motivo_pk" PRIMARY KEY("user_id","item_id","motivo"),
	CONSTRAINT "questao_reporte_motivo_ck" CHECK ("questao_reporte"."motivo" in ('texto', 'imagem', 'gabarito', 'outro'))
);
--> statement-breakpoint
CREATE TABLE "questao_retirada" (
	"item_id" text PRIMARY KEY NOT NULL,
	"motivo" text NOT NULL,
	"retirada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "simulado" DROP CONSTRAINT "simulado_tipo_ck";--> statement-breakpoint
ALTER TABLE "simulado" ADD COLUMN "rotulo" text;--> statement-breakpoint
ALTER TABLE "simulado" ADD COLUMN "ano" integer;--> statement-breakpoint
ALTER TABLE "simulado" ADD COLUMN "cronometro" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "simulado" ADD COLUMN "tempo_ms" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "simulado" ADD COLUMN "marcadas" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "simulado" ADD COLUMN "ultima_atividade_em" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "questao_reporte" ADD CONSTRAINT "questao_reporte_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulado" ADD CONSTRAINT "simulado_tipo_ck" CHECK ("simulado"."tipo" in ('area', 'dia', 'prova', 'nivel', 'mini'));