import { pgTable, bigserial, text, timestamp, integer, unique, index } from "drizzle-orm/pg-core";

export const rateLimits = pgTable(
  "rate_limits",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    key: text("key").notNull(),
    windowAt: timestamp("window_at", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(1),
  },
  (table) => [
    unique("rate_limits_key_window_unique").on(table.key, table.windowAt),
    index("rate_limits_key_window_idx").on(table.key, table.windowAt),
  ]
);
