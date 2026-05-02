import { pgTable, text, timestamp, boolean, date, unique, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";

export const days = pgTable(
  "days",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    isRestDay: boolean("is_rest_day").notNull().default(false),
    pillarsLogged: text("pillars_logged")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
  },
  (table) => [
    unique("days_user_id_date_unique").on(table.userId, table.date),
    index("days_user_id_date_idx").on(table.userId, table.date),
  ]
);

export type Day = typeof days.$inferSelect;
export type NewDay = typeof days.$inferInsert;
