# 01 — Concept (what 4Wins actually is)

> Source-of-truth for everything downstream. Phase 1 of the mobile-app track.
> Compiled 2026-05-02 from public sources (live site is blocked from our build sandbox; findings are from search-indexed pages — to be verified against the live app once accessible).

---

## TL;DR

**4Wins** is a daily-discipline framework created by **Jun Yuh**. The promise: every day, you complete one "win" in each of four life pillars. Do that consistently and you compound into the person you want to become.

The framework already exists in three commercial forms:

| Surface | What it is |
|---|---|
| **Notion template** (`junyuh.me/products/4wins-notion`) | Self-serve tracker for the four daily wins |
| **The Challenge** (`junyuh.me/pages/challenge`) | Paid cohort program with 15+ accountability coaches |
| **`4wins.me` app** | AI-powered "Diet, Exercise & To-Do Coach" with voice input and daily progress |

The mobile app we're scoping is the next evolution of the third surface.

---

## The four pillars (the actual product)

Each day, the user is supposed to do all four:

| # | Pillar | Time | Activity | Emoji used in the brand |
|---|---|---|---|---|
| 1 | **Mental win** | 15 min | Learn something new | 🧠 |
| 2 | **Physical win** | 45 min | Move your body | 🫀 |
| 3 | **Spiritual win** | 15 min | Reflect / align with deeper purpose | 🙏🏼 |
| 4 | **Accountability win** | 15 min | Journal strengths + growth areas; track progress | ✅ |

**Total daily commitment: 90 minutes.** That number is the product. Anything we build needs to make 90 min/day feel doable, not punishing.

Brand language: "Win the day or pay." "Cut out the distractions and focus on you." "You are worth investing in." It's high-conviction, no-excuses, masculine-leaning self-improvement — adjacent to David Goggins / Hormozi / Modern Wisdom audience, but more compassionate in tone.

---

## Important tension to resolve early

The live `4wins.me` markets itself as **"Diet, Exercise & To-Do Coach"** with three buckets (meals / workouts / to-dos). That's a **collapsed** version of the framework — Diet + Exercise are both Body, "To-Do" is generic, and **Mental + Spiritual + Accountability are missing** from the headline product.

This is either:
- (a) a deliberate narrowing for App Store positioning,
- (b) a still-incomplete product that hasn't shipped the full framework yet, or
- (c) a separate "lite" offering distinct from the Challenge.

**Strategic implication for our mobile app:** if we're rebuilding/extending it, the highest-leverage move is probably to **express all four pillars natively** (not just the two that fit conventional fitness apps). The whole *brand differentiation* comes from Spiritual + Accountability — those are what no other habit/fitness app does, and they're already proven via the Challenge.

This is the first real product decision and it should be made before anything else.

---

## What we know about the existing app surface

From public copy — to be verified once we have access:

- AI-mediated input (e.g. "I had eggs and oatmeal" → logged as meal)
- **Voice input** as a primary affordance
- Daily progress view
- Domain: `4wins.me` (live)
- Privacy policy + iOS app exists historically (`apps.apple.com/.../id1411828384` — older "4Wins: Align Four Wins")
- Support is hosted on `support.junyuh.me`

Things we **don't yet know** and need to confirm:

- Pricing / monetization model (subscription? one-time? free w/ Challenge upsell?)
- Auth model (email? Apple? Google?)
- Whether community / cohort / coaches are inside the app or external (Discord/Slack/etc.)
- Whether streaks, reminders, or push are implemented
- Whether the app is web-first (PWA), native, or hybrid today
- Data model (where wins are stored, sync, export)

---

## Existing audience (this is a launch advantage)

- Jun Yuh's social presence (TikTok `@jun_yuh` — discipline content with high engagement)
- Notion-template customers (already opted in, already paying)
- Challenge alumni (already living the framework, ideal beta cohort)
- "Discipline Mentorship" customers (highest LTV segment)

A new mobile app should be designed to **graduate** these existing users in, not start cold. That changes onboarding, pricing, and feature priorities.

---

## Why this concept fits mobile especially well

| Framework property | Mobile-native fit |
|---|---|
| Daily ritual, time-boxed | Push notifications, daily check-in screen, streak mechanics |
| Four discrete activities | Four-tab home, four progress rings, "complete the day" loop |
| Voice as input | Mic-first capture is a phone affordance, not a desktop one |
| Reflection / journaling | On-the-go capture; voice-to-text journaling beats typing |
| Accountability | Social/cohort feeds, share-streak, opt-in public profile |
| Movement | HealthKit / Google Fit, automatic detection, no manual entry |

If a mobile app can't pull these threads, it's just a worse Notion template.

---

## Open questions the user must answer before Phase 2

1. **Ownership / IP:** Are you Jun Yuh, working with him, licensed by him, or building independently? This single answer changes the entire project (brand, name, copy, defensibility).
2. **Scope:** Are we replacing `4wins.me`, building a v2, or building a separate companion app?
3. **Pillars:** Do we ship all four (Mental, Physical, Spiritual, Accountability) or honor the existing 3-bucket framing?
4. **Monetization:** Free / freemium / subscription / Challenge-bundle?
5. **Existing assets:** Do you have access to the current code, designs, copy, or analytics?

---

## Sources

- [4wins.me — landing](https://4wins.me/)
- [Jun's 4Wins Notion Template](https://junyuh.me/products/4wins-notion)
- [The Winning Formula](https://junyuh.me/pages/winning-formula)
- [Jun Yuh Challenge](https://junyuh.me/pages/challenge)
- [Discipline Mentorship](https://junyuh.me/pages/discipline-mentorships)
- [Support: What's included in 4Wins](https://support.junyuh.me/hc/en-gb/articles/16457132688668-What-s-included-in-4Wins)
- [Support: What is 4Wins for](https://support.junyuh.me/hc/en-gb/articles/16457226982300-What-is-4Wins-for)
- [TikTok — @jun_yuh, the four daily wins](https://www.tiktok.com/@jun_yuh/video/7424568976157543711)
- [App Store — 4Wins: Align Four Wins (older app, id1411828384)](https://apps.apple.com/us/app/4wins-align-four-wins/id1411828384)
