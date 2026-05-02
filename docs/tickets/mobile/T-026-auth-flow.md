# T-026 — Auth flow UI (Apple + Google)

**Area:** mobile
**Estimate:** 60 min
**Depends on:** T-025, T-003
**Implements PRD:** §3 Flow A (onboarding entrypoint), §6 (auth endpoints), resolved decision #2
**Brand bible:** §3 (voice — "Sign in." Period.)

## Goal

Wire native Apple Sign-In + Google Sign-In on the client, exchange the resulting `id_token` with our backend (T-003), and persist the access + refresh tokens in `expo-secure-store`. After this ticket, the auth gate from T-025 works end-to-end.

## What to build

1. A `welcome` screen entry point with two sign-in buttons:
   - "Continue with Apple" (uses `expo-apple-authentication`)
   - "Continue with Google" (uses `expo-auth-session/providers/google` for OAuth + ID token)
2. After successful native sign-in, POST `id_token` to `/v1/auth/{apple|google}`, get our access + refresh, store securely.
3. **Token refresh interceptor** — a fetch wrapper (`lib/api.ts`) that auto-refreshes on 401 once, then retries. If refresh also fails, signs the user out.
4. **Sign-out** — clears secure store, calls `DELETE /v1/auth/session`, navigates to `welcome`.
5. **Auth state hook** — `useAuth()` returns `{ user, isLoading, signOut, refresh }`.
6. **No email/password fallback.** No "create account" form. No "magic link." Apple + Google only, hard rule.
7. iOS: Apple Sign-In is **required** by App Store guidelines if any other social sign-in is offered. Google is optional but expected.
8. Android: Google is the primary. Apple Sign-In also offered (works via web auth flow).

## Files to create / modify

```
apps/mobile/app/(onboarding)/welcome.tsx       # the actual UI

apps/mobile/lib/
  api.ts                                        # fetch wrapper with refresh
  auth_state.ts                                 # context + storage
  apple_signin.ts                               # native flow wrapper
  google_signin.ts                              # native flow wrapper

apps/mobile/hooks/useAuth.ts

apps/mobile/__tests__/auth.test.ts
```

## Welcome screen UI spec

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│         ◐ ● ◐                        │  <- a static Quad-of-three render, 88pt
│                                     │     (3/4 closed — visual hook)
│                                     │
│         4Wins                       │  <- Fraunces 28
│                                     │
│         Discipline isn't            │  <- Fraunces Light 22, centered
│         motivation. It's a          │
│         decision you make once,     │
│         and keep making.            │
│                                     │
│                                     │
│                                     │
│                                     │
│   ┌───────────────────────────────┐ │
│   │   Continue with Apple          │ │   <- Apple system button
│   └───────────────────────────────┘ │
│   ┌───────────────────────────────┐ │
│   │   Continue with Google         │ │
│   └───────────────────────────────┘ │
│                                     │
│   By continuing you agree to our    │  <- Plex Sans 13 caption
│   Terms and Privacy.                │
│                                     │
└─────────────────────────────────────┘
```

## Acceptance criteria

- [ ] Welcome screen renders with the layout above. No illustration, no purple, no emoji.
- [ ] Apple button uses Apple's required `<AppleAuthentication.AppleAuthenticationButton>` with style/type matching iOS guidelines.
- [ ] Google sign-in initiates the OAuth flow, returns `id_token`, posts to backend.
- [ ] On success, `accessToken` + `refreshToken` are stored in `expo-secure-store` (encrypted on iOS Keychain, Android Keystore).
- [ ] Auth state hook reads the token at boot; if present, fetches `/v1/me` once and caches the user.
- [ ] On 401 from any API call, the fetch wrapper attempts a single refresh; if successful, retries the original. If not, calls `signOut()` and routes to `welcome`.
- [ ] `signOut()` clears storage, calls backend, routes to welcome.
- [ ] No email/password input fields exist anywhere in the codebase (assert via grep test).
- [ ] No third-party social provider beyond Apple + Google (no Facebook, no Twitter, no GitHub).
- [ ] Tests: 5+ cases — happy path Apple, happy path Google, refresh-on-401, refresh failure → signed out, sign-out flow.

## Non-goals

- No deep-linking to specific screens post-sign-in (always lands at the next step of onboarding for new users, or home for returning).
- No biometric re-auth in v1.
- No multi-account.
- No "sign in another device" QR code.

## Notes for the agent

- Apple sign-in: `import * as AppleAuthentication from 'expo-apple-authentication'`. Use `AppleAuthentication.signInAsync({ requestedScopes: [FULL_NAME, EMAIL] })`. The first sign-in returns `email`; subsequent sign-ins do NOT — store it server-side first.
- Google sign-in via `expo-auth-session`: configure with `GOOGLE_CLIENT_ID_IOS` and `GOOGLE_CLIENT_ID_ANDROID` from env. Get `id_token` from the response.
- `expo-secure-store` keys: `accessToken`, `refreshToken`. Don't store the user object — re-fetch from `/v1/me` on each cold start (one extra request, but always fresh).
- The fetch wrapper (`api.ts`):
  ```ts
  const res = await fetch(url, { headers: { Authorization: `Bearer ${access}` }, ... });
  if (res.status === 401 && !alreadyRetried) {
    const newAccess = await refreshToken();
    return fetch(url, { headers: { Authorization: `Bearer ${newAccess}` }, ... });
  }
  ```
- Use `react-query` (`@tanstack/react-query`) for server state — install in this ticket. Wrap `_layout.tsx` in `QueryClientProvider`.
- The Apple sign-in button MUST use Apple's prebuilt component — App Store will reject custom-styled Apple buttons.
- Google sign-in button can be custom-styled (a plain `<Pressable>` styled per brand). Brand bible §3: text says "Continue with Google" exactly.
- After successful sign-in, decide where to route:
  - If user has `tradition !== null && cue_label !== null && identity_statement !== null`: existing user, go to `(app)/home`.
  - Else: new user OR partial onboarding, go to `(onboarding)/pillars` (next step after welcome).
- Privacy/Terms links: open in in-app browser (`expo-web-browser`), placeholder URLs `https://4wins.me/terms`, `https://4wins.me/privacy`.
