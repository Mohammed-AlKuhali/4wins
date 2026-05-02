import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { days } from "./days.js";
import { entries } from "./entries.js";
import { streaks } from "./streaks.js";
import { weeklySummaries } from "./weekly_summaries.js";
import { insights } from "./insights.js";
import { pushTokens } from "./push_tokens.js";
import { auditEvents } from "./audit_events.js";
import { authSessions } from "./auth_sessions.js";

export const usersRelations = relations(users, ({ one, many }) => ({
  streaks: one(streaks, { fields: [users.id], references: [streaks.userId] }),
  days: many(days),
  entries: many(entries),
  weeklySummaries: many(weeklySummaries),
  insights: many(insights),
  pushTokens: many(pushTokens),
  auditEvents: many(auditEvents),
  authSessions: many(authSessions),
}));

export const daysRelations = relations(days, ({ one, many }) => ({
  user: one(users, { fields: [days.userId], references: [users.id] }),
  entries: many(entries),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
  user: one(users, { fields: [entries.userId], references: [users.id] }),
  day: one(days, { fields: [entries.dayId], references: [days.id] }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, { fields: [streaks.userId], references: [users.id] }),
}));

export const weeklySummariesRelations = relations(weeklySummaries, ({ one }) => ({
  user: one(users, { fields: [weeklySummaries.userId], references: [users.id] }),
}));

export const insightsRelations = relations(insights, ({ one }) => ({
  user: one(users, { fields: [insights.userId], references: [users.id] }),
}));

export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  user: one(users, { fields: [pushTokens.userId], references: [users.id] }),
}));

export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
  user: one(users, { fields: [auditEvents.userId], references: [users.id] }),
}));

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(users, { fields: [authSessions.userId], references: [users.id] }),
}));
