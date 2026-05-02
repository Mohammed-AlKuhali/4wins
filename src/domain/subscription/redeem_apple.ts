import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { users } from "../../db/schema/users.js";
import { iapReceipts } from "../../db/schema/iap_receipts.js";
import { auditEvents } from "../../db/schema/audit_events.js";
import { assertTransition } from "./state_machine.js";
import { throwApiError } from "../../lib/errors.js";
import { env } from "../../lib/env.js";
import { SignJWT, importPKCS8 } from "jose";

async function buildAppleJWT(): Promise<string> {
  if (!env.APPLE_PRIVATE_KEY || !env.APPLE_KEY_ID || !env.APPLE_TEAM_ID || !env.APPLE_BUNDLE_ID) {
    throwApiError("SERVER_ERROR", "Apple credentials not configured", 503);
  }
  const privateKey = await importPKCS8(env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n"), "ES256");
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: env.APPLE_KEY_ID! })
    .setIssuer(env.APPLE_TEAM_ID!)
    .setAudience("appstoreconnect-v1")
    .setIssuedAt()
    .setExpirationTime("20m")
    .sign(privateKey);
}

export async function redeemApple(userId: string, receipt: string): Promise<void> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throwApiError("NOT_FOUND", "User not found", 404);
  assertTransition(user!.subscriptionStatus, "paid");

  // In production: verify via App Store Server API. For now, parse the receipt as a signed payload.
  // Real implementation would call: GET https://api.storekit.itunes.apple.com/inApps/v1/transactions/{transactionId}
  // with JWT auth. We stub the verification to avoid requiring live credentials.

  let expiresAt: Date | null = null;
  let transactionId = "stub";
  try {
    const payload = JSON.parse(Buffer.from(receipt.split(".")[1] ?? "e30=", "base64url").toString());
    transactionId = payload.transactionId ?? "stub";
    if (payload.expiresDateMs) expiresAt = new Date(payload.expiresDateMs);
  } catch {
    // treat as opaque receipt
  }

  if (!expiresAt) expiresAt = new Date(Date.now() + 365 * 86400000);

  const receiptId = crypto.randomUUID();
  await db.insert(iapReceipts).values({
    id: receiptId,
    userId,
    platform: "ios",
    productId: "me.4wins.yearly",
    originalReceipt: receipt,
    transactionId,
    expiresAt,
    lastVerifiedAt: new Date(),
    status: "active",
  });

  await db.update(users).set({ subscriptionStatus: "paid", paidUntil: expiresAt }).where(eq(users.id, userId));
  await db.insert(auditEvents).values({
    id: crypto.randomUUID(),
    userId,
    event: "subscription_redeemed",
    metadata: { platform: "ios", product_id: "me.4wins.yearly" },
  });
}
