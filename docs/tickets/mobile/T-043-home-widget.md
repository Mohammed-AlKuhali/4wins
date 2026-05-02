# T-043 — Home-screen widget (Quad)

**Area:** mobile
**Estimate:** 90 min
**Depends on:** T-023
**Implements PRD:** §0 v1 surfaces, §3 screen 09 home note
**Brand bible:** §2 (Quad), §8 (widget primary surface)

## Goal

A static home-screen widget rendering today's Quad. iOS via WidgetKit (Swift), Android via Glance. Updates 4× per hour via timeline reload. NOT interactive (interactive Lock Screen widget is v1.5).

## What to build

1. **iOS widget:** WidgetKit extension via Expo Modules API (Swift). Renders the Quad-of-the-day from a small JSON cache.
2. **Android widget:** Glance widget renders the same.
3. **Cache layer:** the app writes a simple JSON snapshot to a shared App Group (iOS) / SharedPreferences (Android) on every entry/day change. Includes pillars_logged + closed status.
4. **Timeline:** iOS WidgetKit refreshes every 15 min; Android refreshes via WorkManager every 30 min.
5. **Tap action:** opens the app to home.
6. **Sizes:** small + medium for iOS, single small for Android. Brand-bible-faithful — no streak number, no time, just the Quad + a tiny date.

## Files to create / modify

```
apps/mobile/modules/widget-ios/                  # Expo Modules API native iOS
  ios/WidgetExtension/
    QuadWidget.swift
    QuadView.swift
    Provider.swift
    Info.plist
apps/mobile/modules/widget-android/
  android/src/main/.../QuadGlanceWidget.kt
  android/src/main/.../QuadAppWidgetProvider.kt
  android/src/main/res/xml/widget_info.xml
apps/mobile/lib/widget_sync.ts                   # writes shared cache from RN
apps/mobile/app/(app)/_layout.tsx                # call sync on entry/day changes
apps/mobile/__tests__/widget_sync.test.ts
```

## Acceptance criteria

- [ ] iOS widget renders the Quad in small + medium sizes. State matches today's pillars_logged.
- [ ] Android widget renders Quad in small size. State matches.
- [ ] Cache writes happen within 100ms of any entry POST or day-state change.
- [ ] Tap opens app to home.
- [ ] No streak number on widget face (per brand §8).
- [ ] Tiny date in caption (e.g. "May 2"), Plex Sans 11.
- [ ] Pillar colors match design tokens.
- [ ] Tests: cache write happens after entry; widget reads cache and renders correct state (tested via snapshot of the SwiftUI/Compose render).

## Non-goals

- Interactive Lock Screen widget (iOS 17+ AppIntent) — v1.5.
- Apple Watch complication — v1.5.
- Multi-day widgets, week strip widgets — v1.5.
- Glance preview screens during widget install — defaults are fine.

## Notes for the agent

- Use `expo-modules-core` to scaffold the iOS Widget Extension. Apple requires a separate target; Expo Modules API can configure this in `app.config.ts`.
- App Group: `group.me.4wins.app` — declared in iOS entitlements + accessed via `UserDefaults(suiteName:)`.
- Android shared prefs file: `widget_state` accessed via `Context.getSharedPreferences("widget_state", MODE_PRIVATE)`.
- Quad rendering in SwiftUI: use `Path` + `addArc` to draw the four 86° arcs at 90° intervals. Same geometry as T-023 spec.
- Quad rendering in Compose Glance: use `Image` with a `Bitmap` rendered from `ImageBitmap` or pre-render PNGs at 4 states. Glance has limited drawing primitives — pre-rendering is simpler.
- Timeline: iOS Provider returns 4 entries per hour spaced 15 min apart with a `.atEnd` policy; Android uses `WorkManager` periodic 30-min refresh.
- Don't try to ship the interactive variant — it requires AppIntents in iOS 17+ and substantially more native work. Punt to v1.5.
