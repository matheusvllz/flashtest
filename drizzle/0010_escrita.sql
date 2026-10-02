ALTER TABLE "redacao" DROP CONSTRAINT "redacao_tipo_ck";--> statement-breakpoint
ALTER TABLE "redacao" ADD COLUMN "tarefa_id" text;--> statement-breakpoint
ALTER TABLE "redacao" ADD COLUMN "avaliacao" text;--> statement-breakpoint
ALTER TABLE "redacao" ADD COLUMN "avaliada_em" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "redacao_tarefa_idx" ON "redacao" USING btree ("user_id","tarefa_id");--> statement-breakpoint
ALTER TABLE "redacao" ADD CONSTRAINT "redacao_tarefa_ck" CHECK (("redacao"."tipo" = 'tarefa') = ("redacao"."tarefa_id" is not null));--> statement-breakpoint
ALTER TABLE "redacao" ADD CONSTRAINT "redacao_avaliacao_ck" CHECK ("redacao"."avaliacao" is null or ("redacao"."tipo" = 'correcao' and "redacao"."avaliacao" in ('ajudou', 'estranha')));--> statement-breakpoint
ALTER TABLE "redacao" ADD CONSTRAINT "redacao_tipo_ck" CHECK ("redacao"."tipo" in ('correcao', 'treino', 'tarefa'));