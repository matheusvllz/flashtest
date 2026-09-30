CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"birth_year" integer,
	"terms_version" text,
	"privacy_version" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_budget" (
	"day" text PRIMARY KEY NOT NULL,
	"cost_micros" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"user_id" text NOT NULL,
	"day" text NOT NULL,
	"messages" integer DEFAULT 0 NOT NULL,
	"images" integer DEFAULT 0 NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cost_micros" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "ai_usage_user_id_day_pk" PRIMARY KEY("user_id","day")
);
--> statement-breakpoint
CREATE TABLE "attempt" (
	"user_id" text NOT NULL,
	"id" text NOT NULL,
	"item_id" text NOT NULL,
	"item_version" integer,
	"skill_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"role" text,
	"answer" text,
	"correct" boolean NOT NULL,
	"source" text NOT NULL,
	"duration_ms" integer,
	"answered_at" timestamp with time zone NOT NULL,
	"local_date" text NOT NULL,
	"activity_attempt_key" text,
	"origin" text DEFAULT 'live' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attempt_user_id_id_pk" PRIMARY KEY("user_id","id"),
	CONSTRAINT "attempt_origin_ck" CHECK ("attempt"."origin" in ('live', 'import'))
);
--> statement-breakpoint
CREATE TABLE "audit_event" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"type" text NOT NULL,
	"request_id" text,
	"ip_prefix" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "completion" (
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"kind" text NOT NULL,
	"score_pct" smallint,
	"completed_at" timestamp with time zone NOT NULL,
	"origin" text DEFAULT 'live' NOT NULL,
	CONSTRAINT "completion_user_id_key_pk" PRIMARY KEY("user_id","key")
);
--> statement-breakpoint
CREATE TABLE "consent" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"purpose" text NOT NULL,
	"granted_by" text NOT NULL,
	"guardian_email_hash" text,
	"granted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consent_granted_by_ck" CHECK ("consent"."granted_by" in ('titular', 'responsavel'))
);
--> statement-breakpoint
CREATE TABLE "data_import" (
	"user_id" text NOT NULL,
	"id" text NOT NULL,
	"device_id_hash" text NOT NULL,
	"status" text NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "data_import_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "learning_doc" (
	"user_id" text PRIMARY KEY NOT NULL,
	"rev" integer DEFAULT 0 NOT NULL,
	"schema_version" smallint NOT NULL,
	"doc" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_acceptance" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"document" text NOT NULL,
	"version" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legal_acceptance_doc_ck" CHECK ("legal_acceptance"."document" in ('termos', 'privacidade'))
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"plano" text DEFAULT 'gratis' NOT NULL,
	"first_name" text,
	"level" text,
	"residence_state" text,
	"target_course" text,
	"target_institution" text,
	"exam_targets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"study_prefs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"onboarding_version" smallint,
	"onboarded_at" timestamp with time zone,
	"timezone" text DEFAULT 'America/Sao_Paulo' NOT NULL,
	"tutor_desligado" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_plano_ck" CHECK ("profile"."plano" in ('gratis', 'pro')),
	CONSTRAINT "profile_uf_ck" CHECK ("profile"."residence_state" is null or "profile"."residence_state" ~ '^[A-Z]{2}$'),
	CONSTRAINT "profile_nome_ck" CHECK ("profile"."first_name" is null or char_length("profile"."first_name") <= 40)
);
--> statement-breakpoint
CREATE TABLE "study_day" (
	"user_id" text NOT NULL,
	"local_date" text NOT NULL,
	"blocks" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "study_day_user_id_local_date_pk" PRIMARY KEY("user_id","local_date")
);
--> statement-breakpoint
CREATE TABLE "xp_ledger" (
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"xp" smallint NOT NULL,
	"reason" text NOT NULL,
	"local_date" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "xp_ledger_user_id_key_pk" PRIMARY KEY("user_id","key"),
	CONSTRAINT "xp_ledger_xp_ck" CHECK ("xp_ledger"."xp" between 0 and 100)
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt" ADD CONSTRAINT "attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completion" ADD CONSTRAINT "completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent" ADD CONSTRAINT "consent_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_import" ADD CONSTRAINT "data_import_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_doc" ADD CONSTRAINT "learning_doc_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_acceptance" ADD CONSTRAINT "legal_acceptance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_day" ADD CONSTRAINT "study_day_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_ledger" ADD CONSTRAINT "xp_ledger_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "attempt_user_answered_idx" ON "attempt" USING btree ("user_id","answered_at");--> statement-breakpoint
CREATE INDEX "attempt_user_item_idx" ON "attempt" USING btree ("user_id","item_id");--> statement-breakpoint
CREATE INDEX "attempt_user_activity_idx" ON "attempt" USING btree ("user_id","activity_attempt_key");--> statement-breakpoint
CREATE INDEX "audit_event_created_idx" ON "audit_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_event_user_idx" ON "audit_event" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "consent_user_purpose_idx" ON "consent" USING btree ("user_id","purpose");--> statement-breakpoint
CREATE UNIQUE INDEX "legal_acceptance_uq" ON "legal_acceptance" USING btree ("user_id","document","version");--> statement-breakpoint
CREATE INDEX "xp_ledger_user_day_idx" ON "xp_ledger" USING btree ("user_id","local_date");