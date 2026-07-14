import * as Sentry from '@sentry/react-native';

// Crash reporting is entirely optional: if no DSN is configured (local dev,
// CI, or a fork that hasn't set up a Sentry project yet) this quietly no-ops
// rather than throwing, mirroring the "no EAS project id" pattern in push.ts.
const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry(): void {
  if (!dsn) {
    console.warn('No Sentry DSN configured (EXPO_PUBLIC_SENTRY_DSN) — skipping crash reporting setup.');
    return;
  }
  Sentry.init({ dsn });
}

// Defensive wrapper around Sentry.captureException: every call site is
// inside error-handling code that's already dealing with a failure, so this
// must never itself throw or surface a second error. `@sentry/react-native`
// doesn't export an `isInitialized()` check at the top level, so we use
// `getClient()` returning undefined as the "never initialized" signal, and
// still wrap in try/catch as a defensive backstop against any other native/
// transport error the SDK might raise internally.
export function captureException(error: unknown): void {
  try {
    if (!Sentry.getClient()) return;
    Sentry.captureException(error);
  } catch {
    // Swallow: telemetry reporting must never mask the original error.
  }
}
