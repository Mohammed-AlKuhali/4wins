-- 4Wins initial schema migration
-- T-002

CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "tradition" text NOT NULL,
  "custom_tradition_text" text,
  "cue_label" text,
  "cue_time_of_day" text,
  "cue_time_local" time,
  "identity_statement" text,
  "notification_prefs" jsonb NOT NULL DEFAULT '{"max_per_day":1}',
  "timezone" text NOT NULL,
  "subscription_status" text NOT NULL DEFAULT 'free',
  "trial_ends_at" timestamptz,
  "paid_until" timestamptz,
  "locale" text NOT NULL DEFAULT 'en',
  "deleted_at" timestamptz,
  CONSTRAINT "users_tradition_check" CHECK (tradition IN ('christian','stoic','buddhist','secular','custom')),
  CONSTRAINT "users_cue_time_of_day_check" CHECK (cue_time_of_day IN ('morning','midday','evening','before_bed','custom')),
  CONSTRAINT "users_subscription_status_check" CHECK (subscription_status IN ('free','trial','paid','expired','canceled'))
);

CREATE TABLE IF NOT EXISTS "days" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "closed_at" timestamptz,
  "is_rest_day" boolean NOT NULL DEFAULT false,
  "pillars_logged" text[] NOT NULL DEFAULT '{}',
  UNIQUE ("user_id", "date"),
  CONSTRAINT "days_pillars_logged_check" CHECK (
    pillars_logged <@ ARRAY['mental','physical','spiritual','financial']::text[]
  )
);

CREATE INDEX IF NOT EXISTS "days_user_id_date_idx" ON "days" ("user_id", "date" DESC);

CREATE TABLE IF NOT EXISTS "entries" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "day_id" text NOT NULL REFERENCES "days"("id") ON DELETE CASCADE,
  "pillar" text NOT NULL,
  "captured_at" timestamptz NOT NULL DEFAULT now(),
  "input_method" text NOT NULL,
  "raw_text" text,
  "ai_tagged_pillar" text,
  "ai_confidence" real,
  "structured_data" jsonb,
  "duration_seconds" integer,
  CONSTRAINT "entries_pillar_check" CHECK (pillar IN ('mental','physical','spiritual','financial')),
  CONSTRAINT "entries_input_method_check" CHECK (input_method IN ('voice','type','lazy_path','healthkit_auto','health_connect_auto')),
  CONSTRAINT "entries_ai_tagged_pillar_check" CHECK (ai_tagged_pillar IN ('mental','physical','spiritual','financial'))
);

CREATE INDEX IF NOT EXISTS "entries_user_id_captured_at_idx" ON "entries" ("user_id", "captured_at" DESC);
CREATE INDEX IF NOT EXISTS "entries_day_id_idx" ON "entries" ("day_id");

CREATE TABLE IF NOT EXISTS "streaks" (
  "user_id" text PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "current_count" integer NOT NULL DEFAULT 0,
  "longest_count" integer NOT NULL DEFAULT 0,
  "last_complete_date" date,
  "freezes_remaining_this_month" integer NOT NULL DEFAULT 2,
  "freezes_used_total" integer NOT NULL DEFAULT 0,
  "month_year" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "weekly_summaries" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "iso_week" text NOT NULL,
  "days_complete" integer NOT NULL,
  "pillar_counts" jsonb NOT NULL,
  "generated_at" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("user_id", "iso_week")
);

CREATE TABLE IF NOT EXISTS "insights" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "generated_at" timestamptz NOT NULL DEFAULT now(),
  "type" text NOT NULL,
  "payload" jsonb NOT NULL,
  "shown_at" timestamptz,
  "is_paywalled" boolean NOT NULL DEFAULT false,
  CONSTRAINT "insights_type_check" CHECK (type IN ('cross_pillar_correlation','pillar_consistency','time_of_day_pattern','tradition_specific'))
);

CREATE INDEX IF NOT EXISTS "insights_user_id_generated_at_idx" ON "insights" ("user_id", "generated_at" DESC);

CREATE TABLE IF NOT EXISTS "push_tokens" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "platform" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "last_used" timestamptz,
  CONSTRAINT "push_tokens_platform_check" CHECK (platform IN ('ios','android'))
);

CREATE TABLE IF NOT EXISTS "audit_events" (
  "id" text PRIMARY KEY,
  "user_id" text REFERENCES "users"("id") ON DELETE SET NULL,
  "event" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "audit_events_user_id_created_at_idx" ON "audit_events" ("user_id", "created_at" DESC);
