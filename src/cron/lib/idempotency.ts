import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { jobsRunLog } from "../../db/schema/jobs_run_log.js";

export async function hasRun(jobName: string, userId: string | null, runForDate: string): Promise<boolean> {
  const conditions = [
    eq(jobsRunLog.jobName, jobName),
    eq(jobsRunLog.runForDate, runForDate),
  ];
  if (userId) conditions.push(eq(jobsRunLog.userId as any, userId));

  const row = await db.query.jobsRunLog.findFirst({ where: and(...conditions) });
  return !!row;
}

export async function markRun(
  jobName: string,
  userId: string | null,
  runForDate: string,
  succeeded: boolean,
  error?: string
): Promise<void> {
  await db.execute(sql`
    INSERT INTO jobs_run_log (job_name, user_id, run_for_date, succeeded, error)
    VALUES (${jobName}, ${userId}, ${runForDate}, ${succeeded}, ${error ?? null})
    ON CONFLICT (job_name, user_id, run_for_date) DO NOTHING
  `);
}
