-- T-006: idempotency_keys table

CREATE TABLE IF NOT EXISTS "idempotency_keys" (
  "key" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "response_json" jsonb NOT NULL,
  "expires_at" timestamptz NOT NULL,
  UNIQUE ("key", "user_id")
);
