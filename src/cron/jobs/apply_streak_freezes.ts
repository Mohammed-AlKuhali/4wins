import { applyDailyRollover } from "../../domain/streaks/daily_rollover.js";
import { hasRun, markRun } from "../lib/idempotency.js";
import { getUserLocalTime } from "../lib/user_local_now.js";
import { shouldRunAt4am } from "../lib/should_run_at.js";
import type { User } from "../../db/schema/users.js";

export async function applyStreakFreezesJob(user: User, now: Date): Promise<void> {
  const local = getUserLocalTime(user.timezone ?? "UTC", now);
  if (!shouldRunAt4am(local)) return;

  if (await hasRun("apply_streak_freezes", user.id, local.date)) return;

  try {
    await applyDailyRollover(user.id);
    await markRun("apply_streak_freezes", user.id, local.date, true);
  } catch (err) {
    await markRun("apply_streak_freezes", user.id, local.date, false, String(err));
    throw err;
  }
}
