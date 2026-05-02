-- T-003: auth_sessions table + apple_sub/google_sub on users

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "apple_sub" text UNIQUE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_sub" text UNIQUE;

CREATE TABLE IF NOT EXISTS "auth_sessions" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "refresh_token_hash" text NOT NULL UNIQUE,
  "expires_at" timestamptz NOT NULL,
  "revoked_at" timestamptz,
  "device_label" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "last_used_at" timestamptz
);

CREATE INDEX IF NOT EXISTS "auth_sessions_user_id_idx" ON "auth_sessions" ("user_id");
