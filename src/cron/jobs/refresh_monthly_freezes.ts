import { refreshMonthlyFreezes } from "../../domain/streaks/monthly_refresh.js";
import { hasRun, markRun } from "../lib/idempotency.js";
import { getUserLocalTime } from "../lib/user_local_now.js";
import { shouldRunMonthly } from "../lib/should_run_at.js";
import type { User } from "../../db/schema/users.js";

export async function refreshMonthlyFreezesJob(user: User, now: Date): Promise<void> {
  const local = getUserLocalTime(user.timezone ?? "UTC", now);
  if (!shouldRunMonthly(local)) return;

  const logKey = `${local.monthYear}-01`;
  if (await hasRun("refresh_monthly_freezes", user.id, logKey)) return;

  try {
    await refreshMonthlyFreezes(user.id);
    await markRun("refresh_monthly_freezes", user.id, logKey, true);
  } catch (err) {
    await markRun("refresh_monthly_freezes", user.id, logKey, false, String(err));
    throw err;
  }
}
