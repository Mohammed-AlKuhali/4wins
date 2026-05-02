import { eq, and, gte, count } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { pushTokens } from "../../db/schema/push_tokens.js";
import { auditEvents } from "../../db/schema/audit_events.js";
import { users } from "../../db/schema/users.js";
import { resolveTemplate, type TemplateName } from "./templates.js";
import { sendExpoPush } from "./expo_client.js";
import { todayInTz } from "../days/date_utils.js";
import { logger } from "../../lib/logger.js";

export async function sendPush(userId: string, template: TemplateName, payload: Record<string, unknown>): Promise<void> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return;

  const tz = user.timezone ?? "UTC";
  const prefs = (user.notificationPrefs ?? {}) as Record<string, unknown>;
  const maxPerDay = typeof prefs.max_per_day === "number" ? prefs.max_per_day : 1;
  const todayStr = todayInTz(tz);
  const dayStart = new Date(todayStr + "T00:00:00Z");

  // Check daily cap
  const [capRow] = await db
    .select({ count: count() })
    .from(auditEvents)
    .where(and(eq(auditEvents.userId, userId), eq(auditEvents.event, "push_sent"), gte(auditEvents.createdAt as any, dayStart)));

  if ((capRow?.count ?? 0) >= maxPerDay) {
    logger.info({ userId, template }, "Push cap reached");
    return;
  }

  // Check 4-hour de-dup
  const fourHoursAgo = new Date(Date.now() - 4 * 3600 * 1000);
  const [dedupRow] = await db
    .select({ count: count() })
    .from(auditEvents)
    .where(and(eq(auditEvents.userId, userId), eq(auditEvents.event, "push_sent"), gte(auditEvents.createdAt as any, fourHoursAgo)));

  if ((dedupRow?.count ?? 0) > 0) {
    logger.info({ userId, template }, "Push de-dup hit");
    return;
  }

  const tokens = await db.select().from(pushTokens).where(eq(pushTokens.userId, userId));
  if (tokens.length === 0) return;

  const { title, body, sound } = resolveTemplate(template, payload);

  const messages = tokens.map((t) => ({
    to: t.token,
    title,
    body,
    sound: sound ?? undefined,
  }));

  const BATCH = 100;
  for (let i = 0; i < messages.length; i += BATCH) {
    const batch = messages.slice(i, i + BATCH);
    try {
      const tickets = await sendExpoPush(batch);
      for (let j = 0; j < tickets.length; j++) {
        const ticket = tickets[j];
        if (ticket.details?.error === "DeviceNotRegistered") {
          await db.delete(pushTokens).where(eq(pushTokens.id, tokens[i + j].id));
        }
      }
    } catch (err) {
      logger.error({ err: String(err) }, "Expo push failed");
    }
  }

  await db.insert(auditEvents).values({
    id: crypto.randomUUID(),
    userId,
    event: "push_sent",
    metadata: { template, user_local_day: todayStr },
  });
}
