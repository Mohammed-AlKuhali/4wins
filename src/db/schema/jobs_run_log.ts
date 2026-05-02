import { pgTable, bigserial, text, date, timestamp, boolean, index, unique } from "drizzle-orm/pg-core";

export const jobsRunLog = pgTable(
  "jobs_run_log",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    jobName: text("job_name").notNull(),
    userId: text("user_id"),
    runForDate: date("run_for_date").notNull(),
    ranAt: timestamp("ran_at", { withTimezone: true }).notNull().defaultNow(),
    succeeded: boolean("succeeded").notNull().default(true),
    error: text("error"),
  },
  (table) => [
    unique("jobs_run_log_unique").on(table.jobName, table.userId, table.runForDate),
    index("jobs_run_log_name_ran_idx").on(table.jobName, table.ranAt),
  ]
);
