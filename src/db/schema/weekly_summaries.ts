import { pgTable, text, integer, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const weeklySummaries = pgTable(
  "weekly_summaries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isoWeek: text("iso_week").notNull(),
    daysComplete: integer("days_complete").notNull(),
    pillarCounts: jsonb("pillar_counts").notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("weekly_summaries_user_id_iso_week_unique").on(
      table.userId,
      table.isoWeek
    ),
  ]
);

export type WeeklySummary = typeof weeklySummaries.$inferSelect;
export type NewWeeklySummary = typeof weeklySummaries.$inferInsert;
