import { eq, and, lt } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { users } from "../../db/schema/users.js";
import { iapReceipts } from "../../db/schema/iap_receipts.js";
import { auditEvents } from "../../db/schema/audit_events.js";
import { hasRun, markRun } from "../lib/idempotency.js";
import { getUserLocalTime } from "../lib/user_local_now.js";
import type { User } from "../../db/schema/users.js";

export async function verifyPaidSubscriptionsJob(user: User, now: Date): Promise<void> {
  if (user.subscriptionStatus !== "paid") return;
  const local = getUserLocalTime(user.timezone ?? "UTC", now);
  if (await hasRun("verify_paid_subscriptions", user.id, local.date)) return;

  try {
    // 7-day grace period
    const graceCutoff = new Date(now.getTime() + 7 * 86400000);
    const expired = await db.query.iapReceipts.findFirst({
      where: and(eq(iapReceipts.userId, user.id), eq(iapReceipts.status, "active"), lt(iapReceipts.expiresAt, graceCutoff)),
    });

    if (expired) {
      await db.update(iapReceipts).set({ status: "expired" }).where(eq(iapReceipts.id, expired.id));
      await db.update(users).set({ subscriptionStatus: "expired" }).where(eq(users.id, user.id));
      await db.insert(auditEvents).values({
        id: crypto.randomUUID(),
        userId: user.id,
        event: "subscription_expired",
        metadata: { receipt_id: expired.id },
      });
    }
    await markRun("verify_paid_subscriptions", user.id, local.date, true);
  } catch (err) {
    await markRun("verify_paid_subscriptions", user.id, local.date, false, String(err));
    throw err;
  }
}
