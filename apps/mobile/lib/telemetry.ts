import { apiJson } from './api';

type AllowedKey =
  | 'screen' | 'locale' | 'mode' | 'pillar' | 'input_method'
  | 'time_ms' | 'action' | 'banner' | 'screen_from' | 'screen_to'
  | 'attempt_count' | 'error_code';

type AuditMetadata = Partial<Record<AllowedKey, string | number>>;

export type AuditEventType =
  | 'screen_view'
  | 'onboarding_screen_completed'
  | 'pillar_capture_started'
  | 'pillar_capture_completed'
  | 'paywall_shown'
  | 'paywall_action'
  | 'day_closed'
  | 'entry_created';

export async function track(event: AuditEventType, metadata: AuditMetadata = {}): Promise<void> {
  try {
    await apiJson('/v1/audit', {
      method: 'POST',
      body: JSON.stringify({ event_type: event, metadata }),
    });
  } catch {
  }
}
