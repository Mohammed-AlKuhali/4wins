export const SPIRITUAL_PROMPTS: Record<string, string> = {
  christian: 'What are you grateful to God for today?',
  stoic: "What's in your control today, and what isn't?",
  buddhist: 'What did you notice without attaching to it?',
  secular: "What matters today beyond what's urgent?",
  custom: "What matters today beyond what's urgent?",
};

export function getSpiritualPrompt(tradition: string | null, customPrompt?: string | null): string {
  if (tradition === 'custom' && customPrompt) return customPrompt;
  return SPIRITUAL_PROMPTS[tradition ?? 'secular'] ?? SPIRITUAL_PROMPTS.secular;
}
