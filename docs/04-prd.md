# 04 — Product Requirements (v1)

> Phase 4 deliverable. The screen-level + system-level spec. This is what Phase 5 (tickets) and Phase 6 (Replit prompts) get carved from.
> Compiled 2026-05-02. Inputs: `docs/01-concept.md`, `docs/02-research.md`, `docs/03-brand.md`.

---

## 0. Scope of v1

**v1 ships:** the daily four-pillar ritual on iOS + Android (Expo), with voice-first capture, AI auto-tagging, tradition-routed Spiritual content, output-boxed Financial mindset check, HealthKit/Health Connect read for Physical, humane streaks, a single home-screen widget rendering today's Quad, and a paywall triggered by the day-30 cross-pillar insight.

**v1 does not ship:** see §9 (Out of scope).

**Target:** TestFlight build by Phase 5 + 6 weeks. Public App Store + Play release within 12 weeks. These are working assumptions, not promises.

---

## 1. Personas (anchored, not generic)

Two real personas. Replit prompts and copy decisions reference these by name.

### Maya — 32, product manager, secular

Has tried Streaks, Headspace, Notion templates. Hits week 2, drops off. Doesn't want a chatbot. Wants something serious. Earns ~$140k, has $30k in savings, doesn't budget but wishes she did. Picks **Stoic** as her tradition because she read Meditations once. Cue: *after morning coffee*.

**What kills her:** anything that feels infantilizing or evangelical. Confetti is offensive. "Hey friend ✨" makes her uninstall.

**What gets her:** the Quad rendering as a watch complication. The fact that her Financial pillar isn't a budget. Cal Newport-flavored copy.

### Ahmad — 28, software engineer, Muslim

Disciplined-by-faith, wants tech to support that. Tried prayer apps, found them either too narrow or too cringe. Wants a daily practice that respects his Maghrib time. Earns ~$110k, married, joint finances. Picks **Custom** as his tradition and writes his own prompts. Cue: *after Fajr*.

**What kills him:** generic "spiritual but not religious" content that doesn't acknowledge religion specifically. Apps that assume English-only. Anything that asks for bank access.

**What gets him:** tradition-routing that takes a custom track seriously. Voice capture in Arabic auto-tagged correctly. The ritual completing at his own cadence.

(These personas drive specific decisions. The Spiritual pillar must support a non-Western tradition without forcing it; the Financial pillar must not require bank access; voice transcription must support multiple languages from v1.)

---

## 2. User flows

### Flow A — First-run onboarding (Day 0)

**Goal:** ship the user to a partially-filled Quad in their first session, with their identity, cue, and tradition declared.

```
1.  Welcome screen (Fraunces, full-bleed)
       "Discipline isn't motivation.
        It's a decision you make once,
        and keep making."
       [Continue]
2.  The four pillars
       "Four wins. Every day.
        Mental. Financial. Spiritual. Physical.
        Tomorrow, all four again."
       [Continue]
3.  Tradition selection (Spiritual routing)
       "Your Spiritual win can draw from a tradition,
        or from your own thinking. You can change this anytime."
       [Christian] [Stoic] [Buddhist] [Secular] [Custom]
4.  Identity statement
       "Who are you becoming?"
       [Free-text input, 1-2 sentences]
       (Stored. Resurfaced periodically.)
5.  Cue binding (when will you do this?)
       "After my morning coffee" / "Before my laptop" / 
       "When I close my laptop" / "Before bed" / [Custom...]
6.  Notification permission ask (with explicit preferences)
       "We send one push a day, anchored to your cue.
        We never send 'don't break your streak.'"
       [Allow, once a day] [Allow, twice a day max] [No notifications]
7.  Day-0 ritual — tiny version of all four pillars
       For each pillar in order (Mental → Financial → Spiritual → Physical):
         - Full-screen Fraunces prompt (the lazy-path version)
         - One-tap "log a tiny win" button
         - Or voice/type input
         - Arc fills as user completes
8.  "You closed your first Quad."
       [Quad fills, settles, single haptic tick]
9.  Home screen
       Quad shown complete for today.
       Tomorrow opens fresh.
```

**Drop-off targets:** ≥80% of users completing screen 1 should reach screen 9. Telemetry hooks at every screen.

**No skipping.** The Day-0 ritual is non-skippable — this is the entire onboarding hypothesis. If someone closes the app at screen 7, they get a single re-engagement push 4h later, anchored to "Finish your first Quad — 90 seconds left."

---

### Flow B — Daily ritual (Day N, returning user)

**Goal:** a 90-second floor on a low-motivation day. One tap per pillar at the lazy minimum.

```
1.  Push at user's cue (if enabled): "Coffee's brewing. Your 4Wins is ready."
2.  User opens app → Home
       Quad shows current day's state. Next un-done pillar named below.
3.  User taps pillar (or taps the "Next: [Pillar name]" CTA)
4.  Full-screen pillar capture
       - Big mic button, small "Type instead" / small "[Lazy path]" buttons
       - Pillar prompt in Fraunces, large
5a. Voice path: user holds mic, speaks, releases
       - Server-side transcription (<2s)
       - AI tags the pillar from the text
       - If tagged pillar ≠ current pillar, soft prompt: 
         "That sounded more like a [tagged] win. Log there instead?"
       - Otherwise: arc fills, return to Home
5b. Type path: keyboard appears, user types, taps Save
5c. Lazy path: one tap, entry created with input_method=lazy_path, no text
6.  Repeat for remaining pillars (any order)
7.  On completing the fourth pillar:
       Full-screen "close the day" animation (~2.4s, see §7 of brand bible)
       "Closed."
       [Done]
8.  Home now shows full Quad. App can be closed.
```

**Order is user-driven.** The home screen suggests "next un-done" but doesn't enforce. Users who want to do Spiritual first should be able to.

**Voice fallback:** if transcription fails, fall back to type. If AI tagging fails, default to current pillar.

---

### Flow C — Missed day (no shame loop)

**Goal:** never punish. Auto-apply a streak freeze if available; if not, reset gracefully.

```
1.  User missed yesterday entirely (no entries for that date by 4am their tz).
2.  At 4am tz boundary:
       - If freezes_remaining_this_month > 0: 
           apply freeze, mark yesterday as is_rest_day=true
           (no notification sent)
       - Else: 
           streak resets to 0 silently. cumulative count is unaffected.
3.  When user next opens the app:
       - First view: a single sentence
           "Today is a new day."
       - If freeze applied: small line below
           "Yesterday was a rest day."
       - If streak reset: no mention of streak. The home shows the empty Quad.
4.  No push fires the day they miss. No "you broke your streak" anywhere, ever.
```

**Streak math:**
- Streak begins counting on Day 2.
- Freezes refresh on the 1st of each month, max 2.
- Cumulative completions ("Days complete: 47") is the durable metric. Never resets.
- After Week 2, the streak number disappears from the home screen — only visible in widget config and a single line on the weekly close screen.

---

### Flow D — Weekly close (Sunday evening)

**Goal:** a fresh-start landmark every Monday. Multiplies closure events.

```
1.  Sunday at user's evening cue (or 8pm local if no evening cue):
       Push: "The week closed. X of 7 days complete."
2.  User taps push → Weekly close screen
       Seven Quads in a horizontal row, each showing that day's state.
       Below: "Six of seven days complete." (or whatever)
       Below: "Cumulative completions: 47."
       Single CTA: "Continue."
3.  No grade. No "great job." No "your worst week yet."
       Just the data.
4.  Tap "Continue" → Home (which now shows tomorrow's empty Quad).
```

**Why it works:** Sunday close + Monday fresh-start = a built-in re-engagement mechanic that doesn't require lapsed-user campaigns.

---

### Flow E — Day 30 paywall

**Goal:** convert at the moment the data first becomes useful. The cross-pillar insight IS the upsell.

```
1.  User opens the app on the 30th distinct day-with-data (not Day 30 calendar).
2.  Before showing Home, full-screen interstitial:
       "This is your first month.
        Here's what 30 days of you looks like."
3.  Three insight cards, swipeable:
       - Card 1: "You closed 24 of 30 days. Top pillar: Spiritual."
       - Card 2: "Your Mental wins cluster on Tuesdays."
       - Card 3 (the upsell): "Cross-pillar correlation: 
            Days you logged Spiritual were 2.3x more likely to be 
            full-Quad days." (PAYWALLED — blurred behind a button)
4.  Below cards:
       "The next eleven months are paid.
        $79 a year. No card needed for the trial."
       [Start 14-day trial] [Continue free with 30-day history]
5a. Trial start: 
       Trial flag set, no IAP yet (App Store/Play 14-day promo). 
       Day-44 push: "Your trial ends in 3 days. Continue at $79/year?"
5b. Continue free:
       Free user keeps all features but history capped at 30 rolling days.
       Future cross-pillar insights blurred until upgrade.
```

**Hard rule:** never paywall the daily ritual itself. The free tier always includes the full four-pillar daily flow + widget + 30-day history.

---

### Flow F — Trial → paid

```
1.  Day 11 of trial: in-app banner (not push) on Home
       "Your trial ends in 3 days."
       [Continue at $79/year] [Skip]
2.  Day 14: trial ends.
       - If converted: nothing changes for the user.
       - If not: history caps at 30 rolling days, future insights blur.
       No "thanks for trying" interstitial. No "we'll miss you." Just continues.
3.  IAP: standard App Store / Play subscription. 
       $7.99/mo and $79/yr. Restore-purchase available.
       Cancellation goes through Apple/Google directly (we don't gate it).
```

---

## 3. Screen inventory

Total: **22 screens** for v1. Each gets its own ticket in Phase 5.

### Onboarding (8 screens)

| # | Screen | Key states |
|---|---|---|
| 01 | Welcome | static |
| 02 | Pillars introduction | static |
| 03 | Tradition selection | 5 options + custom input |
| 04 | Identity statement | empty / typing / saved |
| 05 | Cue binding | preset list + custom |
| 06 | Notification permission ask | iOS / Android variants |
| 07 | Day-0 ritual (4 sub-screens, one per pillar) | each: empty / voice / type / lazy / saved |
| 08 | First Quad closed | the close animation + "You closed your first Quad." |

### Daily app (10 screens)

| # | Screen | Key states |
|---|---|---|
| 09 | Home | empty Quad / partial / complete / rest day / new user |
| 10 | Pillar capture: Mental | prompt / voice / type / lazy / saved |
| 11 | Pillar capture: Financial | prompt / 3-option / saved |
| 12 | Pillar capture: Spiritual | 5 tradition variants × prompt/voice/type/lazy/saved |
| 13 | Pillar capture: Physical | HealthKit-detected / manual / lazy / saved |
| 14 | Voice capture overlay | listening / processing / transcribed / error |
| 15 | Day complete | the close animation + "Closed." |
| 16 | History | grid of past days / day detail |
| 17 | Weekly close | 7 quads + cumulative + continue |
| 18 | Settings | tradition / cue / identity / notifications / data export / sign out |

### Paywall + edge (4 screens)

| # | Screen | Key states |
|---|---|---|
| 19 | Day-30 insight + paywall | 3 insight cards + CTAs |
| 20 | Subscription manage | trial / paid / canceled |
| 21 | Missed-day greeting | "Today is a new day" / with rest-day note |
| 22 | Errors | network / voice / auth |

---

## 4. Per-screen specs (the non-obvious ones)

Most screens are obvious from §2 + the brand bible. These need extra spec.

### Screen 09 — Home (the surface that matters most)

**Above the fold:**
- Top bar: minimal — left = current ISO week ("W18 · Sun"), right = settings cog (1 icon).
- Center: the **Quad**, ~280pt diameter, at 24pt margin from top bar.
- Below Quad, single line in Fraunces 22/28: name of next un-done pillar OR "Closed."
- Below that, single line in Plex Sans 13/18: pillar count today + total time today (only if any pillar logged).

**Below the fold (scroll):**
- "Today" — list of today's entries in chronological order, each entry a card with pillar glyph, snippet, time. Tap = day detail.
- "This week" — 7-quad strip.
- "Cumulative" — Plex Mono 32: "47" with caption "days complete."

**No tab bar.** No bottom nav. No FAB.

**States:**
- New user (Day 0 done, partial day): Quad shows partial, "Next: Financial," entries strip shows the Day-0 lazy entries.
- Mid-day, returning: Quad partial, "Next: [pillar]."
- Closed: Quad full, "Closed.", below "Tomorrow opens fresh."
- Missed yesterday: Quad empty, sentence above: "Yesterday was a rest day. Today is open." (or just "Today is a new day.")

**Performance:** must render at <300ms cold start. Quad SVG is precomputed/cached.

### Screen 10/11/12/13 — Pillar capture (shared structure)

All four pillar captures share a layout shell:

```
┌─────────────────────────────────────┐
│ ✕                                   │  <- close X, 16pt margin top-left
│                                     │
│                                     │
│                                     │
│   What did you learn today?         │  <- Fraunces Light 40/48, vertical-centered
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│           ⌖                         │  <- big mic button, 80pt, centered
│                                     │
│   [Type instead]    [Lazy path]     │  <- Plex Sans 17 buttons, low emphasis
└─────────────────────────────────────┘
```

The prompt text differs by pillar (and by tradition for Spiritual). The interaction shell is identical.

**Mic button:** hold-to-speak. Release = stop + transcribe.
**Type:** taps to expand a full-screen text input with a single Save button.
**Lazy path:** single tap = entry with `input_method=lazy_path`, `raw_text=null`, instantly returns to Home.

**Financial pillar exception:** instead of mic-first, it's a 3-button row (Yes / Not quite / Not today), then optional voice/type for "why?". The three taps complete the pillar; the why is a bonus.

### Screen 14 — Voice capture overlay

Modal (full-screen, slides up):
- Top: pillar prompt (small, 17pt, top of screen)
- Center: large waveform animation, pulse with audio level
- Below waveform: live transcript appearing word-by-word (Plex Sans 22, max 4 lines)
- Bottom: large red "Stop" button

On stop:
- Brief "processing…" state (single thin line pulse, not a spinner)
- Transcript shows in full, with [Save] and [Re-record]
- If AI-tagged pillar ≠ current pillar:
  > "That sounded more like a [tagged] win. Log there instead?"
  > [Yes, log as [tagged]] [Keep as [current]]

### Screen 17 — Weekly close

```
┌─────────────────────────────────────┐
│                                     │
│   The week closed.                  │  <- Fraunces Light 28/36
│   Six of seven days complete.       │
│                                     │
│                                     │
│   ◐ ● ● ● ◐ ● ●                     │  <- 7 mini-quads, ~32pt each
│   M T W T F S S                     │  <- day labels Plex Sans 13
│                                     │
│                                     │
│   Cumulative                        │  <- Plex Sans 13 caption
│   47                                │  <- Plex Mono 40
│   days complete                     │
│                                     │
│                                     │
│                                     │
│             [Continue]              │
└─────────────────────────────────────┘
```

No grade. No comparison to last week (week-over-week comparisons trigger ranking instinct, which the brand rejects). Just the data.

### Screen 19 — Day-30 paywall (the conversion moment)

This is the highest-stakes screen in the app. Spec it carefully.

```
┌─────────────────────────────────────┐
│                                     │
│   This is your first month.         │  <- Fraunces Light 28/36
│                                     │
│   Here's what 30 days of you        │
│   looks like.                       │
│                                     │
│   ┌───────────┐ ┌───────────┐       │  <- swipeable horizontal cards
│   │  Card 1   │ │  Card 2   │ ...   │
│   └───────────┘ └───────────┘       │
│                                     │
│                                     │
│   The next eleven months are paid.  │
│   $79 a year. No card needed        │
│   for the trial.                    │
│                                     │
│   [ Start 14-day trial ]            │  <- primary, off-black filled
│   [ Continue free, 30-day history ] │  <- secondary, outlined
│                                     │
└─────────────────────────────────────┘
```

**Card 1:** "You closed 24 of 30 days. Top pillar: Spiritual."
**Card 2:** "Your Mental wins cluster on Tuesdays. Your Spiritual wins are even across the week."
**Card 3 (paywalled — blur):** "Cross-pillar correlation: days you logged Spiritual were 2.3x more likely to be full-Quad days." Background blurred. CTA on card: "Unlock with trial."

**No urgency timers. No "limited offer." No struck-through prices.** This is a serious app for serious adults.

---

## 5. Data model

Postgres on Replit. UUID primary keys. All timestamps `timestamptz`.

### `users`
```sql
id                    uuid PRIMARY KEY
email                 text UNIQUE NOT NULL
created_at            timestamptz NOT NULL DEFAULT now()
tradition             text NOT NULL CHECK (tradition IN 
                        ('christian','stoic','buddhist','secular','custom'))
custom_tradition_text text  -- only when tradition = 'custom'
cue_label             text  -- e.g. 'after morning coffee'
cue_time_of_day       text CHECK (cue_time_of_day IN 
                        ('morning','midday','evening','before_bed','custom'))
cue_time_local        time  -- computed/declared push fire time
identity_statement    text
notification_prefs    jsonb NOT NULL DEFAULT '{"max_per_day": 1}'
timezone              text NOT NULL  -- IANA, e.g. 'America/New_York'
subscription_status   text NOT NULL DEFAULT 'free' CHECK (subscription_status IN 
                        ('free','trial','paid','expired','canceled'))
trial_ends_at         timestamptz
paid_until            timestamptz
locale                text NOT NULL DEFAULT 'en'
deleted_at            timestamptz  -- soft delete
```

### `days`
```sql
id              uuid PRIMARY KEY
user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
date            date NOT NULL  -- in user timezone
closed_at       timestamptz  -- when 4th pillar logged
is_rest_day     boolean NOT NULL DEFAULT false  -- auto-applied freeze
pillars_logged  text[] NOT NULL DEFAULT '{}'  -- ['mental','physical',...]
UNIQUE (user_id, date)
INDEX (user_id, date DESC)
```

### `entries`
```sql
id                 uuid PRIMARY KEY
user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
day_id             uuid NOT NULL REFERENCES days(id) ON DELETE CASCADE
pillar             text NOT NULL CHECK (pillar IN 
                     ('mental','physical','spiritual','financial'))
captured_at        timestamptz NOT NULL DEFAULT now()
input_method       text NOT NULL CHECK (input_method IN 
                     ('voice','type','lazy_path','healthkit_auto','health_connect_auto'))
raw_text           text  -- voice transcript or typed text
ai_tagged_pillar   text  -- what AI thinks the entry is about
ai_confidence      real  -- 0..1
structured_data    jsonb  -- pillar-specific (financial: {behavior_match}, physical: {duration_min, source})
duration_seconds   int
INDEX (user_id, captured_at DESC)
INDEX (day_id)
```

### `streaks` (one row per user)
```sql
user_id                       uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
current_count                 int NOT NULL DEFAULT 0
longest_count                 int NOT NULL DEFAULT 0
last_complete_date            date
freezes_remaining_this_month  int NOT NULL DEFAULT 2
freezes_used_total            int NOT NULL DEFAULT 0
month_year                    text NOT NULL  -- '2026-05', for monthly refresh
```

### `weekly_summaries`
```sql
id              uuid PRIMARY KEY
user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
iso_week        text NOT NULL  -- '2026-W18'
days_complete   int NOT NULL
pillar_counts   jsonb NOT NULL  -- {"mental":6,"physical":5,...}
generated_at    timestamptz NOT NULL DEFAULT now()
UNIQUE (user_id, iso_week)
```

### `insights`
```sql
id              uuid PRIMARY KEY
user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
generated_at    timestamptz NOT NULL DEFAULT now()
type            text NOT NULL CHECK (type IN 
                  ('cross_pillar_correlation','pillar_consistency',
                   'time_of_day_pattern','tradition_specific'))
payload         jsonb NOT NULL
shown_at        timestamptz  -- when first shown to user
is_paywalled    boolean NOT NULL DEFAULT false
INDEX (user_id, generated_at DESC)
```

### `push_tokens`
```sql
id          uuid PRIMARY KEY
user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
token       text NOT NULL
platform    text NOT NULL CHECK (platform IN ('ios','android'))
created_at  timestamptz NOT NULL DEFAULT now()
last_used   timestamptz
UNIQUE (token)
```

### `audit_events` (for debugging retention, not analytics)
```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES users(id) ON DELETE SET NULL
event       text NOT NULL  -- 'onboarding_screen_view', 'pillar_complete', etc.
metadata    jsonb
created_at  timestamptz NOT NULL DEFAULT now()
INDEX (user_id, created_at DESC)
```

**Privacy notes:**
- `entries.raw_text` is the most sensitive field. Encrypted at rest via Postgres TDE if Replit supports it; if not, application-level field encryption.
- AI tagging uses `raw_text` but the LLM call sends only the text + a fixed prompt — no user identifiers, no history.
- No third-party analytics on entry content. `audit_events` tracks screen flows only, no entry text.

---

## 6. API surface

REST + JSON, served by Replit Node backend (Express or Hono). Auth: Apple Sign-In + Google Sign-In (no password), JWT in Authorization header.

### Auth
```
POST   /v1/auth/apple              { id_token } → { jwt, user }
POST   /v1/auth/google             { id_token } → { jwt, user }
DELETE /v1/auth/session            → 204
```

### User
```
GET    /v1/me                      → user object
PATCH  /v1/me                      { tradition?, cue_*?, identity_statement?, notification_prefs?, timezone?, locale? }
DELETE /v1/me                      → soft-delete user (account deletion)
```

### Days + entries (the daily ritual)
```
GET    /v1/today                   → today's day + entries + streak summary
                                     (the home-screen call; <300ms target)

POST   /v1/entries                 { 
                                     pillar?,        // omitted = AI auto-tag
                                     input_method,
                                     raw_text?,
                                     structured_data?,
                                     duration_seconds?
                                   }
                                   → { entry, day_state }
                                   Server creates day if missing,
                                   updates pillars_logged array,
                                   sets closed_at if 4th pillar.

PATCH  /v1/entries/:id             { raw_text?, pillar? } → entry
DELETE /v1/entries/:id             → 204
```

### Voice + AI
```
POST   /v1/voice/transcribe        multipart audio → { text, language, confidence }
                                   Server-side: OpenAI Whisper or platform STT.
                                   <2s p95.

POST   /v1/ai/tag                  { text } → { pillar, confidence, reasoning }
                                   Cheap model (Claude Haiku / GPT-4o-mini).
                                   <500ms p95.
```

### History + insights
```
GET    /v1/history?from=&to=       → days + entries in range
                                     Free tier: capped to last 30 days.

GET    /v1/streak                  → { current, longest, freezes_remaining, last_complete_date }

GET    /v1/week/:iso_week          → weekly summary

GET    /v1/insights?since=         → list of insights
                                     Paywalled ones returned with payload omitted +
                                     is_paywalled=true flag.

POST   /v1/insights/regenerate     → recompute (internal/cron, not user-callable in v1)
```

### Subscription
```
POST   /v1/subscription/start_trial      → { trial_ends_at }
POST   /v1/subscription/redeem           { receipt, platform } → { subscription_status, paid_until }
GET    /v1/subscription/status           → { status, trial_ends_at, paid_until }
```

### Notifications
```
POST   /v1/notifications/register        { token, platform } → 204
DELETE /v1/notifications/unregister      { token } → 204
```

### Admin / health
```
GET    /v1/health                  → { status: 'ok', db: 'ok', ai: 'ok' }
```

**Rate limits:** auth endpoints 10/min/IP, write endpoints 60/min/user, transcribe 30/min/user. Returns standard 429 with `Retry-After`.

**Errors:** standard JSON error envelope: `{ error: { code, message } }`. Codes: `AUTH_REQUIRED`, `RATE_LIMITED`, `VALIDATION`, `NOT_FOUND`, `SERVER_ERROR`.

---

## 7. Background jobs (cron on Replit)

| Job | Cadence | Purpose |
|---|---|---|
| `apply_streak_freezes` | hourly | At each user's tz 4am, check yesterday's day, apply freeze if needed |
| `generate_weekly_summary` | hourly | At each user's evening cue on Sunday, generate weekly_summary row |
| `send_evening_cue_push` | hourly | Send "The week closed" push to users whose Sunday evening cue just hit |
| `generate_day_30_insights` | hourly | When user hits 30 distinct day-with-data, generate insights row |
| `refresh_monthly_freezes` | daily | At 00:01 of 1st of each month per tz, reset `freezes_remaining_this_month` to 2 |
| `send_morning_cue_push` | hourly | Send daily "Coffee's brewing" push at user's morning cue time |
| `send_trial_ending_banner` | daily | Day 11 of trial: set in-app banner flag |
| `cleanup_audit_events` | weekly | Delete audit_events > 90 days old |

All jobs idempotent. Use a `jobs_run_log` table with (job_name, ran_at, succeeded) for observability.

---

## 8. Non-functional requirements

| Aspect | Target |
|---|---|
| Cold start (Home render) | <300ms p95 |
| Pillar capture transition | <100ms |
| Voice transcription round-trip | <2000ms p95 |
| AI tagging round-trip | <500ms p95 |
| Push delivery (cue → device) | <60s p95 |
| Backend uptime | 99.5% v1 (Replit reserved deployment) |
| Offline: daily ritual | Entries persist locally (Expo SQLite), sync when online |
| Accessibility | WCAG AA, glyph + position redundant signifiers, dynamic type up to 200% |
| Localization | EN at v1; structured for adding AR, ES, FR via i18n keys |
| Voice languages | Whisper supports 50+ languages out of box; no locale-gating |
| Privacy | Entry text never sent to third-party analytics; LLM calls stripped of user IDs |
| App size | <50MB iOS, <40MB Android |
| Crash-free sessions | >99.5% |

---

## 9. Out of scope (the "do not drift" list)

These are explicitly NOT in v1. Replit Agent prompts must check against this list.

### Product
- **No bank/Plaid/transaction integration.** Financial pillar is a mindset check.
- **No relationships pillar.** Post-launch.
- **No social features:** no feed, friends, leaderboards, public sharing as default.
- **No coach matchmaking, no human accountability cohorts.**
- **No content library beyond tradition-routed prompts** (no meditations, no audio courses).
- **No "AI Coach" persona, no chat UI.**

### Surfaces
- **No interactive Lock Screen widget.** v1.5.
- **No Apple Watch complication.** v1.5.
- **No Android Wear complication.** v1.5.
- **No web/desktop client.**
- **No widget configuration UI** beyond default — v1.5.

### Mechanics
- **No XP, levels, badges, titles.**
- **No streak freeze IAP.** Free, capped at 2/month.
- **No "Don't break your streak" / "Are you sure you want to leave?" guilt patterns.**
- **No confetti, particle effects, mascots, audio celebrations.**
- **No leaderboards or competitive features.**

### Stack
- **No native Swift/Kotlin features that don't go through Expo Modules API.** Maintains single codebase.
- **No Firebase / Supabase migration.** Replit Postgres is the v1 datastore.
- **No third-party analytics on entry content.** Audit events only.

---

## 10. Phase 5 hand-off (what comes next)

Phase 5 carves this PRD into discrete tickets — one per file under `docs/tickets/`. Each ticket is:
- Self-contained (Replit Agent can build it without reading other tickets)
- Sized to fit a single Replit Agent session (≈30–90 min of agent work)
- References specific brand bible sections + PRD sections it implements
- Has an explicit "definition of done" + acceptance criteria
- Has an explicit list of files it should create/modify

Initial ticket count estimate: **~35 tickets** for v1.

Approximate breakdown:
- Backend foundation: 6 tickets (auth, db, base API, error handling, rate limiting, health)
- Backend domain: 7 tickets (entries, days, streaks, weekly summaries, insights, voice, AI tagging)
- Backend cron jobs: 4 tickets
- Mobile foundation: 4 tickets (Expo setup, theming/tokens, navigation, auth flow)
- Mobile onboarding: 3 tickets (welcome → tradition → cue, identity, day-0 ritual)
- Mobile daily app: 6 tickets (home, four pillar captures, voice overlay)
- Mobile other: 3 tickets (history, weekly close, settings)
- Paywall: 2 tickets (day-30 + subscription)
- Cross-cutting: ~4 tickets (i18n scaffolding, accessibility audit, App Store setup, telemetry)

Phase 6 then converts each ticket into a Replit prompt that can be pasted directly into Replit Agent.

---

## Resolved decisions (locked 2026-05-02)

User confirmed "go with your takes" — recommendations are now binding decisions:

1. **Pillar glyphs** — Claude generates SVGs from the section 6 specs as v0 in Phase 5; designer pass before public launch. Sufficient for TestFlight.
2. **Auth** — Apple Sign-In + Google Sign-In only. No email+password. Fewer support tickets, better privacy posture, faster build.
3. **Speech-to-text** — Server-side OpenAI Whisper API. Cross-platform consistency, 50+ languages out of the box (critical for Ahmad persona's Arabic). iOS-native SFSpeechRecognizer as a v1.5 perf optimization.
4. **AI tagging model** — Claude Haiku 4.5 (`claude-haiku-4-5-20251001`). Fast, cheap, strong structured-output behavior.
5. **Audience plan** — deferred. Doesn't block Phase 5 (tickets) or Phase 6 (Replit prompts). Will be addressed in a separate `docs/05-launch.md` post-build, alongside marketing-site work. The PRD's existing "share my week" object spec stays in v1 since founder-content is the most likely default channel.
