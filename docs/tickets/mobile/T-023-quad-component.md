# T-023 — The Quad component

**Area:** mobile
**Estimate:** 90 min
**Depends on:** T-022
**Implements PRD:** §1 personas, §2 Flow B, brand bible §2 (the Quad)
**Brand bible:** §2, §4, §7, §9 — the central visual primitive

## Goal

Build the Quad — the four-arc glyph that is 4Wins' entire visual identity. Reusable React Native SVG component with all the states from brand §2 and the close-the-day animation from §7.

## What to build

1. `<Quad />` component (SVG via `react-native-svg`) rendering four 90° arcs of a single circle, each with a 4° gap separator.
2. **Pillar order locked:** Mental top (12 o'clock), Financial right (3 o'clock), Spiritual bottom (6 o'clock), Physical left (9 o'clock).
3. **Props:**
   - `size` — diameter in pt (default 280)
   - `state` — `{ mental: PillarState, financial: PillarState, spiritual: PillarState, physical: PillarState }` where `PillarState = 'empty' | 'in_progress' | 'complete'`
   - `isRestDay?: boolean` — when true, all arcs render as a thin dotted outline
   - `onArcPress?: (pillar) => void` — tappable
   - `closingAnimation?: boolean` — when true, plays the day-close animation
4. **Visual states (per arc):**
   - `empty`: 1.5px stroke, 40% opacity, pillar color tinted
   - `in_progress`: full opacity, animated stroke draw-on
   - `complete`: filled solid in pillar color
5. **Accessibility:** each arc has `accessibilityRole="button"` with label like "Mental, complete" or "Mental, not yet logged."
6. **Animation:** when an arc transitions empty→complete, animate stroke fill over 600-800ms with `motion.ritual`. When the fourth arc completes, run the §7 close-the-day animation (settle 0.98→1.0 over 1200ms, then haptic tick at 800ms in).
7. **Mini variant** (`<MiniQuad size={32} />`) — same component, auto-tuned stroke width for small sizes (used in weekly close screen, history screen).

## Files to create / modify

```
apps/mobile/components/Quad/
  Quad.tsx                    # main component
  MiniQuad.tsx                # tiny variant wrapper
  arc.ts                      # SVG path math
  useQuadAnimation.ts         # reanimated worklets for fill + close-day
  types.ts                    # PillarState etc.
  Quad.test.tsx               # snapshot + accessibility tests
  Quad.stories.tsx            # not Storybook; a dev-only screen
apps/mobile/app/(dev)/quad.tsx   # mounts the stories
```

## Geometry spec

Given `size = D`:
- center = (D/2, D/2)
- radius = D/2 - 12 (for breathing room at edges)
- stroke width = 6pt for size ≥ 100, scales down to 1.5pt at size = 24
- gap angle = 4° between arcs (so arcs span 86° each centered on 12/3/6/9 o'clock)
- Mental arc: center angle = -90° (top), spans -47° to -133°
- Financial arc: center = 0° (right), spans -43° to 43°
- Spiritual arc: center = 90° (bottom), spans 47° to 133°
- Physical arc: center = 180° (left), spans 137° to 223°

## Acceptance criteria

- [ ] `<Quad state={{ mental: 'empty', financial: 'empty', spiritual: 'empty', physical: 'empty' }} />` renders four faint outlined arcs in pillar colors at 40% opacity.
- [ ] One pillar `complete` → that arc renders solid in its pillar color.
- [ ] Tapping an arc fires `onArcPress(pillar)` only — taps in the gaps (or center) do nothing.
- [ ] Transitioning a pillar to `complete` triggers the fill animation (600-800ms, `motion.ritual`).
- [ ] When all four become `complete`, the close-day animation plays: settle 0.98→1.0 over 1200ms with one `Haptics.impactAsync('medium')` at 800ms in. NO bounce, NO confetti.
- [ ] `isRestDay={true}` renders all four arcs as a thin dotted outline (use `strokeDasharray`).
- [ ] `<MiniQuad size={32} />` renders correctly with proportional stroke (~1.5pt).
- [ ] Accessibility: VoiceOver announces "Quad. Mental: complete. Financial: not logged. Spiritual: in progress. Physical: not logged." or per-arc when arcs are interactive.
- [ ] Tests: snapshot for each of 8 representative state combos. Reanimated tests use `react-native-reanimated`'s test utilities.
- [ ] Dev-only `/(dev)/quad` route shows: 9 quads in a grid (empty, single-pillar variants, all complete, rest day, animating). Tappable to trigger close animation.

## Non-goals

- No interactive Lock Screen widget (v1.5 — separate ticket).
- No Watch complication (v1.5).
- No share-as-image export (T-037 weekly close may handle).
- No Quad customization (color overrides, etc.).

## Notes for the agent

- Use `react-native-svg`'s `<Circle>` with `strokeDasharray` to draw arcs cleanly:
  - circumference = 2π·radius
  - each arc = 86° / 360° × circumference
  - dasharray = "<arc_length> <full_circumference - arc_length>"
  - dashoffset = -<offset_to_start_of_arc>
  - Or alternatively, build SVG `<Path>` with arc commands (`A` syntax) — that's what most production code does because dasharray gets fiddly with multiple arcs. **Recommend Path approach.**
- For the fill animation: animate `strokeDashoffset` from full to 0 (draws on the stroke), then transition `fill` opacity from 0 to 1 at the end.
- For the close-day animation: use `useAnimatedStyle` with a shared scale value; spring to 0.98 then to 1.0.
- Haptic: `import * as Haptics from 'expo-haptics'`; `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)` exactly once at the right time. Use `setTimeout` with cleanup in useEffect to schedule.
- Don't render glyphs inside the Quad — those are separate (T-024). The Quad is just the four arcs.
- Performance: precompute the SVG paths at component init; don't recompute on every render. Memoize.
- Test on a low-end Android device — SVG rendering on Android is slower than iOS.
