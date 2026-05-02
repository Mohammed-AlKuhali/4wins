import { Hono } from 'hono';
import { z } from 'zod';
import { requireAuth } from '../middleware/require_auth.js';
import { writeLimiter } from '../middleware/rate_limit.js';
import { appendAuditEvent } from '../domain/audit/append.js';
import type { AppEnv } from '../lib/app_env.js';

const ALLOWED_KEYS = new Set([
  'screen', 'locale', 'mode', 'pillar', 'input_method',
  'time_ms', 'action', 'banner', 'screen_from', 'screen_to',
  'attempt_count', 'error_code',
]);

function hasBannedKey(metadata: Record<string, unknown>): boolean {
  for (const key of Object.keys(metadata)) {
    if (!ALLOWED_KEYS.has(key)) return true;
  }
  return false;
}

const auditBodySchema = z.object({
  event_type: z.string().min(1).max(64),
  metadata: z.record(z.union([z.string(), z.number()])).optional().default({}),
});

export const auditRouter = new Hono<AppEnv>();

auditRouter.post('/', requireAuth, writeLimiter, async (c) => {
  const userId = c.get('userId') as string;
  const raw = await c.req.json().catch(() => null);
  if (!raw) return c.json({ error: 'invalid JSON' }, 400);

  const parsed = auditBodySchema.safeParse(raw);
  if (!parsed.success) return c.json({ error: 'invalid body' }, 422);

  const { event_type, metadata } = parsed.data;

  if (hasBannedKey(metadata as Record<string, unknown>)) {
    return c.json({ error: 'metadata contains banned key' }, 422);
  }

  await appendAuditEvent(userId, event_type, metadata as Record<string, unknown>);
  return c.json({ ok: true }, 201);
});
