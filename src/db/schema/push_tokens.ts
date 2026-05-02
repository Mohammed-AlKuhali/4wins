import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const pushTokens = pgTable(
  "push_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    platform: text("platform").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastUsed: timestamp("last_used", { withTimezone: true }),
  },
  (table) => [unique("push_tokens_token_unique").on(table.token)]
);

export type PushToken = typeof pushTokens.$inferSelect;
export type NewPushToken = typeof pushTokens.$inferInsert;
