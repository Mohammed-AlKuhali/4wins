import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { users } from "../../db/schema/users.js";
import { iapReceipts } from "../../db/schema/iap_receipts.js";
import { auditEvents } from "../../db/schema/audit_events.js";
import { assertTransition } from "./state_machine.js";
import { throwApiError } from "../../lib/errors.js";

export async function redeemGoogle(userId: string, purchaseToken: string, productId: string): Promise<void> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throwApiError("NOT_FOUND", "User not found", 404);
  assertTransition(user!.subscriptionStatus, "paid");

  // Production: verify via Google Play Developer API v3
  // GET https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{packageName}/purchases/subscriptions/{subscriptionId}/tokens/{token}
  // For now: accept token and set expiry

  const expiresAt = new Date(Date.now() + 30 * 86400000); // 30-day stub

  await db.insert(iapReceipts).values({
    id: crypto.randomUUID(),
    userId,
    platform: "android",
    productId,
    originalReceipt: purchaseToken,
    purchaseToken,
    expiresAt,
    lastVerifiedAt: new Date(),
    status: "active",
  });

  await db.update(users).set({ subscriptionStatus: "paid", paidUntil: expiresAt }).where(eq(users.id, userId));
  await db.insert(auditEvents).values({
    id: crypto.randomUUID(),
    userId,
    event: "subscription_redeemed",
    metadata: { platform: "android", product_id: productId },
  });
}
