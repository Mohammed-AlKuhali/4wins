import * as Sentry from '@sentry/node';
import { GIT_SHA } from './version.js';

const SENTRY_DSN = process.env.SENTRY_DSN_BACKEND;

export function initSentry(): void {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    release: GIT_SHA,
    sampleRate: 1.0,
    beforeSend(event) {
      if (event.request?.data) {
        delete event.request.data;
      }
      if (event.user) {
        event.user = { id: event.user.id };
      }
      scrubBreadcrumbs(event);
      scrubEventData(event);
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'http') {
        delete (breadcrumb.data as Record<string, unknown>)?.body;
        delete (breadcrumb.data as Record<string, unknown>)?.request_body;
      }
      return breadcrumb;
    },
  });

  Sentry.setTag('git_sha', GIT_SHA);
}

function scrubBreadcrumbs(event: Sentry.Event): void {
  const breadcrumbValues = (event.breadcrumbs as { values?: Sentry.Breadcrumb[] } | undefined)?.values;
  if (!breadcrumbValues) return;
  for (const crumb of breadcrumbValues) {
    if (crumb.data) {
      delete (crumb.data as Record<string, unknown>)?.body;
      delete (crumb.data as Record<string, unknown>)?.request_body;
    }
  }
}

function scrubEventData(event: Sentry.Event): void {
  if (!event.extra) return;
  const BANNED = ['email', 'identity_statement', 'raw_text', 'custom_tradition_text'];
  for (const key of BANNED) {
    delete (event.extra as Record<string, unknown>)[key];
  }
}

export { Sentry };
