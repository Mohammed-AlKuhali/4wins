# 03 — Brand Bible

> Phase 3 deliverable. The enforceable brand spec. Every Replit prompt, every PR, every screen should be checkable against this doc.
> Compiled 2026-05-02. Inputs: `docs/01-concept.md`, `docs/02-research.md` (especially `docs/research/02c-brand.md`).

---

## 0. Brand thesis (one paragraph)

4Wins is a private daily ritual app for adults who have outgrown gamified wellness. Its visual signature is **the Quad** — a single ring divided into four arcs, one per pillar, that closes when the day is complete. Its voice is conviction without hype: short sentences, no exclamation marks, no emoji in copy, no chatbot. It uses earth tones, real serifs, and proprietary glyphs — never Vercel-purple, never Inter on white, never Lucide. The aim is to feel like an object you keep on your nightstand, not a notification you tolerate.

---

## 1. Name

| Aspect | Decision |
|---|---|
| Public name | **4Wins** |
| Domain | `4wins.me` (owned) |
| Spelling | `4Wins` — numeral + capital W, no space, in body copy and headlines. The serif treatment is what signals it as a brand, not the letterforms. |
| Internal codename | Same as public. No split. |
| Tagline | None for v1. The Quad is the tagline. *(Drop-in candidate if pressed: "Close the day.")* |
| Founder voice | First-person singular when the founder writes. The app voice is impersonal. |

The 4 in "4Wins" can echo the Quad shape in the wordmark — but the wordmark is a v1.5 polish concern. The Quad glyph alone is the launch logo.

---

## 2. The Quad — the central visual primitive

A single circle divided into **four 90° arcs**, separated by small gaps (≈4° gap each). Each arc is one pillar. Each arc fills as that pillar is completed.

```
       Mental
        ╭───╮
   ╭   /     \   ╮
   |  |       |  |   <- empty Quad (start of day)
   ╰   \     /   ╯
        ╰───╯
      Spiritual

  Physical (left arc), Mental (top arc), Financial (right arc), Spiritual (bottom arc)
```

Pillar order around the Quad — clockwise from top:
1. **Mental** (top, 12 o'clock)
2. **Financial** (right, 3 o'clock)
3. **Spiritual** (bottom, 6 o'clock)
4. **Physical** (left, 9 o'clock)

This order is intentional: Mental wakes you up, Physical closes the loop. The two "internal" pillars (Mental, Spiritual) are vertical; the two "external" pillars (Financial, Physical) are horizontal. It's symmetrical and memorable.

**States of the Quad:**

| State | Visual |
|---|---|
| Day not started | All four arcs at 1.5px stroke, low-opacity (40%), pillar color tinted |
| Pillar in progress | That arc strokes at full opacity, animated stroke-fill |
| Pillar complete | That arc fills solid in pillar color |
| Day complete | All four arcs solid, **subtle settle animation** (no bounce), single haptic tick at lock-in |
| Rest day (auto-applied freeze) | Arcs render as a thin dotted outline. Not "failed." Not "empty." |

**The Quad is also:**
- The app icon (just the four-arc shape, no wordmark)
- The launch screen
- The home-screen widget content
- The watch complication (in v1.5)
- The share-to-screenshot object ("here's my week")

Apple owns three concentric rings. **We own four arcs of one ring.**

---

## 3. Voice & tone

### Voice attributes

| Yes | No |
|---|---|
| Direct | Marketer-y |
| Plainspoken | Hype-y |
| Considered | Casual |
| Warm but not familiar | Buddy-buddy |
| Slightly literary | Lorem-ipsum |
| Conviction-grounded | Cheerleading |
| Cal Newport, Apple Fitness, Headspace-in-app | Duolingo, Fabulous, "Aria the AI Coach" |

### Hard rules

- **Short sentences.** Default to under 12 words. Pause. Then keep going if needed.
- **No exclamation marks.** Anywhere. Period.
- **No emoji in app copy.** Emoji are decorations; this brand does not decorate.
- **No "✨".** Special offender.
- **No greeting names.** Never "Hey [Name] 👋" or "Welcome back, friend." Just "Good morning." Or nothing.
- **No "AI Coach" persona.** No name, no avatar, no chat bubble. If AI surfaces something, it's the system speaking, briefly, without a face.
- **No cheerleading.** "You got this." "Crushing it." "Way to go." All banned.
- **No guilt.** "Don't break your streak." "Are you sure you want to leave?" Banned.
- **No filler.** "Easily" "seamlessly" "effortlessly" "powerful." Cut on sight.
- **No "[verb] better, [verb] faster" headlines.** That entire grammar is banned.

### Sample copy (use these as anchors when prompting)

**Onboarding — opening screen (no illustration, full-bleed serif type, 40/48):**

> Discipline isn't motivation.
> It's a decision you make once,
> and keep making.

**Onboarding — the four pillars:**

> Four wins. Every day.
> Mental. Financial. Spiritual. Physical.
> Tomorrow, all four again.

**Onboarding — tradition selection (Spiritual pillar):**

> Your Spiritual win can draw from a tradition,
> or from your own thinking.
> You can change this anytime.
>
> [Christian] [Stoic] [Buddhist] [Secular] [Custom]

**Onboarding — cue binding:**

> When will you do this?
>
> After my morning coffee.
> Before I open my laptop.
> When I close my laptop.
> Before bed.
>
> [Pick one — change it later]

**Onboarding — first complete day (the Day-0 Zeigarnik close):**

> You closed your first Quad.

(That's the entire celebration. No confetti. The Quad fills, the haptic ticks, the screen settles. One sentence below.)

**Home screen — start of day:**

> Good morning.
> Today's Quad is open.

**Home screen — three of four done:**

> One left.

**Home screen — day complete:**

> Closed.

**Pillar capture — Mental (default):**

> What did you learn today?

**Pillar capture — Mental (lazy path button):**

> [Skip the prompt — log a tiny Mental win]

**Pillar capture — Financial:**

> Did your money behavior today
> match the person you're becoming?
>
> [Yes] [Not quite] [Not today]

(That's it. No transactions. No screen of input fields. Three taps.)

**Pillar capture — Spiritual (Stoic track):**

> What's in your control today,
> and what isn't?

**Pillar capture — Spiritual (Christian track):**

> What are you grateful to God for today?

**Pillar capture — Spiritual (Buddhist track):**

> What did you notice without attaching to it?

**Pillar capture — Spiritual (Secular track):**

> What matters today
> beyond what's urgent?

**Pillar capture — Physical (HealthKit detected movement):**

> You moved today. Logged.

**Pillar capture — Physical (no movement detected):**

> Move your body. One minute counts.
>
> [Logged] [Tell me what I did →]

**Push notification — first one, 24h after install:**

> Coffee's brewing.
> Your 4Wins is ready.

**Push notification — afternoon nudge if Quad is half-open:**

> Two of four. Ten minutes.

**Push notification — missed yesterday:**

(Nothing the day they miss. The next morning, only:)

> Today is a new day.

**Auto-applied streak freeze:**

> Yesterday was a rest day.
> Today is open.

**Weekly close (Sunday evening):**

> The week closed.
> Six of seven days complete.

**Paywall (day 30):**

> This is your first month.
> Here's what 30 days of you looks like.
>
> [3 cross-pillar insight cards]
>
> The next eleven months are paid.
> $79 a year. No card needed for the trial.
>
> [Continue free with 30-day history] [Start trial]

**Error — network:**

> We can't reach the server.
> Your day is saved on this phone.

**Error — voice transcription failed:**

> We didn't catch that.
>
> [Try again] [Type instead]

**Error — auth failed:**

> Try that again. We'll wait.

**Settings — sign out:**

> Sign out

(No confirmation modal. No "Are you sure?" Just signs out. The data syncs back when they sign back in.)

---

## 4. Color

All values are working v0. Designer should refine in pass 1.

### Base

| Role | Hex | Notes |
|---|---|---|
| Off-black (primary dark) | `#0E0E0C` | Warm. Not pure `#000`. |
| Off-white (primary light) | `#FAF7F2` | Paper-warm. Not pure `#FFF`. |
| Mid-gray (secondary text) | `#6B6864` | Warm gray, not slate. |
| Dim (tertiary, hint) | `#A29F9A` | |
| Hairline | `#2A2826` (dark) / `#E8E3DC` (light) | Borders, dividers. |

### Pillar accents — earth tones

Used **only** as a ring/dot/underline accent. Never as a background fill. Each pillar has one canonical hue, used at full saturation in the Quad and at 40% opacity in the empty state.

| Pillar | Name | Hex | Where it appears |
|---|---|---|---|
| **Mental** | Ink slate | `#2E4156` | Mental arc of Quad, mental glyph stroke |
| **Financial** | Burnished bronze | `#7C5F26` | Financial arc, financial glyph stroke |
| **Spiritual** | Parchment / bone | `#B8A47E` | Spiritual arc, spiritual glyph stroke |
| **Physical** | Terracotta | `#A04428` | Physical arc, physical glyph stroke |

Notes:
- These are deliberately *not* primary-color saturated. They sit close together on the warm-earth wheel except Mental, which goes cool-blue to anchor the set.
- All four pass WCAG AA contrast on both off-black and off-white at 1.5px stroke at 24px size.
- For a color-blind safety check: each pillar is *also* identified by its glyph and arc position, so color is never the sole signifier.

### Forbidden colors (the AI-tell list)

- `indigo-500` (`#6366F1`) and any close neighbor
- `violet-500` (`#8B5CF6`)
- `fuchsia-500` (`#D946EF`)
- Any `135deg, indigo-500 → violet-500 → fuchsia-500` linear gradient
- Pure `#FFFFFF` and pure `#000000` as backgrounds
- `slate-600` (`#475569`) — the AI default body-text color
- Mesh gradient blobs as background (`mix-blend-mode: screen` orbs)
- Radial dotted-grid backgrounds

### Dark / light handling

- **Dark-first.** Default is off-black ground. Daily ritual app, often used at night or first thing in the morning.
- **Auto-switch to light at midday** based on local time. Apple Fitness does this on Watch.
- User can override (Settings → Always dark / Always light / Auto).
- Pillar accents are the same hex in both modes — they sit on the warm/cool axis well enough.

---

## 5. Type

### Families

| Role | Family | License | Why |
|---|---|---|---|
| Display & headlines | **Fraunces** (Variable) | OFL — open-source via Google Fonts | Humanist serif with personality. Sits between Tiempos and Inter — written, considered, modern. Not a typewriter serif (Source Serif 4) and not a magazine serif (Tiempos). |
| Body & UI | **IBM Plex Sans** | OFL — open-source | Strong character without being trendy. Avoids the Inter / Geist / Satoshi axis entirely. Multiple weights. |
| Numerals & code | **IBM Plex Mono** | OFL — open-source | Tabular, monospaced. Used for streak counts, day numbers, pillar progress. |

**Forbidden faces:** Inter, Geist Sans, Satoshi, Clash Display, DM Sans, anything labeled "Inter-like."

### Scale (mobile, base 17/24)

| Role | Size / Line | Family / Weight |
|---|---|---|
| Display | 40 / 48 | Fraunces Light, slight tracking-tight |
| Headline | 28 / 36 | Fraunces Regular |
| Title | 22 / 28 | Fraunces Regular |
| Body | 17 / 24 | Plex Sans Regular |
| Body emphasis | 17 / 24 | Plex Sans Medium |
| Caption | 13 / 18 | Plex Sans Regular |
| Numeric large | 32 / 36 | Plex Mono Regular, tabular figures |
| Numeric inline | 17 / 24 | Plex Mono Regular, tabular figures |

### Type rules

- **Pillar capture screens are Fraunces, large.** The prompt is the screen. Typography is the UI.
- **Body UI is Plex Sans Regular at 17px.** No 14px body — legibility on a daily app matters.
- **Numerals are always tabular.** Streak counts, week-of-year, day counts — all monospaced so they don't shift on changes.
- **No drop caps. No italics for emphasis.** Use weight (Regular → Medium) for emphasis. Italics reserved for true tone shifts (book titles, foreign words).

---

## 6. Iconography

### The four pillar glyphs

Each pillar has one custom glyph drawn on a 24px grid, with a filled and outlined variant. Stroke 1.5px on outlined. The glyphs are **geometric primitives, not metaphors** — no dumbbell for Physical, no brain for Mental.

> *These are descriptive specs. A designer must draw them in pass 1 (Phase 3.5). The descriptions are precise enough for a competent illustrator to produce a first draft.*

| Pillar | Glyph spec | Concept |
|---|---|---|
| **Mental** | A hollow square (16×16 inside a 24px frame) with a single dot at its geometric center. Filled variant: dot grows to fill ⅓ of the square. | Attention focused inside a frame. Mind in a vessel. |
| **Financial** | A small square (8×8) inset within a larger square (16×16) within the 24px frame. Filled variant: inner square fills solid. | Containment. Value within structure. Not a coin. |
| **Spiritual** | A single open arc — half-circle opening upward — drawn at the top of the 24px frame. Filled variant: arc closes into a complete circle. | The incomplete becoming whole. Bowl, not halo. |
| **Physical** | Two parallel horizontal bars in the lower half of the 24px frame, slightly offset. Filled variant: bars become a single thicker filled rectangle. | Ground. Foundation. Not a body, not a dumbbell. |

The glyphs are also the pillar's "loading state" — the outlined variant draws on, fills in, settles.

### Other iconography

- **Nav chrome (back, close, settings, ellipsis):** SF Symbols on iOS, Material Symbols Outlined on Android. These are platform-native, not branded — they should fade into the OS.
- **Anywhere else:** custom 1.5px stroke icons, never Lucide / Heroicons. If we don't have a custom version, we don't use that icon.
- **No duotone icons.** No 3D / isometric icons. No hand-drawn illustrations of people at laptops.

---

## 7. Motion

### Tokens

| Token | Spring (response, dampingFraction) | Use |
|---|---|---|
| `motion.subtle` | `0.4, 0.9` | Sheet open, minor state changes |
| `motion.default` | `0.5, 0.85` | Most state transitions |
| `motion.ritual` | `0.7, 0.8` | Pillar arc fill, day-close animation |
| `motion.entrance` | `0.5, 0.9` | First-time content appearance |

(SwiftUI / React Native Reanimated values. Translate to platform equivalents if needed.)

### The "close the day" animation (the most important moment in the app)

When the user completes the fourth pillar:

1. **0–800ms:** the fourth arc strokes on at `motion.ritual`, pillar color saturating from outline to fill.
2. **At 800ms:** a single haptic tick (UIImpactFeedbackGenerator.medium / RN Haptics impactMedium). One. Not multiple.
3. **800–1200ms:** the entire Quad settles — the four arcs scale 0.98 → 1.0, no bounce, easing out.
4. **At 1200ms:** the word "Closed." appears below in Fraunces Light 40/48, fading in over 400ms.
5. **2400ms total:** screen settles. No further animation. No celebration audio. No confetti.

The whole moment lasts ~2.4 seconds. The user can dismiss at any time.

### Forbidden motion

- Confetti / particle effects of any kind.
- Bounce on completion (`spring(damping: 0.4)` and below).
- Carousel-with-dots onboarding swipes.
- Pull-to-refresh elastic on daily ritual screens.
- Skeleton loaders that "shimmer" — use a single subtle pulse instead.
- "Lottie celebration" animations.
- Gradient animation on text.
- Anything resembling Duolingo's owl mascots.

---

## 8. Layout & UX patterns

### Home screen (the daily surface)

- **Single state-of-today hero.** The Quad fills the upper half of the screen.
- **No tab bar.** No bottom navigation. Settings live behind a single icon top-right.
- **Below the Quad:** the next un-done pillar as a single CTA in Fraunces. Tap → full-screen pillar capture.
- **Below that:** today's date and one line of context if the user has logged any pillars yet ("Two of four. 14 minutes total today.")
- **No streak number on home.** Streak lives in the widget.
- **No notifications about what to do.** The Quad shows the state. The state is the prompt.

### Pillar capture screen

- **Full-bleed.** Fraunces prompt at the top. No nav chrome except a small close-X top-left.
- **Voice-first.** A large mic button is the primary action. Auto-transcribes, AI auto-tags by pillar (cross-pillar in case the user said something that fits a different pillar — the system gently asks if so).
- **Keyboard secondary.** Tap anywhere on the prompt to switch to typing.
- **One-tap "lazy path" exists for every pillar.** A small button below: "[Log a tiny Mental win]" — completes the pillar with no input.
- **No formatting toolbar. No attachments in v1.** This is reflection, not Notion.

### Settings

- Single screen, stacked groups.
- No "Profile" tab. No avatar.
- Account email is not displayed prominently — this is a private app, the user knows who they are.
- All settings in one screen, no nested menus more than one level deep.

### Forbidden patterns

- Bottom tab bar with five icons.
- Separate "Profile" tab.
- Modal sheets with drag handles for primary actions.
- Carousel onboarding with dot pagination.
- Swipe-to-delete on a daily ritual.
- "Are you sure you want to leave?" confirmation on app close.
- A search bar at the top of the home screen.
- An empty state that shows an illustration of a person at a laptop with a coffee.

---

## 9. The rejection list (the enforceable AI-tell checklist)

Every PR / Replit prompt should be checkable against this. If any of these appear, the work is sent back.

### Visual

- ☐ No `indigo-500`, `violet-500`, `fuchsia-500` colors anywhere.
- ☐ No `linear-gradient(135deg, ...)` anywhere.
- ☐ No mesh gradient blob backgrounds.
- ☐ No radial dotted-grid backgrounds.
- ☐ No `bg-white` + `text-slate-600` body copy.
- ☐ No Inter, Geist, or Satoshi as a typeface.
- ☐ No bento grid layouts.
- ☐ No Lucide / Heroicons / Tabler in product surfaces.
- ☐ No unDraw / Storyset / Lummi illustrations.
- ☐ No three-feature row card layout.
- ☐ No emoji as decoration.

### Verbal

- ☐ No exclamation marks.
- ☐ No "✨".
- ☐ No "Hey [Name] 👋".
- ☐ No "Build [thing] [adverb] with [emotion]" headlines.
- ☐ No "Get Started" buttons (use specific verbs).
- ☐ No "manifest / unlock / level up / crush it / amplify".
- ☐ No "amigo / bestie / friend / buddy" in the address.
- ☐ No "you got this" cheerleading.
- ☐ No "Don't break your streak!" guilt copy.
- ☐ No "Are you sure you want to leave?" guilt modals.
- ☐ No "AI Coach" persona name.
- ☐ No chatbot UI for any reflection or pillar capture.

### Interaction

- ☐ No bottom tab bar with five items.
- ☐ No separate Profile tab.
- ☐ No pull-to-refresh on a daily ritual screen.
- ☐ No carousel onboarding with dot pagination.
- ☐ No badges, levels, XP, or "Spiritual Warrior" titles.
- ☐ No leaderboard.
- ☐ No public sharing as default.
- ☐ No streak freeze IAP.
- ☐ No bounce animations on completion.
- ☐ No confetti or particle effects on completion.

---

## 10. How to use this document

1. **In every Replit prompt**, paste the section relevant to what you're asking for. For UI: section 4 (color), 5 (type), 8 (layout). For copy: section 3 (voice). For motion: section 7. For "is this thing on-brand?": section 9.
2. **Before merging any PR**, run the rejection list (section 9) against the diff. Anything checked off is a blocker.
3. **When in doubt, look at:** Apple Fitness Today view, Linear's Issue panel, Stoic's morning prompt screen, Things 3's Today view. Those are the four reference apps.
4. **When this doc is wrong**, update it before changing the code. The doc is the source of truth.

---

## 11. Phase 3.5 — what's NOT in this doc yet

These are next, post-v1-decision:

- **Drawn glyphs.** The four pillar glyphs need a designer to actually draw them (specs in section 6 are precise but not visual).
- **Logo / wordmark.** "4Wins" set in Fraunces with an integrated Quad treatment. v1 launches with the Quad-only mark.
- **Marketing site language.** This bible covers the app. The marketing voice can be slightly more declarative (Linear-leaning) but follows all the same rules.
- **App Store screenshots.** Six screenshots, sequence: Quad mid-day → pillar capture → tradition selection → cross-pillar insight → widget → "closed." Each in Fraunces, no marketing copy overlaid except a single line per shot.
