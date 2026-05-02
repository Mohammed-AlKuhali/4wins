import { Hono } from "hono";
import { eq, isNull } from "drizzle-orm";
import { db } from "../lib/db.js";
import { users } from "../db/schema/users.js";
import { auditEvents } from "../db/schema/audit_events.js";
import { requireAuth } from "../middleware/require_auth.js";
import { validate } from "../middleware/validate.js";
import { writeLimiter } from "../middleware/rate_limit.js";
import { throwApiError } from "../lib/errors.js";
import { shapeUser } from "../domain/users/shape_user.js";
import { updateUserSchema } from "../domain/users/validate_update.js";
import { softDeleteUser } from "../domain/users/soft_delete.js";
import { hardDeleteUser } from "../domain/users/hard_delete.js";
import type { AppEnv } from "../lib/app_env.js";

const CUE_TIME_DEFAULTS: Record<string, string> = {
  morning: "07:30:00",
  midday: "12:30:00",
  evening: "19:00:00",
  before_bed: "22:00:00",
};

const me = new Hono<AppEnv>();

me.use("*", requireAuth);

async function getActiveUser(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user || user.deletedAt !== null) {
    throwApiError("AUTH_REQUIRED", "Sign in required", 401);
  }
  return user!;
}

me.get("/", async (c) => {
  const userId = c.get("userId") as string;
  const user = await getActiveUser(userId);
  return c.json(shapeUser(user));
});

me.patch("/", writeLimiter, validate(updateUserSchema), async (c) => {
  const userId = c.get("userId") as string;
  await getActiveUser(userId);

  const body = c.get("validatedBody") as ReturnType<typeof updateUserSchema.parse>;
  const updates: Record<string, unknown> = {};

  if (body.tradition !== undefined) {
    updates.tradition = body.tradition;
    if (body.tradition !== "custom") {
      updates.customTraditionText = null;
    }
  }
  if (body.custom_tradition_text !== undefined) updates.customTraditionText = body.custom_tradition_text;
  if (body.cue_label !== undefined) updates.cueLabel = body.cue_label;
  if (body.cue_time_of_day !== undefined) {
    updates.cueTimeOfDay = body.cue_time_of_day;
    if (body.cue_time_of_day && body.cue_time_of_day !== "custom") {
      updates.cueTimeLocal = CUE_TIME_DEFAULTS[body.cue_time_of_day] ?? null;
    } else if (body.cue_time_of_day === "custom" && body.cue_time_local) {
      updates.cueTimeLocal = body.cue_time_local;
    } else if (body.cue_time_of_day === null) {
      updates.cueTimeLocal = null;
    }
  }
  if (body.cue_time_local !== undefined && body.cue_time_of_day === "custom") {
    updates.cueTimeLocal = body.cue_time_local;
  }
  if (body.identity_statement !== undefined) updates.identityStatement = body.identity_statement;
  if (body.notification_prefs !== undefined) updates.notificationPrefs = body.notification_prefs;
  if (body.timezone !== undefined) updates.timezone = body.timezone;
  if (body.locale !== undefined) updates.locale = body.locale;

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();

  await db.insert(auditEvents).values({
    id: crypto.randomUUID(),
    userId,
    event: "user_updated",
    metadata: { fields: Object.keys(body) },
  });

  return c.json(shapeUser(updated));
});

me.delete("/", async (c) => {
  const userId = c.get("userId") as string;
  await getActiveUser(userId);
  const immediate = c.req.query("immediate") === "true";
  if (immediate) {
    await hardDeleteUser(userId);
  } else {
    await softDeleteUser(userId);
  }
  return c.body(null, 204);
});

export default me;
