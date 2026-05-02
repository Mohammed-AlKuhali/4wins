# T-038 — Settings screen

**Area:** mobile
**Estimate:** 60 min
**Depends on:** T-030, T-005
**Implements PRD:** §3 screen 18, §4 spec
**Brand bible:** §3, §8 (no Profile tab, no avatar)

## Goal

Single-screen settings — no nested tabs, no avatar, no profile section. Reflects the brand's "the user knows who they are" stance.

## What to build

A single scrollable screen with these sections (all directly editable, no sub-screens unless noted):

1. **Tradition** — tap to switch (sub-screen with the same 5-option list as T-027).
2. **Custom tradition prompt** — visible only if tradition='custom'; tap to edit text.
3. **Cue** — tap to switch (sub-screen with the same 5 presets as T-028).
4. **Identity statement** — tap to edit (text input).
5. **Notifications** — toggle row + slider for `max_per_day` (0/1/2).
6. **Appearance** — segmented control: Auto / Always dark / Always light (persists locally only; doesn't sync server-side in v1).
7. **Subscription** — shows status + button to manage (links out to App Store / Play subscription manage page, OR opens our `/(modals)/subscription` if applicable).
8. **Data export** — link button (only if T-014 export is implemented; else hidden).
9. **Sign out** — button.
10. **Delete account** — button at very bottom; tap confirms with a brand-voice modal: "Delete your account? Data is recoverable for 30 days." [Delete] [Cancel]. If confirmed, calls `DELETE /v1/me` and signs out.

No "Profile" tab. No avatar. No app version unless tucked into a small caption at very bottom.

## Files to create / modify

```
apps/mobile/app/(app)/settings.tsx
apps/mobile/app/(app)/settings/tradition.tsx
apps/mobile/app/(app)/settings/cue.tsx
apps/mobile/app/(app)/settings/identity.tsx
apps/mobile/app/(app)/settings/custom-tradition.tsx
apps/mobile/components/settings/
  SettingRow.tsx
  Section.tsx
apps/mobile/__tests__/settings.test.tsx
```

## Acceptance criteria

- [ ] Settings is a single scrollable screen with sections.
- [ ] Each setting reflects current `users` state from cache.
- [ ] Editing any setting PATCHes `/v1/me` and updates cache.
- [ ] Notifications slider: 0/1/2 maps to `max_per_day`. 0 also revokes the push token (DELETE `/v1/notifications/unregister`).
- [ ] Appearance: 3-way segmented control persisted in `expo-secure-store`; ThemeProvider reads on every mount.
- [ ] Subscription row shows correct status; tap opens platform-native manage page.
- [ ] Sign out clears tokens, calls backend, navigates to welcome.
- [ ] Delete account shows the confirmation modal with brand-voice copy. On confirm, soft-deletes via `DELETE /v1/me`, signs out.
- [ ] No app version banner / "Made with love" — keep clean.
- [ ] Tests: each setting edits PATCHes correctly; sign out flow; delete account flow.

## Non-goals

- Profile tab / avatar / display name.
- Stats screen (v1.5).
- Theme picker beyond the 3 modes.
- Per-pillar custom prompts (v1.5; v1 only allows tradition-level Spiritual customization).

## Notes for the agent

- For platform-native manage subscription:
  - iOS: `Linking.openURL('https://apps.apple.com/account/subscriptions')`
  - Android: `Linking.openURL('https://play.google.com/store/account/subscriptions')`
- The delete confirmation modal: brand-voice copy, two buttons. No "Are you sure???" hand-wringing.
- Use a single shared `<SettingRow>` for all rows — title, value preview, chevron if it leads to a sub-screen, inline editor if not.
- Tradition + cue sub-screens reuse the same components as onboarding (T-027/T-028) — extract to shared.
