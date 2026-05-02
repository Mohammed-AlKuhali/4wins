import { pgTable, text, timestamp, jsonb, time } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  tradition: text("tradition").notNull(),
  customTraditionText: text("custom_tradition_text"),
  cueLabel: text("cue_label"),
  cueTimeOfDay: text("cue_time_of_day"),
  cueTimeLocal: time("cue_time_local"),
  identityStatement: text("identity_statement"),
  notificationPrefs: jsonb("notification_prefs")
    .notNull()
    .$defaultFn(() => ({ max_per_day: 1 })),
  timezone: text("timezone").notNull(),
  subscriptionStatus: text("subscription_status").notNull().default("free"),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  paidUntil: timestamp("paid_until", { withTimezone: true }),
  locale: text("locale").notNull().default("en"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  appleSub: text("apple_sub").unique(),
  googleSub: text("google_sub").unique(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
