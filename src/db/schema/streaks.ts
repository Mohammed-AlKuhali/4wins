import { pgTable, text, integer, date } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const streaks = pgTable("streaks", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currentCount: integer("current_count").notNull().default(0),
  longestCount: integer("longest_count").notNull().default(0),
  lastCompleteDate: date("last_complete_date"),
  freezesRemainingThisMonth: integer("freezes_remaining_this_month")
    .notNull()
    .default(2),
  freezesUsedTotal: integer("freezes_used_total").notNull().default(0),
  monthYear: text("month_year").notNull(),
});

export type Streak = typeof streaks.$inferSelect;
export type NewStreak = typeof streaks.$inferInsert;
