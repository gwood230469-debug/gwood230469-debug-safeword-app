import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Requires an EAS project id (app.json `extra.eas.projectId`, set by `eas init`)
// to mint a real Expo push token. Returns null (and never throws) if that's not
// configured yet, or the user declines notification permission, or it's a
// simulator — loop-in still works locally either way, it just won't push.
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('No EAS project id configured — skipping push token registration. Run `eas init` to enable push.');
    return null;
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch (e) {
    console.warn('Could not get an Expo push token', e);
    return null;
  }
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
