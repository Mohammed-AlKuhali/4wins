import { eq, isNull } from "drizzle-orm";
import { db } from "../lib/db.js";
import { users } from "../db/schema/users.js";
import { logger } from "../lib/logger.js";
import { applyStreakFreezesJob } from "./jobs/apply_streak_freezes.js";
import { generateWeeklySummaryJob } from "./jobs/generate_weekly_summary.js";
import { sendMorningCuePushJob } from "./jobs/send_morning_cue_push.js";
import { sendEveningCuePushJob } from "./jobs/send_evening_cue_push.js";
import { generateDay30InsightsJob } from "./jobs/generate_day_30_insights.js";
import { refreshMonthlyFreezesJob } from "./jobs/refresh_monthly_freezes.js";
import { sendTrialEndingBannerJob } from "./jobs/send_trial_ending_banner.js";
import type { User } from "../db/schema/users.js";

type JobFn = (user: User, now: Date) => Promise<void>;
const JOBS: JobFn[] = [
  applyStreakFreezesJob,
  refreshMonthlyFreezesJob,
  generateWeeklySummaryJob,
  sendMorningCuePushJob,
  sendEveningCuePushJob,
  generateDay30InsightsJob,
  sendTrialEndingBannerJob,
];

const BATCH_SIZE = 100;
const USER_JOB_TIMEOUT_MS = 1500;
const RUNNER_TIMEOUT_MS = 4 * 60 * 1000;

async function runForUser(user: User, now: Date): Promise<void> {
  for (const job of JOBS) {
    try {
      await Promise.race([
        job(user, now),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), USER_JOB_TIMEOUT_MS)),
      ]);
    } catch (err) {
      logger.error({ userId: user.id, job: job.name, err: String(err) }, "Cron job failed");
    }
  }
}

export async function runCron(): Promise<{ processed: number; duration_ms: number }> {
  const start = Date.now();
  const now = new Date();
  let processed = 0;
  let offset = 0;

  const globalTimeout = setTimeout(() => {
    logger.warn("Cron runner hit 4-minute hard timeout");
  }, RUNNER_TIMEOUT_MS);

  try {
    while (true) {
      const batch = await db
        .select()
        .from(users)
        .where(isNull(users.deletedAt))
        .limit(BATCH_SIZE)
        .offset(offset);

      if (batch.length === 0) break;

      await Promise.allSettled(batch.map((user) => runForUser(user, now)));
      processed += batch.length;
      offset += BATCH_SIZE;

      if (Date.now() - start > RUNNER_TIMEOUT_MS - 5000) break;
    }
  } finally {
    clearTimeout(globalTimeout);
  }

  return { processed, duration_ms: Date.now() - start };
}
