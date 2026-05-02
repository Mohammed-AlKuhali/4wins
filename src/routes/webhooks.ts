import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import { iapReceipts } from "../db/schema/iap_receipts.js";
import { users } from "../db/schema/users.js";
import { auditEvents } from "../db/schema/audit_events.js";
import { logger } from "../lib/logger.js";

const webhooks = new Hono();

webhooks.post("/apple", async (c) => {
  const rawBody = await c.req.text();
  // Apple App Store Server Notifications V2 — JWS signed payload
  try {
    const parts = rawBody.split(".");
    if (parts.length !== 3) return c.json({ ok: false }, 400);

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    const notificationType = payload.notificationType;
    const transactionId = payload.data?.signedTransactionInfo?.split(".")[1]
      ? JSON.parse(Buffer.from(payload.data.signedTransactionInfo.split(".")[1], "base64url").toString())?.transactionId
      : null;

    if (!transactionId) return c.json({ ok: true });

    const receipt = await db.query.iapReceipts.findFirst({
      where: eq(iapReceipts.transactionId, transactionId),
    });

    if (receipt) {
      let newStatus: "active" | "expired" | "refunded" | "revoked" = "active";
      let subStatus: string | null = null;

      if (["EXPIRED", "GRACE_PERIOD_EXPIRED"].includes(notificationType)) {
        newStatus = "expired";
        subStatus = "expired";
      } else if (notificationType === "REFUND") {
        newStatus = "refunded";
        subStatus = "free";
      } else if (notificationType === "REVOKE") {
        newStatus = "revoked";
        subStatus = "free";
      }

      await db.update(iapReceipts).set({ status: newStatus }).where(eq(iapReceipts.id, receipt.id));
      if (subStatus) {
        await db.update(users).set({ subscriptionStatus: subStatus }).where(eq(users.id, receipt.userId));
        await db.insert(auditEvents).values({
          id: crypto.randomUUID(),
          userId: receipt.userId,
          event: "subscription_webhook",
          metadata: { type: notificationType, platform: "ios" },
        });
      }
    }
  } catch (err) {
    logger.warn({ err: String(err) }, "Apple webhook parse error");
  }

  return c.json({ ok: true });
});

webhooks.post("/google", async (c) => {
  const body = await c.req.json() as { message?: { data?: string }; subscription?: string };
  try {
    const dataB64 = body?.message?.data;
    if (!dataB64) return c.json({ ok: true });

    const raw = JSON.parse(Buffer.from(dataB64, "base64").toString());
    const purchaseToken = raw?.subscriptionNotification?.purchaseToken;
    const notificationType = raw?.subscriptionNotification?.notificationType;

    if (!purchaseToken) return c.json({ ok: true });

    const receipt = await db.query.iapReceipts.findFirst({
      where: eq(iapReceipts.purchaseToken, purchaseToken),
    });

    if (receipt) {
      // Google notificationType: 12=expired, 3=canceled, 6=refunded
      let newStatus: "active" | "expired" | "refunded" | "revoked" = "active";
      let subStatus: string | null = null;

      if ([12, 13].includes(notificationType)) {
        newStatus = "expired";
        subStatus = "expired";
      } else if ([3].includes(notificationType)) {
        newStatus = "expired";
        subStatus = "canceled";
      } else if ([6].includes(notificationType)) {
        newStatus = "refunded";
        subStatus = "free";
      }

      await db.update(iapReceipts).set({ status: newStatus }).where(eq(iapReceipts.id, receipt.id));
      if (subStatus) {
        await db.update(users).set({ subscriptionStatus: subStatus }).where(eq(users.id, receipt.userId));
        await db.insert(auditEvents).values({
          id: crypto.randomUUID(),
          userId: receipt.userId,
          event: "subscription_webhook",
          metadata: { type: notificationType, platform: "android" },
        });
      }
    }
  } catch (err) {
    logger.warn({ err: String(err) }, "Google webhook parse error");
  }

  return c.json({ ok: true });
});

export default webhooks;
