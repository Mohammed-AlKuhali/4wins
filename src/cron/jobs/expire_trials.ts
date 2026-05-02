import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { users } from "../../db/schema/users.js";
import { auditEvents } from "../../db/schema/audit_events.js";
import { hasRun, markRun } from "../lib/idempotency.js";
import { getUserLocalTime } from "../lib/user_local_now.js";
import type { User } from "../../db/schema/users.js";

export async function expireTrialsJob(user: User, now: Date): Promise<void> {
  if (user.subscriptionStatus !== "trial" || !user.trialEndsAt) return;
  if (user.trialEndsAt.getTime() > now.getTime()) return;

  const local = getUserLocalTime(user.timezone ?? "UTC", now);
  if (await hasRun("expire_trials", user.id, local.date)) return;

  try {
    await db.update(users).set({ subscriptionStatus: "free" }).where(eq(users.id, user.id));
    await db.insert(auditEvents).values({
      id: crypto.randomUUID(),
      userId: user.id,
      event: "trial_expired",
      metadata: {},
    });
    await markRun("expire_trials", user.id, local.date, true);
  } catch (err) {
    await markRun("expire_trials", user.id, local.date, false, String(err));
    throw err;
  }
}
