# App Icon Assets

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | iOS App Store icon, Android icon base |
| `adaptive-icon-foreground.png` | 1024×1024 | Android adaptive icon foreground layer |
| `notification-icon.png` | 96×96 recommended | Android notification icon (white on transparent) |
| `splash-icon.png` | Any | Splash screen center image |

## Requirements

### iOS
- No transparency (alpha channel)
- No rounded corners (iOS rounds them automatically)
- 1024×1024px minimum

### Android adaptive icon
- Foreground: safe zone is center 66% of the image — keep the ring inside that area
- Background: set to `#0E0E0C` in `app.config.ts`

## Regenerating

Icons are AI-generated and stored in this repo. To regenerate with different styling, update the prompts in the asset generation script.

If you need pixel-perfect icon production for App Store review, export from a vector design tool (Figma/Sketch) at exactly 1024×1024px.
