import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { users } from "../../db/schema/users.js";
import { auditEvents } from "../../db/schema/audit_events.js";
import { throwApiError } from "../../lib/errors.js";

export async function startTrial(userId: string): Promise<void> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throwApiError("NOT_FOUND", "User not found", 404);

  if (user!.subscriptionStatus === "trial" || user!.subscriptionStatus === "paid") {
    throwApiError("CONFLICT", "Already on trial or paid plan", 409);
  }

  // If expired, enforce 180-day cooldown
  if ((user!.subscriptionStatus === "expired" || user!.subscriptionStatus === "canceled") && user!.trialEndsAt) {
    const daysSinceEnd = (Date.now() - user!.trialEndsAt.getTime()) / 86400000;
    if (daysSinceEnd < 180) {
      throwApiError("CONFLICT", "Trial cooldown period not elapsed (180 days)", 409);
    }
  }

  const trialEndsAt = new Date(Date.now() + 14 * 86400000);
  await db
    .update(users)
    .set({ subscriptionStatus: "trial", trialEndsAt })
    .where(eq(users.id, userId));

  await db.insert(auditEvents).values({
    id: crypto.randomUUID(),
    userId,
    event: "trial_started",
    metadata: { trial_ends_at: trialEndsAt.toISOString() },
  });
}
