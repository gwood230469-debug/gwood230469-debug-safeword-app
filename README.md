# SafeWord

A family circle agrees on a shared safe word so that if someone gets a
suspicious call — an AI voice clone of a grandchild, a fake bank fraud
department, anything asking for money or urgent action — they can ask the
caller to say it first. The app never stores or displays the word itself
(only a salted hash), by design: verification is a human judging a spoken
answer on a real phone call, not something the app checks for you.

## Tech stack

- **Frontend:** React Native + Expo (SDK 57), TypeScript
- **Backend/DB:** Supabase (Postgres + Auth + Storage)
- **Auth:** Apple Sign-In (iOS) and Google Sign-In (Apple/Google, not
  email/password)
- **Push notifications:** Expo push service
- **Tests:** Vitest, for the pure-logic `src/lib/` modules

## Project structure

```
App.tsx                  App shell: auth/circle/profile loading, routing
src/
  components/             Shared UI (Button, Card, SafeWordForm, ...)
  context/                React contexts: auth, circle, profile, pending invite
  lib/                    Supabase calls, safe-word hashing, invite links, etc.
  navigation/             React Navigation stack
  screens/                One file per screen (onboarding/ for the first-run flow)
  theme/                  Colors, spacing, typography tokens
supabase/
  migrations/             SQL migrations, applied in order (see SETUP.md)
  SETUP.md                Linking the Supabase CLI, dev vs. production database
  DIGEST_RUNBOOK.md       How to publish a new Weekly Digest article
web/invite-redirect/      Hosted landing page for invite links (GitHub Pages)
DEPLOYMENT.md             How to produce a real installable build via EAS
```

## Running it locally

This app can't run in plain Expo Go — it uses native Apple/Google sign-in
and push modules that need a custom "dev client" build.

1. Copy `.env.example` to `.env` and fill in the real values (Supabase
   project URL/key, Google OAuth client id — see the comments in that file
   for where each one comes from).
2. `npm install`
3. `npx expo start --dev-client -c`
4. Scan the QR code with a phone that has the dev client installed
   (connected to the same WiFi as your computer).

Run the test suite with `npm test`, and type-check with
`npx tsc --noEmit`.

## Database changes

Migrations in `supabase/migrations/` are applied in order. See
`supabase/SETUP.md` for linking the Supabase CLI so this becomes the real
source of truth, rather than pasting SQL into the dashboard by hand.

## Shipping a real build

See `DEPLOYMENT.md` — covers producing an installable Android APK via EAS
(no computer needed afterward) and the environment-variable/Google
Sign-In gotchas that come up the first time you do this.
