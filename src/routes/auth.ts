import { Hono } from "hono";
import { z } from "zod";
import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "../lib/db.js";
import { authSessions } from "../db/schema/auth_sessions.js";
import { verifyAppleToken } from "../domain/auth/apple.js";
import { verifyGoogleToken } from "../domain/auth/google.js";
import { signAccessToken } from "../domain/auth/jwt.js";
import { generateRefreshToken, hashRefreshToken } from "../domain/auth/refresh.js";
import { upsertUser } from "../domain/auth/upsert_user.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/require_auth.js";
import { throwApiError } from "../lib/errors.js";
import { env } from "../lib/env.js";

const auth = new Hono();

const appleSchema = z.object({
  id_token: z.string().min(1),
  device_label: z.string().optional(),
});

const googleSchema = z.object({
  id_token: z.string().min(1),
  device_label: z.string().optional(),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

async function issueTokens(userId: string, deviceLabel?: string) {
  const accessToken = await signAccessToken(userId);
  const { raw, hash } = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  await db.insert(authSessions).values({
    id: crypto.randomUUID(),
    userId,
    refreshTokenHash: hash,
    expiresAt,
    deviceLabel: deviceLabel ?? null,
  });

  return { accessToken, refreshToken: raw };
}

auth.post("/apple", validate(appleSchema), async (c) => {
  const body = c.get("validatedBody") as z.infer<typeof appleSchema>;
  const bundleId = env.APPLE_BUNDLE_ID ?? "com.4wins.app";
  const payload = await verifyAppleToken(body.id_token, bundleId);
  const user = await upsertUser({ provider: "apple", sub: payload.sub, email: payload.email });
  const { accessToken, refreshToken } = await issueTokens(user.id, body.device_label);
  return c.json({ access_token: accessToken, refresh_token: refreshToken, user }, 200);
});

auth.post("/google", validate(googleSchema), async (c) => {
  const body = c.get("validatedBody") as z.infer<typeof googleSchema>;
  const clientIds = [
    env.GOOGLE_CLIENT_ID_IOS,
    env.GOOGLE_CLIENT_ID_ANDROID,
  ].filter(Boolean) as string[];
  if (clientIds.length === 0) throwApiError("AUTH_FAILED", "Authentication failed", 401);
  const payload = await verifyGoogleToken(body.id_token, clientIds);
  const user = await upsertUser({ provider: "google", sub: payload.sub, email: payload.email });
  const { accessToken, refreshToken } = await issueTokens(user.id, body.device_label);
  return c.json({ access_token: accessToken, refresh_token: refreshToken, user }, 200);
});

auth.post("/refresh", validate(refreshSchema), async (c) => {
  const body = c.get("validatedBody") as z.infer<typeof refreshSchema>;
  const hash = hashRefreshToken(body.refresh_token);
  const now = new Date();

  const session = await db.query.authSessions.findFirst({
    where: and(
      eq(authSessions.refreshTokenHash, hash),
      gt(authSessions.expiresAt, now),
      isNull(authSessions.revokedAt)
    ),
  });

  if (!session) throwApiError("AUTH_EXPIRED", "Refresh token invalid or expired", 401);

  await db
    .update(authSessions)
    .set({ revokedAt: now })
    .where(eq(authSessions.id, session!.id));

  const { accessToken, refreshToken } = await issueTokens(session!.userId, session!.deviceLabel ?? undefined);
  return c.json({ access_token: accessToken, refresh_token: refreshToken }, 200);
});

auth.delete("/session", requireAuth, async (c) => {
  const userId = c.get("userId") as string;
  const authHeader = c.req.header("Authorization") ?? "";
  const token = authHeader.slice(7);

  if (token) {
    try {
      const refreshToken = c.req.header("x-refresh-token");
      if (refreshToken) {
        const hash = hashRefreshToken(refreshToken);
        await db
          .update(authSessions)
          .set({ revokedAt: new Date() })
          .where(and(eq(authSessions.refreshTokenHash, hash), eq(authSessions.userId, userId)));
      }
    } catch {
      // best-effort
    }
  }

  return c.body(null, 204);
});

export default auth;
