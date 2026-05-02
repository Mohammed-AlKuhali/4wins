# App Store & Play Store Submission Checklist

## One-time setup (do once per account)

### Apple
- [ ] Enroll in Apple Developer Program ($99/yr) at developer.apple.com
- [ ] Create App ID `me.4wins.app` in Identifiers, enable:
  - HealthKit
  - App Groups (`group.me.4wins.app`)
  - Push Notifications
  - Sign In with Apple
- [ ] Create App Store Connect app record:
  - Name: **4Wins — Daily Discipline**
  - Primary language: English (U.S.)
  - Bundle ID: `me.4wins.app`
  - SKU: `4wins-ios-v1`
- [ ] Create Service Key for Sign In with Apple (download `.p8`)
  - Set `APPLE_KEY_ID`, `APPLE_TEAM_ID`, `APPLE_PRIVATE_KEY` in Replit secrets

### Google Play
- [ ] Create Google Play Developer account ($25 one-time)
- [ ] Create new app: package `me.4wins.app`
- [ ] Create OAuth 2.0 client IDs in Google Cloud Console (iOS + Android)
  - Set `EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS` and `EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID`
- [ ] Create Service Account for automated uploads, download JSON key → `google-play-key.json`

### EAS
- [ ] `npm install -g eas-cli`
- [ ] `eas login`
- [ ] `cd apps/mobile && eas init` (creates project, fills `EAS_PROJECT_ID`)
- [ ] Update `eas.json` submit block with real Apple ID, ascAppId, teamId

---

## Before every release

### Assets
- [ ] App icon (`assets/icons/icon.png`) — 1024×1024px, no alpha, no rounded corners (Apple rounds it)
- [ ] Notification icon (`assets/icons/notification-icon.png`) — white on transparent, 96×96px
- [ ] Adaptive icon foreground (`assets/icons/adaptive-icon-foreground.png`) — 1024×1024px with transparency
- [ ] Screenshots: 6.7" iPhone (1290×2796), 5.5" iPhone (1242×2208) — minimum 3 each
- [ ] iPad screenshot if supporting tablet (we don't — `supportsTablet: false`)

### App Store Connect metadata
```
Name:           4Wins — Daily Discipline
Subtitle:       Four pillars. Every day.
Category:       Health & Fitness (primary), Lifestyle (secondary)
Age Rating:     4+ (no objectionable content)
Privacy Policy: https://4wins.app/privacy

Description (short):
Track four daily wins across Mental, Financial, Spiritual, and Physical pillars. 
Build unbreakable discipline with streaks, voice journaling, and weekly reviews.

Keywords (100 chars):
discipline,habits,journal,streak,stoic,mindset,daily wins,wellness,productivity,routine
```

### App Store screenshots (suggested text overlays)
1. Home screen — "Your four wins. Every day."
2. Pillar capture — "Speak or type your wins"
3. History grid — "Watch your streak grow"
4. Weekly review — "Weekly rhythm, not perfection"
5. Settings — "Built around your tradition"

### Privacy manifest (required iOS 17+)
- Already declared in `infoPlist`: microphone, health
- Add `PrivacyInfo.xcprivacy` if using any required-reason APIs (NSUserDefaults, file timestamps)

---

## Build commands

```bash
cd apps/mobile

# Development build (simulator)
eas build --platform ios --profile development

# TestFlight beta
eas build --platform ios --profile preview
eas submit --platform ios --profile production --latest

# Production
eas build --platform all --profile production --auto-submit
```

## Backend deployment before submit
```bash
# On Replit — deploy backend first
npm run db:migrate   # apply any new migrations
# Then publish the Replit deployment
```

## Post-submit checklist
- [ ] Submit for App Review (allow 24–48h)
- [ ] Enable phased release (10% → 100% over 7 days)
- [ ] Monitor Sentry for crash rate > 0.5% in first 24h
- [ ] Check push delivery rate in Expo dashboard
- [ ] Reply to first App Store reviews within 24h
