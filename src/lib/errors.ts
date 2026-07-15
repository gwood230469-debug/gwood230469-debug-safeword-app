// Shared helpers for turning a caught `unknown` value into something safe to
// show a user or branch on — used at every user-triggered async action's
// catch block instead of each call site reaching for `(e: any)` and
// `e?.message`, which silently accepts anything (including non-Error
// throwables) and gives up type checking on the caught value entirely.

export function getErrorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'message' in e) {
    const message = (e as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return fallback;
}

// Used for native SDK errors (e.g. expo-apple-authentication) that signal
// cause via a `code` string rather than throwing a typed error class.
export function getErrorCode(e: unknown): string | undefined {
  if (e && typeof e === 'object' && 'code' in e) {
    const code = (e as { code?: unknown }).code;
    if (typeof code === 'string') return code;
  }
  return undefined;
}
