import { pgTable, text, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const idempotencyKeys = pgTable(
  "idempotency_keys",
  {
    key: text("key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    responseJson: jsonb("response_json").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [unique("idempotency_keys_key_user_unique").on(table.key, table.userId)]
);
