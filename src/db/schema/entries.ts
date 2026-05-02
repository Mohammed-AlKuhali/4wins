import { pgTable, text, timestamp, real, integer, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { days } from "./days.js";

export const entries = pgTable(
  "entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dayId: text("day_id")
      .notNull()
      .references(() => days.id, { onDelete: "cascade" }),
    pillar: text("pillar").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
    inputMethod: text("input_method").notNull(),
    rawText: text("raw_text"),
    aiTaggedPillar: text("ai_tagged_pillar"),
    aiConfidence: real("ai_confidence"),
    structuredData: jsonb("structured_data"),
    durationSeconds: integer("duration_seconds"),
  },
  (table) => [
    index("entries_user_id_captured_at_idx").on(table.userId, table.capturedAt),
    index("entries_day_id_idx").on(table.dayId),
  ]
);

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
