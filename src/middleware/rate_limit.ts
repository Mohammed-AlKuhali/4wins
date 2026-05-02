import type { MiddlewareHandler, Context } from "hono";
import { sql as drizzleSql } from "drizzle-orm";
import { db } from "../lib/db.js";
import { rateLimits } from "../db/schema/rate_limits.js";
import { throwApiError } from "../lib/errors.js";

interface WindowEntry {
  count: number;
  expires: number;
}

const memoryStore = new Map<string, WindowEntry>();

function getWindowKey(prefix: string, id: string): { key: string; windowAt: Date } {
  const now = new Date();
  const windowAt = new Date(now);
  windowAt.setSeconds(0, 0);
  return { key: `${prefix}:${id}`, windowAt };
}

async function checkLimit(key: string, windowAt: Date, limit: number): Promise<boolean> {
  const windowMs = windowAt.getTime();
  const existing = memoryStore.get(key);

  if (existing && existing.expires >= windowMs) {
    if (existing.count >= limit) return false;
    existing.count++;
  } else {
    memoryStore.set(key, { count: 1, expires: windowMs });
  }

  setImmediate(async () => {
    try {
      await db.execute(drizzleSql`
        INSERT INTO rate_limits (key, window_at, count)
        VALUES (${key}, ${windowAt.toISOString()}, 1)
        ON CONFLICT (key, window_at)
        DO UPDATE SET count = rate_limits.count + 1
      `);
    } catch {
      // best-effort DB sync
    }
  });

  const entry = memoryStore.get(key)!;
  return entry.count <= limit;
}

function makeRateLimiter(
  prefix: string,
  limit: number,
  keyFn: (c: Context) => string
): MiddlewareHandler {
  return async (c, next) => {
    const id = keyFn(c);
    const { key, windowAt } = getWindowKey(prefix, id);
    const allowed = await checkLimit(key, windowAt, limit);

    if (!allowed) {
      c.header("Retry-After", "60");
      throwApiError("RATE_LIMITED", "Too many requests. Try again in a minute.", 429);
    }

    await next();
  };
}

export const authLimiter = makeRateLimiter(
  "auth:ip",
  10,
  (c) => c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "unknown"
);

export const writeLimiter = makeRateLimiter(
  "write:user",
  60,
  (c) => (c.get("userId") as string | undefined) ?? "anon"
);

export const transcribeLimiter = makeRateLimiter(
  "transcribe:user",
  30,
  (c) => (c.get("userId") as string | undefined) ?? "anon"
);
