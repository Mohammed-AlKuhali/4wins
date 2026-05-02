import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { users } from "../../db/schema/users.js";
import { hasRun, markRun } from "../lib/idempotency.js";
import { getUserLocalTime } from "../lib/user_local_now.js";
import type { User } from "../../db/schema/users.js";

export async function sendTrialEndingBannerJob(user: User, now: Date): Promise<void> {
  if (user.subscriptionStatus !== "trial" || !user.trialEndsAt) return;

  const local = getUserLocalTime(user.timezone ?? "UTC", now);
  if (await hasRun("send_trial_ending_banner", user.id, local.date)) return;

  const msRemaining = user.trialEndsAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / 86400000);
  if (daysRemaining !== 3) return; // only fire on day 11 (3 days before 14-day trial ends)

  try {
    const prefs = (user.notificationPrefs ?? {}) as Record<string, unknown>;
    prefs.trial_ending_banner = true;
    prefs.trial_days_remaining = daysRemaining;
    await db.update(users).set({ notificationPrefs: prefs }).where(eq(users.id, user.id));
    await markRun("send_trial_ending_banner", user.id, local.date, true);
  } catch (err) {
    await markRun("send_trial_ending_banner", user.id, local.date, false, String(err));
    throw err;
  }
}
