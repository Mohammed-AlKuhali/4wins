import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const iapReceipts = pgTable(
  "iap_receipts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    productId: text("product_id").notNull(),
    originalReceipt: text("original_receipt").notNull(),
    purchaseToken: text("purchase_token"),
    transactionId: text("transaction_id"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    status: text("status").notNull().default("active"),
  },
  (table) => [
    index("iap_receipts_user_status_idx").on(table.userId, table.status),
  ]
);

export type IapReceipt = typeof iapReceipts.$inferSelect;
