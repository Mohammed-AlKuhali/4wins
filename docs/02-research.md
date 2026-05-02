# 02 — Research Synthesis

> Phase 2 deliverable. Synthesizes three parallel research streams (retention psychology, competitive teardown, brand language) into concrete product decisions.
> Raw reports: [02a-retention.md](./research/02a-retention.md) · [02b-competitive.md](./research/02b-competitive.md) · [02c-brand.md](./research/02c-brand.md)
> Compiled 2026-05-02.

---

## TL;DR

4Wins wins by being **the one daily ritual app that combines wellness with finance**, expressed through a single four-arc visual primitive that lives mostly on the lock screen and watch face — not the app itself. The brand voice is Cal Newport (conviction without hype). The Spiritual pillar branches by user-selected tradition. The Financial pillar is a mindset check, not a transaction tracker. Streaks are humane, not weaponized. The whole ritual takes 90 seconds on a low-motivation day.

The biggest competitive risk is Apple shipping four-pillar Journal — so the moat is **finance** (Apple won't go there) plus **voice-first pillar auto-tagging** (nobody does it).

---

## What we're building (locked-in decisions)

These are decisions I'm proposing as locked based on the research. Push back on any of them.

### Product shape

| # | Decision | Why |
|---|---|---|
| 1 | **One daily ritual, four pillars, 90 seconds floor.** | Fogg B=MAP. Anything longer than 90s on a low-motivation day dies. v0 (time-required) confirms this empirically. |
| 2 | **Output-boxed, never time-boxed.** Already locked in `docs/01-concept.md`. | Friction kills daily apps. The win is the *log*, not the minutes. |
| 3 | **Voice-first capture for Mental, Spiritual, Financial.** Auto-imported HealthKit/Health Connect for Physical. | No competitor has voice-first auto-pillar-tagging. This is a moat candidate. |
| 4 | **AI auto-tags voice notes by pillar.** "I went for a run" → Physical. "I prayed" → Spiritual. "I skipped the latte" → Financial. | Removes the cognitive load of "which bucket?" Closest precedent: Apple Journal Suggestions, but single-pillar. |
| 5 | **Tradition routing on Spiritual at onboarding.** One question: "What tradition, if any, do you want this to draw from?" Options: Christian / Stoic / Buddhist / Secular / Custom. Route content accordingly. | Per retention research, this is the single highest-leverage retention move for a multi-tradition product. Never mix metaphors mid-session. |
| 6 | **Financial pillar = mindset check, NOT transactions.** "Did your money behavior today match the person you're becoming?" — binary. Once a week: opt-in "tiny commitment" prompt (Save More Tomorrow framing — future, not current). | Behavioral finance research is unambiguous. Loss-framed transaction nagging churns users. We are not a budgeting app. |
| 7 | **Identity-first onboarding, not goal-first.** "Who are you becoming?" not "What goals?" | Atomic Habits, identity-based change. Goal-based onboarding is the v0 failure mode. |

### The visual primitive

| # | Decision | Why |
|---|---|---|
| 8 | **The "Quad" — a four-arc / four-segment glyph as the central visual.** Apple owns three concentric rings; we own *the four-arc shape*. Open shape on home screen, complete-shape on widget when day closes. | Zeigarnik. The shape is the product. Watch-complication-shaped from day one. |
| 9 | **Pillars carry color; the rest is monochrome.** Warm off-black + paper off-white base. Each pillar has one muted earth-tone accent (Physical = clay, Mental = ink, Spiritual = bone, Financial = oxidized copper). Used as ring/dot/underline only — never background. | "Pillar-coded restraint." Avoids both indigo-AI tell and Skittles-gamification feel. |
| 10 | **Custom proprietary glyph per pillar.** Filled + outlined variant on a 24px grid. Things-3-style ownable iconographic dialect. | "Don't pull from Lucide." Single biggest "feels considered" lever. |

### Streak + retention mechanics

| # | Decision | Why |
|---|---|---|
| 11 | **Streak begins on day 2, not day 1.** Auto-grant 2 streak freezes per month. Frame missed days as "rest days," never as failure. | Lally et al. 2010 — missing one day doesn't impair habit formation. Saying so out loud in the UI is the brand promise. |
| 12 | **De-emphasize streak number after week 2.** Show *cumulative completions* ("You've shown up 47 times") as the primary metric. Streak count moves to widget only. | Long streaks shift motivation extrinsic (overjustification) and trigger compulsive shame loops. |
| 13 | **Never sell streak freezes as IAP.** | Monetizing streak anxiety is the Duolingo move; it betrays the brand premise. Free-tier feature. |
| 14 | **Day 0 ships a complete, partially-filled Quad.** During onboarding the user does one tiny version of each pillar so their first sight of "their" 4Wins is partially complete (commitment-consistency hook + Zeigarnik). | They never see an empty shape. |
| 15 | **First push notification fires ~24h after install, anchored to user-declared cue, invitational copy.** Default: "Coffee's brewing? Your 4Wins is ready." Never "Don't break your streak!" Cap at 1 push/day v1. | Airship benchmarks + Pushwoosh data. Onboarding-set notification preferences cut opt-out 45%. |

### Distribution surfaces (where the product actually lives)

| # | Decision | Why |
|---|---|---|
| 16 | **Standard home-screen widget primary in v1.** Interactive Lock Screen widget (iOS 17+) deferred to v1.5 — requires Swift via Expo Modules API, not worth blocking v1 launch on. | Streaks app pattern. "Log-in-and-leave" is the entire premise. The Quad-of-the-day widget covers 80% of the surface value. |
| 17 | **Apple Watch complication deferred to v1.5.** Add when retention data shows the at-a-glance use case is real. | Same Swift/Expo Modules constraint as #16. Not a moat we can validate before launch. |
| 18 | **Weekly close, not just daily.** 7-segment week visualization that closes on Sunday. Multiplies closure events without inflating effort. Natural fresh-start landmark every Monday. | Dai/Milkman/Riis 2014 — fresh-start effect drives reactivation. |

### Pricing

| # | Decision | Why |
|---|---|---|
| 19 | **$7.99/mo or $79/yr.** 14-day free trial, no credit card required. | $69.99 wellness Schelling + 30% finance premium. Sunsama-style no-CC trial is a trust signal worth copying. RevenueCat shows 17–32 day trials convert 42.5% vs 25.5% for <4-day. |
| 20 | **Free tier is real, not a paywall trap.** Free includes: full daily ritual on all four pillars, Quad widget, 30-day history. Paid unlocks: AI voice auto-tagging, cross-pillar correlation insights, watch complication, full history, tradition packs beyond default Secular. | "The daily hook is free; depth is paid" (Brilliant pattern). Paywalling the basic ritual would betray the brand. |
| 21 | **Conversion trigger: the 30-day insight.** At day 30, the user sees their first cross-pillar correlation report (e.g. "Your Spiritual streak correlates with your Financial wins"). That report — the entire pitch of the app — is paywalled. By day 30 the data is the upsell. | Daylio-style stats paywall, plus the unique cross-pillar insight nobody else has. |

---

## What we're explicitly NOT building (anti-features)

These are tempting but the research says don't.

1. **No bank/Plaid integration in v1.** Financial = mindset, not transactions. Adding banks turns this into a worse Copilot. Revisit in v2 only if the mindset version is winning.
2. **No leaderboard. No social feed. No friends. No public sharing as default.** Private-by-default. Spiritual + Financial practice ≠ Strava.
3. **No named "AI Coach" persona.** No "Hey, I'm Aria, your wellness companion ✨." If AI helps, it's invisible and unnamed.
4. **No chatbot UI for journaling.** Turns sacred practice into customer support.
5. **No badges, levels, XP, "Spiritual Warrior" titles.** Gamification is the wrong loop for this product.
6. **No emoji in app copy.** No "Hey, [Name] 👋" greetings. Address the user as a serious adult.
7. **No purple gradient. No mesh blobs. No bento grid. No Inter on white. No radial dotted grid background.** Visual AI tells.
8. **No confetti on completion.** Confetti for a Spiritual reflection is desecration. One dignified ring-close animation, period.
9. **No tab bar with 5 icons. No separate Profile tab.** Settings live behind a single icon.
10. **No "Are you sure you want to leave?" guilt modals. No "Your streak is in danger!" pushes.** The app does not negotiate for engagement.
11. **No Relationships pillar in v1** (already locked). Revisit post-launch.
12. **No web/desktop client in v1.** Mobile-only. Phone is where this lives.

---

## The two remaining open strategic decisions

Stack is now locked (Replit + Expo, see section A below). These two I cannot decide for you.

### A. Stack — Replit + Expo (locked, with one v1.5 caveat)

**Decision: Replit Agent + Expo + React Native for the full app, iOS + Android together.** Replit's "Text-to-TestFlight" flow handles build/sign/submit. Standard home-screen widget (the Quad of the day) is included. HealthKit/Health Connect via Expo health modules. Voice capture + AI tagging + auth + paywall + all four pillars build end-to-end inside Replit.

**The one caveat — pushed to v1.5:**

| Feature | Why deferred |
|---|---|
| **Interactive Lock Screen widget (iOS 17+)** | Requires Swift via Expo Modules API. Doable, but adds native-build complexity not worth blocking v1 launch on. The standard home-screen widget covers 80% of the surface value. |
| **Apple Watch complication** | Same — Swift via Expo Modules. Add when retention data shows the at-a-glance use case is real. |

This means **Decision #17** (Watch complication on day 1 of public launch) moves to **v1.5**, and **Decision #16** (Lock Screen as primary surface) downgrades to **standard widget primary in v1, interactive widget in v1.5**. Everything else in this doc stands.

Net: cross-platform iOS + Android from day 1, single Replit workflow, faster iteration. Native Swift modules added later without rewriting the app.

### B. Audience — where do v1 users come from?

The v0 (Lovable) didn't retain, and the user has no analytics from it. There's no built-in audience like Jun Yuh's 8M followers. So v1 needs a distribution plan from day 0:

- **Founder content** (TikTok/X/YouTube — "Building 4Wins in public" works because the framework itself is shareable)
- **Beta cohort** (50–100 hand-picked friends + people in the user's network — same week-1 retention rate, but smaller sample reveals problems faster)
- **Partner with one creator in the discipline space** (parasocial trust + their pre-existing audience)
- **App Store + Product Hunt at v1.0** (one-shot launches; not a strategy, a moment)

This isn't a Phase 2 deliverable, but it should drive v1 priorities — e.g. if founder content is the channel, the app needs a "share my week" object that looks beautiful in a screenshot.

### C. iOS-first vs cross-platform

If we go A2 (native iOS), Android is v1.5 or v2. That's a 50%+ market trade-off. Worth the moat?

My read: **yes, for v1.** The product premise depends on Lock Screen + Watch surfaces. Android has interactive widgets too but the engagement is lower; Wear OS marketshare is small. iOS-first lets us nail the experience; Android port is mechanical once the SwiftUI patterns are locked.

But this is a real call you should make with your eyes open.

---

## What gets built in Phase 3 (Brand)

`docs/03-brand.md` will be the brand bible:

1. **The name decision** — keep "4Wins" public, or use it as internal codename only? Recommendation: keep as public name (you own the domain, it's short, the framework names itself). Resist the urge to rebrand mid-build.
2. **Logo direction** — the Quad glyph is also the logo. Four arcs = wordmark + symbol in one.
3. **Voice & tone document** — Cal Newport-pegged. Sample copy across home screen / onboarding / push / paywall / error states.
4. **Palette** — final earth tones per pillar + base off-black/off-white. Hex values locked.
5. **Type system** — Fraunces (display) + IBM Plex Sans (body) + IBM Plex Mono (numerals) as a working starting point. Open-source so Replit/SwiftUI can ship them.
6. **Iconography** — four pillar glyphs drawn (or specced if no design tool yet).
7. **Motion principles** — spring values + completion animation specs.
8. **A "rejection list"** — explicit list of every visual/verbal AI tell the brand will not use.

I can write Phase 3 as a draft for you to react to. Faster than asking 30 questions.

---

## Sources

All inline-cited in the three raw research reports under `docs/research/`.
