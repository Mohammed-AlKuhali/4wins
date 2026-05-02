# Sentry Configuration

## Backend

### Environment variable

```
SENTRY_DSN_BACKEND=https://<key>@sentry.io/<project>
```

Set via Replit Secrets. Never commit to source.

### Initialised in

`src/lib/sentry.ts` — call `initSentry()` before `serve()` in `src/index.ts`.

### Privacy filters applied

- `request.data` stripped from all events
- `user` reduced to `{ id }` (no email)
- Extra fields `email`, `identity_statement`, `raw_text`, `custom_tradition_text` deleted
- Breadcrumb bodies stripped from HTTP breadcrumbs

### Sample rate

`sampleRate: 1.0` — all errors captured.  
If volume becomes expensive, reduce to `0.2` and use `tracesSampleRate: 0.05`.

---

## Mobile (iOS + Android)

### Package

```
@sentry/react-native
```

Not yet initialised (stub in place). To activate:

1. Install: `cd apps/mobile && npx expo install @sentry/react-native`
2. Add `EXPO_PUBLIC_SENTRY_DSN_MOBILE` to environment
3. Call `Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN_MOBILE })` in `app/_layout.tsx`
4. Wrap root component with `Sentry.wrap`

### Privacy filters (mobile, same rules)

- Strip any event extras with keys: `identity_statement`, `raw_text`, `custom_tradition_text`, `email`
- `beforeSend` should redact breadcrumb data the same way as the backend

---

## Alert rules (recommended)

| Alert | Threshold |
|---|---|
| Error spike | > 10 new errors in 1 minute |
| P95 latency | > 2000ms |
| New issue | Any new fingerprint in production |

---

## Source maps

Upload source maps from CI/CD:

```bash
npx @sentry/cli releases files <version> upload-sourcemaps ./dist
```

Use `GIT_SHA` as the release version.
