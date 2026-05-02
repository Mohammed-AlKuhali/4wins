import { eq, and, gt } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "./db.js";
import { idempotencyKeys } from "../db/schema/idempotency_keys.js";

interface CacheEntry {
  response: unknown;
  expiresAt: number;
}
const memCache = new Map<string, CacheEntry>();

export async function getIdempotentResponse(
  key: string,
  userId: string
): Promise<unknown | null> {
  const cacheKey = `${userId}:${key}`;
  const now = Date.now();

  const mem = memCache.get(cacheKey);
  if (mem && mem.expiresAt > now) return mem.response;

  const row = await db.query.idempotencyKeys.findFirst({
    where: and(
      eq(idempotencyKeys.key, key),
      eq(idempotencyKeys.userId, userId),
      gt(idempotencyKeys.expiresAt, new Date())
    ),
  });

  if (row) {
    memCache.set(cacheKey, { response: row.responseJson, expiresAt: row.expiresAt.getTime() });
    return row.responseJson;
  }
  return null;
}

export async function storeIdempotentResponse(
  key: string,
  userId: string,
  response: unknown
) {
  const expiresAt = new Date(Date.now() + 60_000);
  const cacheKey = `${userId}:${key}`;
  memCache.set(cacheKey, { response, expiresAt: expiresAt.getTime() });

  await db.execute(sql`
    INSERT INTO idempotency_keys (key, user_id, response_json, expires_at)
    VALUES (${key}, ${userId}, ${JSON.stringify(response)}::jsonb, ${expiresAt.toISOString()})
    ON CONFLICT (key, user_id) DO NOTHING
  `);
}
