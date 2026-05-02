import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { users } from "../db/schema/users.js";
import { requireAuth } from "../middleware/require_auth.js";
import { validate } from "../middleware/validate.js";
import { startTrial } from "../domain/subscription/start_trial.js";
import { redeemApple } from "../domain/subscription/redeem_apple.js";
import { redeemGoogle } from "../domain/subscription/redeem_google.js";

const sub = new Hono();
sub.use("*", requireAuth);

sub.post("/start_trial", async (c) => {
  const userId = c.get("userId") as string;
  await startTrial(userId);
  return c.json({ ok: true });
});

const redeemSchema = z.object({
  receipt: z.string().min(1),
  platform: z.enum(["ios", "android"]),
  product_id: z.string().optional(),
});

sub.post("/redeem", validate(redeemSchema), async (c) => {
  const userId = c.get("userId") as string;
  const body = c.get("validatedBody") as z.infer<typeof redeemSchema>;

  if (body.platform === "ios") {
    await redeemApple(userId, body.receipt);
  } else {
    await redeemGoogle(userId, body.receipt, body.product_id ?? "me.4wins.yearly");
  }

  return c.json({ ok: true });
});

sub.get("/status", async (c) => {
  const userId = c.get("userId") as string;
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  return c.json({
    status: user?.subscriptionStatus ?? "free",
    trial_ends_at: user?.trialEndsAt?.toISOString() ?? null,
    paid_until: user?.paidUntil?.toISOString() ?? null,
  });
});

export default sub;
