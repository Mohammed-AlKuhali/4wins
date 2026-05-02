export const TEMPLATES = {
  morning_cue: {
    title: "4Wins",
    body: "Coffee's brewing. Your 4Wins is ready.",
    sound: "default",
  },
  afternoon_nudge: {
    title: "4Wins",
    body: "Two of four. Ten minutes.",
    sound: null,
  },
  sunday_close: {
    title: "4Wins",
    body: "The week closed. {days_complete} of 7 days complete.",
    sound: "default",
  },
  trial_ending: {
    title: "4Wins",
    body: "Your trial ends in {days_remaining} days.",
    sound: null,
  },
} as const;

export type TemplateName = keyof typeof TEMPLATES;

export function resolveTemplate(name: TemplateName, payload: Record<string, unknown>): { title: string; body: string; sound: string | null } {
  const tpl = TEMPLATES[name];
  let body = tpl.body as string;
  for (const [key, value] of Object.entries(payload)) {
    body = body.replace(`{${key}}`, String(value));
  }
  return { title: tpl.title, body, sound: tpl.sound as string | null };
}
