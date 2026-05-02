import { Hono } from "hono";
import { z } from "zod";
import { requireAuth } from "../middleware/require_auth.js";
import { validate } from "../middleware/validate.js";
import { tagPillar } from "../domain/ai/tag_pillar.js";
import type { AppEnv } from "../lib/app_env.js";

const ai = new Hono<AppEnv>();

ai.use("*", requireAuth);

const tagSchema = z.object({
  text: z.string().min(1).max(2000),
});

ai.post("/tag", validate(tagSchema), async (c) => {
  const { text } = c.get("validatedBody") as z.infer<typeof tagSchema>;
  const result = await tagPillar(text);
  return c.json({
    pillar: result.pillar,
    confidence: result.confidence,
    fallback: result.fallback,
  });
});

export default ai;
