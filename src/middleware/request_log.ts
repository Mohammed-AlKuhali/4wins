import type { MiddlewareHandler } from "hono";
import { logger } from "../lib/logger.js";

export const requestLog: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  const userId = c.get("userId") as string | undefined;

  logger.info({
    ts: new Date().toISOString(),
    method: c.req.method,
    path: new URL(c.req.url).pathname,
    status: c.res.status,
    duration_ms: duration,
    ...(userId ? { user_id: userId } : {}),
  });
};
