import { isNull, lte, eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { pushQueue } from "../../db/schema/push_queue.js";
import { sendPush } from "./send.js";
import { logger } from "../../lib/logger.js";
import type { TemplateName } from "./templates.js";

export async function drainPushQueue(): Promise<number> {
  const now = new Date();
  const rows = await db
    .select()
    .from(pushQueue)
    .where(isNull(pushQueue.sentAt) && lte(pushQueue.scheduledFor, now))
    .limit(1000);

  let sent = 0;
  for (const row of rows) {
    try {
      await sendPush(row.userId, row.template as TemplateName, (row.payload ?? {}) as Record<string, unknown>);
      await db.update(pushQueue).set({ sentAt: new Date() }).where(eq(pushQueue.id, row.id));
      sent++;
    } catch (err) {
      logger.error({ err: String(err), queueId: row.id }, "Push queue send failed");
      await db.update(pushQueue).set({ attempts: row.attempts + 1, lastError: String(err) }).where(eq(pushQueue.id, row.id));
    }
  }
  return sent;
}
