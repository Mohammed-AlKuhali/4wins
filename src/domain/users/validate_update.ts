import { z } from "zod";

const IANA_TIMEZONES = new Set(Intl.supportedValuesOf("timeZone"));

const notificationPrefsSchema = z.object({
  max_per_day: z.union([z.literal(0), z.literal(1), z.literal(2)]),
});

export const updateUserSchema = z
  .object({
    tradition: z.enum(["christian", "stoic", "buddhist", "secular", "custom"]).optional(),
    custom_tradition_text: z.string().nullable().optional(),
    cue_label: z.string().nullable().optional(),
    cue_time_of_day: z
      .enum(["morning", "midday", "evening", "before_bed", "custom"])
      .nullable()
      .optional(),
    cue_time_local: z.string().nullable().optional(),
    identity_statement: z.string().nullable().optional(),
    notification_prefs: notificationPrefsSchema.optional(),
    timezone: z
      .string()
      .refine((tz) => IANA_TIMEZONES.has(tz), { message: "Invalid IANA timezone" })
      .optional(),
    locale: z
      .string()
      .refine(
        (l) => {
          try {
            new Intl.Locale(l);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Invalid BCP 47 locale tag" }
      )
      .optional(),
  })
  .strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
