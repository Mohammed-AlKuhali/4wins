import { throwApiError } from "../../lib/errors.js";

type Status = "free" | "trial" | "paid" | "expired" | "canceled";

const ALLOWED: Record<Status, Status[]> = {
  free: ["trial", "paid"],
  trial: ["paid", "free", "expired"],
  paid: ["expired", "canceled"],
  expired: ["paid", "trial"],
  canceled: ["paid"],
};

export function assertTransition(from: string, to: Status): void {
  const allowed = ALLOWED[from as Status] ?? [];
  if (!allowed.includes(to)) {
    throwApiError(
      "CONFLICT",
      `Illegal subscription transition: ${from} → ${to}`,
      409
    );
  }
}
