import { pgTable, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const insights = pgTable(
  "insights",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
    type: text("type").notNull(),
    payload: jsonb("payload").notNull(),
    shownAt: timestamp("shown_at", { withTimezone: true }),
    isPaywalled: boolean("is_paywalled").notNull().default(false),
  },
  (table) => [
    index("insights_user_id_generated_at_idx").on(
      table.userId,
      table.generatedAt
    ),
  ]
);

export type Insight = typeof insights.$inferSelect;
export type NewInsight = typeof insights.$inferInsert;
