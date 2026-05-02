# App Store Submission Checklist

## iOS (App Store)

### Bundle ID
`me.4wins.app`

### Capabilities required
- Sign In with Apple (mandatory when other social auth is present)
- Push Notifications
- HealthKit (optional — physical pillar auto-log)
- App Groups (widget data sharing)

### Privacy manifest (`PrivacyInfo.xcprivacy`)

Required NSPrivacyAccessedAPITypes:
- `NSPrivacyAccessedAPICategoryUserDefaults` — storing widget state
- `NSPrivacyAccessedAPICategoryFileTimestamp` — audio recording

Required NSPrivacyCollectedDataTypes:
- User ID (linked, required)
- Email (linked, optional — provided by Sign in with Apple if user shares it)

### App Store Connect metadata

**Category**: Health & Fitness (primary), Lifestyle (secondary)

**Subtitle**: Four wins. Every day.

**Description (short)**:
> Mental. Financial. Spiritual. Physical. Four wins, every day. 
> Not streaks. Not notifications that beg. A closed Quad.

**Keywords**:
```
discipline, habit, accountability, stoic, mindfulness, 
journal, daily wins, self improvement, spiritual, focus
```

**Age rating**: 4+ (no objectionable content)

**Privacy Policy URL**: https://4wins.me/privacy

### In-App Purchase

| Product | Type | Price |
|---|---|---|
| `me.4wins.app.annual` | Auto-renewable | $79 USD / year |
| `me.4wins.app.annual.trial` | 14-day free trial | — |

---

## Android (Google Play)

### Package name
`me.fourwins.app`

### Permissions
- `POST_NOTIFICATIONS`
- `RECORD_AUDIO` (voice capture)
- `HEALTH_CONNECT` (optional)
- `USE_BIOMETRIC` (Secure Store keystore)

### Content rating
ESRB: Everyone

### Data safety

**Data collected and linked to identity**:
- User ID (required, account management)
- Email (optional, account management)

**Data collected, not linked to identity**:
- Usage data / analytics (product analytics, no PII)

**Data NOT collected**:
- Location
- Contacts
- Photos / files
- Device / other IDs

---

## EAS Build commands

```bash
# iOS development build
eas build --profile development --platform ios

# Android development build
eas build --profile development --platform android

# Production builds
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## TestFlight notes

- Build must include `NSMicrophoneUsageDescription` in Info.plist
- HealthKit entitlement requires Apple review approval
- Sign in with Apple must be tested on real device (simulator limitation)
