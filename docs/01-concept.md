# 01 — Concept

> Phase 1 source-of-truth. Owned by the user. Written 2026-05-02.
> Domain `4wins.me` is owned by the user. Repo branch: `claude/4wins-mobile-audit-c301p`.

---

## What 4Wins is

A daily-discipline system organized around **four life pillars**. Every day, the user commits to one "win" in each pillar. Compounded over time, the four daily wins become the operating system for a life of progress, presence, and self-respect.

The system is the user's own — built and refined over years of personal practice before being turned into a product.

---

## The four pillars

| # | Pillar | Working definition (v0 — to be refined) |
|---|---|---|
| 1 | **Physical** | Movement, nutrition, sleep — the body as the vehicle for everything else |
| 2 | **Mental** | Learning, focus, cognition — sharpen the instrument |
| 3 | **Spiritual** | Reflection, meaning, alignment with deeper purpose |
| 4 | **Financial** | Earning, saving, investing, spending with intent — freedom as a daily practice |

**Relationships / social is deliberately out of scope for v1.** Can be revisited post-launch.

---

## Why these four (the strategic case)

Most habit and wellness apps cover **one or two** of these four. Almost none cover all four — and **nobody combines wellness + finance** in a single daily ritual.

| Category | Typical apps | Pillars covered |
|---|---|---|
| Fitness | MyFitnessPal, Strong, Strava | Physical |
| Habit tracking | Streaks, Way of Life, Habitica | Generic |
| Meditation | Headspace, Calm, Insight Timer | Spiritual (loosely) |
| Learning | Duolingo, Brilliant, Anki | Mental |
| Finance | YNAB, Copilot, Monarch | Financial |
| Productivity | Notion, Todoist, Sunsama | Generic |

**4Wins occupies the empty box.** That's the wedge — a single daily ritual that touches all four pillars rather than four separate apps that never talk to each other.

The Financial pillar in particular is the differentiator. Wellness apps avoid money. Finance apps avoid wellness. Combining them in a habit-loop format is genuinely unoccupied territory.

---

## Daily ritual — locked

**Output-boxed. No time required.** One win logged per pillar per day. Length and duration are user-controlled. Timers may exist as an *optional* tool but are never enforced.

Rationale: the v0 (time-required, didn't retain) confirms what habit research already says — friction kills daily apps. The win is the *log*, not the *minutes*. A 30-second voice note that captures a Spiritual reflection is a complete win. So is a 60-minute workout. The system rewards consistency, not heroics.

Implications baked in from this decision:
- **No "you only did 12 of 15 minutes" guilt.** Either the win is logged or it isn't.
- **One-tap completion** must exist for every pillar (the lazy path).
- **Voice-first capture** is the primary input mode for Mental, Spiritual, and Financial pillars; HealthKit/auto-import for Physical.
- **Streaks count days with all four pillars logged**, not minutes accumulated.

---

## Status of the live `4wins.me`

The live site is a **prior build done in Lovable** that **did not retain users**. It is being treated as a discarded **v0** — useful only for lessons learned, not as a foundation. The mobile app we're scoping is a fresh **v1 greenfield build**, not a port.

**The v0 failure to retain is itself a research input.** The Phase 2 retention research (in flight) needs to be cross-referenced against whatever we can recover from the v0 (analytics, drop-off points, user feedback, copy that didn't land). If the user has access to the v0 codebase, GA / Plausible / Posthog data, or notes on why it failed, that's gold. Without it, we work from first principles + the retention literature.

---

## Why this concept fits mobile especially well

| Framework property | Mobile-native fit |
|---|---|
| Daily ritual | Push notifications, daily check-in screen, streak mechanics |
| Four discrete pillars | Four progress rings, four-tab home, "complete the day" loop |
| Voice input is already a feature | Mic-first capture is a phone affordance, not desktop |
| Reflection / journaling (Spiritual) | Voice-to-text journaling beats typing on the go |
| Movement (Physical) | HealthKit / Google Fit auto-import |
| Money (Financial) | Plaid / open-banking auto-categorization, screenshot capture |

If a mobile app can't pull these threads together, it's just four worse single-purpose apps in a trench coat.

---

## Open questions (to answer before Phase 4 — PRD)

1. **Live app status** — is the deployed `4wins.me` your current build? What's actually working today (auth, data model, AI, voice, payments)?
2. **Daily ritual shape** — output-boxed, time-boxed, or freeform? My recommendation: output-boxed.
3. **Pillar definitions** — the v0 working definitions above need your real version (e.g. for Financial, is it "log every transaction" or "one money decision per day"?)
4. **Monetization** — free, freemium, subscription, or bundled with a paid challenge/cohort?
5. **Existing audience** — do you have an audience to launch into (social, list, paying customers from a previous version)?
6. **Constraints** — solo build via Replit? Budget? Launch deadline? iOS-first, Android-first, or PWA?
7. **Naming** — keeping "4Wins" as the public name, or using it as internal codename only?

---

## Out of scope for v1 (explicitly)

- Relationships / social pillar (revisit post-launch)
- Multi-user accountability cohorts (Phase 2+ feature)
- Coach matchmaking / human accountability
- Wearable-only flows (phone is primary surface)
- Web-only flows (mobile is primary; web is companion if anything)

---

## Sources & links

- Domain: [4wins.me](https://4wins.me) (user-owned)
- Repo: this branch (`claude/4wins-mobile-audit-c301p`)
