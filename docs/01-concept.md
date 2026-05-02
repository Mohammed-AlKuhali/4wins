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

## Daily ritual (to be specified by the user)

Open. The framework requires a ritual but the *shape* of the daily commitment isn't locked yet:

- **Time-boxed?** (e.g. 15/45/15/15 minutes per pillar)
- **Output-boxed?** (e.g. log one win per pillar, length flexible)
- **Free-form?** (user defines their own daily rules)

Recommended for v1: **output-boxed with optional timers.** One win per pillar per day. Timers available but not required. Lower friction = better adherence.

Decision needed from user before PRD.

---

## What the live `4wins.me` does today

> Public sources describe the live app as an "AI Diet, Exercise & To-Do Coach" with voice input. To verify what's actually deployed (vs. marketing copy) we'll need a walkthrough or repo access — currently the live site is blocked from the build sandbox. **The user has confirmed they own the domain.**

Open question: is the live site's three-bucket framing ("Diet, Exercise, To-Do") your current build, or marketing positioning that hides the four-pillar model behind a more conventional fitness-app face? This affects whether v2 is a **repositioning** (same engine, fix the surface) or a **rebuild** (new engine, full four pillars).

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
