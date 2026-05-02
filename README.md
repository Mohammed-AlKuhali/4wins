# 4Wins Backend

The API server for the 4Wins daily discipline application.

## Stack

- Node 22, ESM
- Hono v4 (web framework)
- Postgres + Drizzle ORM
- Zod (validation)
- Vitest (tests)
- TypeScript strict, NodeNext modules

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `PORT` | Server port (default: 8787) |

Optional (needed for later features):

| Variable | Description |
|---|---|
| `APPLE_TEAM_ID` | Apple developer team ID |
| `APPLE_KEY_ID` | Apple Sign-In key ID |
| `APPLE_PRIVATE_KEY` | Apple Sign-In private key |
| `GOOGLE_CLIENT_ID_IOS` | Google OAuth client ID for iOS |
| `GOOGLE_CLIENT_ID_ANDROID` | Google OAuth client ID for Android |
| `OPENAI_API_KEY` | OpenAI API key (voice transcription) |
| `ANTHROPIC_API_KEY` | Anthropic API key (AI tagging) |
| `EXPO_ACCESS_TOKEN` | Expo push notification token |
| `APP_STORE_SHARED_SECRET` | App Store IAP shared secret |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Google Play service account JSON |

## Development

```bash
npm run dev
```

Server starts on `http://localhost:8787` (or `PORT` from env).

## Testing

```bash
npm test
```

## Build

```bash
npm run build
```

Outputs to `dist/`. Run the built artifact:

```bash
npm start
```

## Deploy

This backend is deployed on Replit Reserved Deployments. The `npm start` command runs the compiled output. Replit manages process supervision and TLS.

## API

### `GET /v1/health`

Returns server status. No authentication required.

**Response:**
```json
{ "status": "ok" }
```
