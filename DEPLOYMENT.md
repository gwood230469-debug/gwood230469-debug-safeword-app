# Getting SafeWord onto a real phone

Everything so far has run through a "dev client" — the app connects to your
computer's Metro server over WiFi, which is why closing a terminal or
changing networks breaks it. This guide covers building a real, standalone
app file that installs and runs on its own, with no computer involved.

## 1. Build an installable APK (Android)

This repo already has an `eas.json` "preview" profile set up for exactly
this — an "internal distribution" build, meaning EAS gives you a private
download link/QR code, no Play Store submission needed.

```
npx eas login
npx eas build --profile preview --platform android
```

This runs in the cloud (10-20 minutes) and finishes with a link to download
an `.apk` file. Share that link (or the QR code EAS shows) with anyone —
they tap it, allow "install from unknown sources" if Android asks, and the
app installs like any other app. No Metro, no computer needed.

## 2. The Google Sign-In gotcha

**Google Sign-In will likely fail in this build even though it worked in
your dev client.** This is the single most common surprise with this kind
of setup, so it's worth understanding why: Google Sign-In verifies your
app using the cryptographic signature ("SHA-1 fingerprint") of whoever
built it. Your dev client used one signing key; an EAS cloud build uses a
*different* one (EAS manages it for you). Google Cloud Console only knows
about the fingerprint you originally registered — the dev client's — so it
rejects sign-in attempts from the new build's fingerprint.

Fix, one-time:
1. Get the new build's fingerprint: `npx eas credentials` → select Android →
   "Keystore: Manage everything needed to build your project" → it'll show
   a SHA-1 value. Copy it.
2. In [Google Cloud Console](https://console.cloud.google.com/) →
   APIs & Services → Credentials → find the **Android** OAuth client
   (separate from the "Web application" one already in `.env`) → add that
   SHA-1 fingerprint to it. If there's no Android OAuth client yet, create
   one, using `com.gwood230469debug.safeword` as the package name.
3. Give it a few minutes to propagate, then try signing in again in the
   new build.

## 3. iOS

Apple Sign-In needs an actual Apple Developer account ($99/year) before any
iOS build can be produced or installed on a real iPhone — there's no free
"internal distribution" equivalent the way Android has. Skip this until
that's set up; Android alone is enough to keep testing with family members
in the meantime.

## 4. When you're ready for the Play Store / App Store properly

That's a separate, bigger step (store listing, screenshots, privacy policy
page, content rating questionnaire) — worth doing once the app has had more
real-world testing via the internal APK above, not before. Ask when you get
there and we'll go through it.
