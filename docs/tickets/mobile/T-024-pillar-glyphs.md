# T-024 — Four pillar glyph SVGs

**Area:** mobile
**Estimate:** 60 min
**Depends on:** T-022
**Implements PRD:** §0 resolved decision #1, brand bible §6
**Brand bible:** §6 — geometric primitives, not metaphors

## Goal

Generate v0 SVG components for the four pillar glyphs from brand §6 specs. These appear in the home screen pillar list, history detail, and pillar capture screens. Designer will refine in pass 1 before public launch.

## What to build

1. Four `<svg>` components, one per pillar, each on a 24×24 grid.
2. Each component supports a `variant` prop: `'outlined' | 'filled'`. Outlined uses 1.5px stroke; filled uses solid shapes.
3. Color is inherited from the parent's `tintColor` / passed `color` prop (defaults to current theme text color, NOT the pillar accent — the pillar accent is for the Quad arcs only).
4. A barrel `<PillarGlyph pillar="mental" variant="outlined" size={24} />` for ergonomic usage.
5. Tests: snapshot per variant, accessibility label per pillar.

## Glyph specs (from brand bible §6 — translate to SVG)

### Mental
- Outlined: a hollow square (16×16 inside the 24px frame, centered). Stroke 1.5. A 2px-radius dot at the geometric center, filled.
- Filled: same square outline, but the center dot grows to a 4×4 filled square that's ⅓ the inner area.

### Financial
- Outlined: a square (16×16 outline, centered). Inside it, a smaller square (8×8 outline, centered).
- Filled: outer square outlined, inner square filled solid.

### Spiritual
- Outlined: a half-circle arc opening upward. Drawn as the upper half of a circle (radius 8, center at 12,12). Stroke 1.5.
- Filled: the full circle outlined (closes to whole), the inside not filled — staying minimal. (The "incomplete becoming whole" — outlined complete circle is the closed form.)

### Physical
- Outlined: two parallel horizontal bars in the lower half. Bar 1 at y=14, width 12, height 2 (rounded). Bar 2 at y=18, width 16, height 2 (rounded). Slight horizontal offset (bar 1 starts at x=6, bar 2 at x=4).
- Filled: a single rectangle, x=4 y=14 width=16 height=6 (rounded 2px).

## Files to create / modify

```
apps/mobile/components/PillarGlyph/
  Mental.tsx
  Financial.tsx
  Spiritual.tsx
  Physical.tsx
  PillarGlyph.tsx              # barrel
  PillarGlyph.test.tsx
  PillarGlyph.stories.tsx      # dev-only display

apps/mobile/app/(dev)/glyphs.tsx
```

## Acceptance criteria

- [ ] All four glyphs render at 24×24 by default.
- [ ] `size` prop scales them proportionally (test at 16, 24, 48).
- [ ] `variant="outlined"` uses 1.5px stroke at 24px (scales with size).
- [ ] `variant="filled"` uses no stroke + filled shapes.
- [ ] `color` prop overrides inherited color.
- [ ] Each glyph has an `accessibilityLabel` with pillar name.
- [ ] Dev-only `/(dev)/glyphs` route shows all 8 (4 pillars × 2 variants) at 24/48/96 sizes side by side.
- [ ] Tests: snapshot per variant per pillar (8 total).
- [ ] Visual sanity check by user (the glyphs are spec-derived, not designer-drawn — first pass is functional, may need iteration).

## Non-goals

- No designer pass — that's pre-launch (Phase 7+).
- No animated glyphs (the Quad has the animations; glyphs are static).
- No glyph use of pillar accent colors. Glyphs are monochrome and inherit current text color.

## Notes for the agent

- Use `react-native-svg` primitives: `<Svg>`, `<Rect>`, `<Circle>`, `<Path>`, `<Line>`.
- For Spiritual's half-circle: `<Path d="M 4 12 A 8 8 0 0 1 20 12" stroke fill="none" />` — outlines a top arc.
- The filled variant of Spiritual is a *full* circle outline, not a filled disc. The "incomplete-becoming-whole" framing means closure = full circle, not solidified.
- Round corners on Physical's bars: `rx={1}`.
- Stroke width must scale with `size`: `strokeWidth = (size / 24) * 1.5`.
- **Don't pull from Lucide / Heroicons / SF Symbols.** These glyphs are 4Wins' iconographic dialect and must look only like ours.
- Visual review after this ticket — if the user says "Mental looks too much like a thinking-emoji frame," tweak the spec and update the glyph here. We expect 1–2 rounds before lock.
