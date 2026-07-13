import { supabase } from './supabase';

// expo-notifications can't be used at all right now: it's a hard requirement
// of Expo Go since SDK 53 (its own auto-loaded side-effect module crashes on
// startup there, independent of anything this app's code does), and it needs
// a full development build (`eas build --profile development`, or `eas init`
// + a dev client) instead. Until this project is ready to move off Expo Go
// for testing, registration is a no-op — the rest of the loop-in flow
// (creating the VerificationEvent) works fine without it.
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  return null;
}

export async function saveOwnPushToken(userId: string, expoPushToken: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .upsert({ user_id: userId, expo_push_token: expoPushToken, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function getPushToken(userId: string): Promise<string | null> {
  const { data, error } = await supabase.from('push_tokens').select('expo_push_token').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data?.expo_push_token ?? null;
}

// Expo's push send endpoint accepts unauthenticated requests for basic sends.
// Best-effort: swallow failures so a missing/expired token never blocks the
// (already-created) VerificationEvent from being the source of truth.
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ to: expoPushToken, title, body, data }),
    });
  } catch (e) {
    console.warn('Could not send push notification', e);
  }
}
