import { getSpiritualPrompt, SPIRITUAL_PROMPTS } from '../lib/spiritual_prompts';

describe('Spiritual prompts', () => {
  it('returns christian prompt', () => {
    expect(getSpiritualPrompt('christian')).toBe(SPIRITUAL_PROMPTS.christian);
  });

  it('returns stoic prompt', () => {
    expect(getSpiritualPrompt('stoic')).toBe(SPIRITUAL_PROMPTS.stoic);
  });

  it('returns buddhist prompt', () => {
    expect(getSpiritualPrompt('buddhist')).toBe(SPIRITUAL_PROMPTS.buddhist);
  });

  it('returns secular prompt', () => {
    expect(getSpiritualPrompt('secular')).toBe(SPIRITUAL_PROMPTS.secular);
  });

  it('returns custom prompt when set', () => {
    expect(getSpiritualPrompt('custom', 'My custom prompt')).toBe('My custom prompt');
  });

  it('falls back to secular when custom has no text', () => {
    expect(getSpiritualPrompt('custom', null)).toBe(SPIRITUAL_PROMPTS.secular);
  });

  it('falls back to secular for null tradition', () => {
    expect(getSpiritualPrompt(null)).toBe(SPIRITUAL_PROMPTS.secular);
  });
});
