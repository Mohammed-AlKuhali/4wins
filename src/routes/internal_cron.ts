import { Hono } from "hono";
import { runCron } from "../cron/runner.js";
import { throwApiError } from "../lib/errors.js";
import { env } from "../lib/env.js";
import { logger } from "../lib/logger.js";

const internalCron = new Hono();

internalCron.post("/cron", async (c) => {
  const secret = c.req.header("X-Cron-Secret");
  if (!env.CRON_SECRET || secret !== env.CRON_SECRET) {
    throwApiError("UNAUTHORIZED", "Invalid cron secret", 401);
  }

  logger.info("Cron tick started");
  const result = await runCron();
  logger.info(result, "Cron tick complete");

  return c.json({ ok: true, ...result });
});

export default internalCron;
