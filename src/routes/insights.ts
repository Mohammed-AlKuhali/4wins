import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { db } from "../lib/db.js";
import { insights } from "../db/schema/insights.js";
import { users } from "../db/schema/users.js";
import { requireAuth } from "../middleware/require_auth.js";

const insightsRouter = new Hono();
insightsRouter.use("*", requireAuth);

insightsRouter.get("/", async (c) => {
  const userId = c.get("userId") as string;
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const isPaidOrTrial = user?.subscriptionStatus === "paid" || user?.subscriptionStatus === "trial";

  const rows = await db
    .select()
    .from(insights)
    .where(eq(insights.userId, userId))
    .orderBy(desc(insights.generatedAt));

  return c.json({
    insights: rows.map((row) => {
      if (row.isPaywalled && !isPaidOrTrial) {
        return {
          id: row.id,
          generated_at: row.generatedAt?.toISOString() ?? null,
          type: row.type,
          is_paywalled: true,
          preview: "Cross-pillar correlation. Trial to unlock.",
        };
      }
      return {
        id: row.id,
        generated_at: row.generatedAt?.toISOString() ?? null,
        type: row.type,
        is_paywalled: row.isPaywalled,
        payload: row.payload,
      };
    }),
  });
});

export default insightsRouter;
