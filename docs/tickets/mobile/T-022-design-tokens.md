# T-022 — Design tokens (palette, type, motion)

**Area:** mobile
**Estimate:** 60 min
**Depends on:** T-021
**Implements PRD:** §0 NFRs, brand bible §4 (color), §5 (type), §7 (motion)
**Brand bible:** §3, §4, §5, §7, §9 — the enforceable spec

## Goal

Encode the brand bible into TypeScript design tokens that every screen consumes. Includes typography presets, palette, motion springs, and a runtime color-scheme switcher (dark/light/auto).

## What to build

1. `theme/colors.ts` — base palette + pillar accents from brand §4. Two modes (dark, light).
2. `theme/typography.ts` — type presets (display/headline/title/body/caption/numeric) per brand §5.
3. `theme/motion.ts` — spring presets from brand §7.
4. `theme/spacing.ts` — 4-pt rhythm scale.
5. `theme/index.ts` — exported tokens + a `useTheme()` hook that returns the current mode + tokens.
6. A `<Text>` wrapper component that defaults to Plex Sans and accepts a `variant` prop (`display | headline | title | body | bodyEmphasis | caption | numericLarge | numericInline`).
7. Time-based auto-mode: by default, dark before 06:00 + after 18:00 local; light otherwise. Settings will override later.
8. A storybook-like `theme/preview.tsx` route (only in dev) that shows all tokens side by side.

## Files to create / modify

```
apps/mobile/theme/
  colors.ts
  typography.ts
  motion.ts
  spacing.ts
  index.ts
  useTheme.ts            # context + hook
  ThemeProvider.tsx
  preview.tsx            # dev-only token gallery

apps/mobile/components/
  Text.tsx               # the wrapper component

apps/mobile/app/_layout.tsx   # wrap in ThemeProvider
apps/mobile/app/(dev)/theme.tsx  # mounts preview screen, dev-only

apps/mobile/__tests__/theme.test.ts
```

## Token spec (must match these values)

### `colors.ts`

```ts
export const palette = {
  dark: {
    bg: '#0E0E0C',
    surface: '#15140F',
    text: '#FAF7F2',
    textSecondary: '#A29F9A',
    textTertiary: '#6B6864',
    hairline: '#2A2826',
  },
  light: {
    bg: '#FAF7F2',
    surface: '#F2EEE5',
    text: '#0E0E0C',
    textSecondary: '#6B6864',
    textTertiary: '#A29F9A',
    hairline: '#E8E3DC',
  },
  pillars: {
    mental: '#2E4156',     // ink slate
    financial: '#7C5F26',  // burnished bronze
    spiritual: '#B8A47E',  // parchment
    physical: '#A04428',   // terracotta
  },
} as const;
```

### `typography.ts`

```ts
export const type = {
  display:        { family: 'Fraunces', weight: '300', size: 40, lineHeight: 48, letterSpacing: -0.5 },
  headline:       { family: 'Fraunces', weight: '400', size: 28, lineHeight: 36 },
  title:          { family: 'Fraunces', weight: '400', size: 22, lineHeight: 28 },
  body:           { family: 'IBMPlexSans', weight: '400', size: 17, lineHeight: 24 },
  bodyEmphasis:   { family: 'IBMPlexSans', weight: '500', size: 17, lineHeight: 24 },
  caption:        { family: 'IBMPlexSans', weight: '400', size: 13, lineHeight: 18 },
  numericLarge:   { family: 'IBMPlexMono', weight: '400', size: 32, lineHeight: 36 },
  numericInline:  { family: 'IBMPlexMono', weight: '400', size: 17, lineHeight: 24 },
} as const;
```

### `motion.ts`

```ts
export const motion = {
  subtle:   { damping: 22, stiffness: 180, mass: 1 },     // ~response 0.4, dampingFraction 0.9
  default:  { damping: 18, stiffness: 140, mass: 1 },     // ~response 0.5, dampingFraction 0.85
  ritual:   { damping: 14, stiffness: 90, mass: 1 },      // ~response 0.7, dampingFraction 0.8
  entrance: { damping: 20, stiffness: 140, mass: 1 },
} as const;
```

### `spacing.ts`

```ts
export const spacing = {
  xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, '3xl': 48, '4xl': 64,
} as const;
```

## Acceptance criteria

- [ ] `useTheme()` returns `{ mode: 'dark'|'light', colors, type, motion, spacing }`.
- [ ] Mode auto-switches based on time of day (default behavior). Manual override available via context setter.
- [ ] `<Text variant="display">Hello</Text>` renders in Fraunces Light at 40/48 with the right color from current mode.
- [ ] `<Text variant="numericLarge">47</Text>` renders monospaced via Plex Mono.
- [ ] Dev-only `/(dev)/theme` route shows: palette swatches (base + 4 pillars in both modes), all 8 type variants in both modes, four motion springs animated on tap.
- [ ] Tests: import each token, assert exact hex matches the brand bible. Snapshot test on `<Text>` variants.
- [ ] No banned tokens leak through: a test scans the file for `indigo`, `violet`, `Inter`, `slate-` and fails if found.
- [ ] WCAG AA contrast: a runtime check (in dev) warns if any token combination falls below 4.5:1.

## Non-goals

- No theming for the Quad colors yet (T-023 owns those — they reference `palette.pillars`).
- No user-facing settings to override mode (T-038 settings ticket).
- No themes beyond dark and light (no "midnight," "sepia," etc).
- No nativewind / styled-components — plain `StyleSheet.create` with token references.

## Notes for the agent

- React Native's `StyleSheet.create` accepts numbers, not Tailwind-style strings. Token consumers always import `palette`, `type`, `motion`, `spacing` from `theme`.
- `<Text>` should accept all React Native Text props plus `variant` and an optional `color` override.
- Use `react-native-reanimated`'s `withSpring(value, motion.ritual)` pattern in animations later (T-035 etc.).
- `ThemeProvider` reads system color scheme via `useColorScheme()` for the time-based default fallback. The time-based auto rule overrides the system scheme.
- Test the WCAG contrast checker in dev only — don't ship it to prod (use `__DEV__` guard).
- Banned-token lint: a unit test that reads the source files in `theme/` as strings and asserts none contain `'indigo'`, `'violet'`, `'fuchsia'`, `'slate-'`, `'Inter'`, `'Geist'`, `'Satoshi'` (case-insensitive).
