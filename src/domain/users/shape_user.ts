import type { User } from "../../db/schema/users.js";

export function shapeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    created_at: user.createdAt?.toISOString() ?? null,
    tradition: user.tradition,
    custom_tradition_text: user.customTraditionText ?? null,
    cue_label: user.cueLabel ?? null,
    cue_time_of_day: user.cueTimeOfDay ?? null,
    cue_time_local: user.cueTimeLocal ?? null,
    identity_statement: user.identityStatement ?? null,
    notification_prefs: (user.notificationPrefs as { max_per_day: number }) ?? { max_per_day: 1 },
    timezone: user.timezone,
    locale: user.locale,
    subscription_status: user.subscriptionStatus,
    trial_ends_at: user.trialEndsAt?.toISOString() ?? null,
    paid_until: user.paidUntil?.toISOString() ?? null,
  };
}
