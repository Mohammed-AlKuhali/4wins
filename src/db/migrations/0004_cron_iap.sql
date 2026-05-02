-- T-010: jobs_run_log + push_queue
-- T-012: iap_receipts

CREATE TABLE IF NOT EXISTS "jobs_run_log" (
  "id" bigserial PRIMARY KEY,
  "job_name" text NOT NULL,
  "user_id" text,
  "run_for_date" date NOT NULL,
  "ran_at" timestamptz NOT NULL DEFAULT now(),
  "succeeded" boolean NOT NULL DEFAULT true,
  "error" text,
  UNIQUE ("job_name", "user_id", "run_for_date")
);

CREATE INDEX IF NOT EXISTS "jobs_run_log_name_ran_idx" ON "jobs_run_log" ("job_name", "ran_at" DESC);

CREATE TABLE IF NOT EXISTS "push_queue" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "template" text NOT NULL,
  "payload" jsonb NOT NULL DEFAULT '{}',
  "scheduled_for" timestamptz NOT NULL,
  "sent_at" timestamptz,
  "attempts" int NOT NULL DEFAULT 0,
  "last_error" text
);

CREATE INDEX IF NOT EXISTS "push_queue_scheduled_idx" ON "push_queue" ("sent_at", "scheduled_for");

CREATE TABLE IF NOT EXISTS "iap_receipts" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "platform" text NOT NULL CHECK ("platform" IN ('ios','android')),
  "product_id" text NOT NULL,
  "original_receipt" text NOT NULL,
  "purchase_token" text,
  "transaction_id" text,
  "expires_at" timestamptz,
  "last_verified_at" timestamptz,
  "status" text NOT NULL DEFAULT 'active' CHECK ("status" IN ('active','expired','refunded','revoked'))
);

CREATE INDEX IF NOT EXISTS "iap_receipts_user_status_idx" ON "iap_receipts" ("user_id", "status");
