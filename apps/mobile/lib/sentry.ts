let _Sentry: typeof import('@sentry/react-native') | null = null;

try {
  _Sentry = require('@sentry/react-native');
} catch {
  // Native module not yet linked — safe no-op in JS-only environments
}

export function initSentry(dsn: string, release?: string): void {
  if (!_Sentry || !dsn) return;
  _Sentry.init({
    dsn,
    release,
    tracesSampleRate: 0,
    beforeSend(event) {
      if (event.user) {
        event.user = { id: event.user.id };
      }
      scrubExtra(event);
      return event;
    },
  });
}

function scrubExtra(event: { extra?: Record<string, unknown> }): void {
  if (!event.extra) return;
  const BANNED = ['email', 'identity_statement', 'raw_text', 'custom_tradition_text'];
  for (const key of BANNED) {
    delete event.extra[key];
  }
}

export function setSentryUser(id: string): void {
  _Sentry?.setUser({ id });
}

export function clearSentryUser(): void {
  _Sentry?.setUser(null);
}

export function captureException(err: unknown): void {
  _Sentry?.captureException(err);
}
