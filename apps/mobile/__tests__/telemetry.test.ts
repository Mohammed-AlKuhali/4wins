import type { AuditEventType } from '../lib/telemetry';

describe('Telemetry event types', () => {
  const VALID_EVENTS: AuditEventType[] = [
    'screen_view',
    'onboarding_screen_completed',
    'pillar_capture_started',
    'pillar_capture_completed',
    'paywall_shown',
    'paywall_action',
    'day_closed',
    'entry_created',
  ];

  it('all event types are defined', () => {
    expect(VALID_EVENTS.length).toBeGreaterThan(0);
    VALID_EVENTS.forEach((e) => {
      expect(typeof e).toBe('string');
      expect(e.length).toBeGreaterThan(0);
    });
  });

  it('all event types use snake_case', () => {
    VALID_EVENTS.forEach((e) => {
      expect(e).toMatch(/^[a-z_]+$/);
    });
  });

  it('no event type contains PII keywords', () => {
    const PII_KEYWORDS = ['email', 'name', 'text', 'identity'];
    VALID_EVENTS.forEach((e) => {
      PII_KEYWORDS.forEach((keyword) => {
        expect(e).not.toContain(keyword);
      });
    });
  });
});
