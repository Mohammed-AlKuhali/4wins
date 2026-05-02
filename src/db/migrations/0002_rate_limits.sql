-- T-004: rate_limits table

CREATE TABLE IF NOT EXISTS "rate_limits" (
  "id" bigserial PRIMARY KEY,
  "key" text NOT NULL,
  "window_at" timestamptz NOT NULL,
  "count" integer NOT NULL DEFAULT 1,
  UNIQUE ("key", "window_at")
);

CREATE INDEX IF NOT EXISTS "rate_limits_key_window_idx" ON "rate_limits" ("key", "window_at" DESC);
