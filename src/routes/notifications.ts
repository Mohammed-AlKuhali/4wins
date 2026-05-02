import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import { pushTokens } from "../db/schema/push_tokens.js";
import { requireAuth } from "../middleware/require_auth.js";
import { validate } from "../middleware/validate.js";
import type { AppEnv } from "../lib/app_env.js";

const notifs = new Hono<AppEnv>();
notifs.use("*", requireAuth);

const registerSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android"]),
});

notifs.post("/register", validate(registerSchema), async (c) => {
  const userId = c.get("userId") as string;
  const { token, platform } = c.get("validatedBody") as z.infer<typeof registerSchema>;

  // Move token to current user if it exists elsewhere
  const existing = await db.query.pushTokens.findFirst({ where: eq(pushTokens.token, token) });
  if (existing && existing.userId !== userId) {
    await db.delete(pushTokens).where(eq(pushTokens.id, existing.id));
  }

  if (!existing || existing.userId !== userId) {
    await db.insert(pushTokens).values({
      id: crypto.randomUUID(),
      userId,
      token,
      platform,
    }).onConflictDoNothing();
  }

  return c.json({ ok: true });
});

notifs.delete("/unregister", async (c) => {
  const userId = c.get("userId") as string;
  const body = await c.req.json() as { token?: string };
  if (!body?.token) {
    return c.json({ ok: false, error: "token required" }, 422);
  }
  await db.delete(pushTokens).where(and(eq(pushTokens.userId, userId), eq(pushTokens.token, body.token)));
  return c.json({ ok: true });
});

export default notifs;
