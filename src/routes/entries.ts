import { Hono } from "hono";
import { requireAuth } from "../middleware/require_auth.js";
import { writeLimiter } from "../middleware/rate_limit.js";
import { validate } from "../middleware/validate.js";
import { ensureToday } from "../domain/days/ensure_today.js";
import { createEntry } from "../domain/entries/create.js";
import { updateEntry } from "../domain/entries/update.js";
import { deleteEntry } from "../domain/entries/delete.js";
import { createEntrySchema, updateEntrySchema, validateCreateEntry } from "../domain/entries/validate.js";
import { getIdempotentResponse, storeIdempotentResponse } from "../lib/idempotency.js";
import { shapeEntry } from "./today.js";
import type { AppEnv } from "../lib/app_env.js";

const entriesRouter = new Hono<AppEnv>();

entriesRouter.use("*", requireAuth, writeLimiter);

entriesRouter.post("/", validate(createEntrySchema), async (c) => {
  const userId = c.get("userId") as string;
  const body = c.get("validatedBody") as ReturnType<typeof createEntrySchema.parse>;
  const idempotencyKey = c.req.header("Idempotency-Key");

  if (idempotencyKey) {
    const cached = await getIdempotentResponse(idempotencyKey, userId);
    if (cached !== null) return c.json(cached as object);
  }

  validateCreateEntry(body);

  const day = await ensureToday(userId);
  const { entry, day: updatedDay, streak, aiTag, mismatchHint } = await createEntry(userId, day.id, body);

  const response: Record<string, unknown> = {
    entry: shapeEntry(entry),
    day: {
      id: updatedDay.id,
      date: updatedDay.date,
      pillars_logged: updatedDay.pillarsLogged,
      closed_at: updatedDay.closedAt?.toISOString() ?? null,
    },
    streak: {
      current: streak?.currentCount ?? 0,
      longest: streak?.longestCount ?? 0,
      freezes_remaining: streak?.freezesRemainingThisMonth ?? 2,
    },
  };

  if (aiTag) response.ai_tag = aiTag;
  if (mismatchHint) response.pillar_mismatch_hint = mismatchHint;

  if (idempotencyKey) {
    await storeIdempotentResponse(idempotencyKey, userId, response);
  }

  return c.json(response, 201);
});

entriesRouter.patch("/:id", validate(updateEntrySchema), async (c) => {
  const userId = c.get("userId") as string;
  const entryId = c.req.param("id");
  const body = c.get("validatedBody") as ReturnType<typeof updateEntrySchema.parse>;

  const { entry, day } = await updateEntry(entryId, userId, body);

  return c.json({
    entry: shapeEntry(entry),
    day: {
      id: day.id,
      date: day.date,
      pillars_logged: day.pillarsLogged,
      closed_at: day.closedAt?.toISOString() ?? null,
    },
  });
});

entriesRouter.delete("/:id", async (c) => {
  const userId = c.get("userId") as string;
  const entryId = c.req.param("id");
  const { day, streak } = await deleteEntry(entryId, userId);

  return c.json({
    day: {
      id: day.id,
      date: day.date,
      pillars_logged: day.pillarsLogged,
      closed_at: day.closedAt?.toISOString() ?? null,
    },
    streak: {
      current: streak?.currentCount ?? 0,
      longest: streak?.longestCount ?? 0,
      freezes_remaining: streak?.freezesRemainingThisMonth ?? 2,
    },
  });
});

export default entriesRouter;
