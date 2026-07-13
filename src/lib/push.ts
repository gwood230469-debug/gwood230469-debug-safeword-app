import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { supabase } from './supabase';

// Since Expo SDK 53, Expo Go no longer supports push notifications at all —
// merely `import`-ing expo-notifications throws at module-evaluation time
// when running inside Expo Go. So this can't be a static top-level import;
// `expo-notifications` is only require()'d lazily, and only outside Expo Go
// (a real device build, or a custom dev client, both still support it fine).
//
// `Constants.appOwnership === 'expo'` is the "obvious" check but is
// deprecated and, in practice, unreliable for this — it stayed false inside
// real Expo Go and let the crash through. `executionEnvironment` is the
// actively-maintained replacement; 'storeClient' covers both Expo Go and a
// expo-dev-client build, so as a second layer the require() below is also
// wrapped in try/catch — belt and suspenders, since this must never crash.
const isLikelyExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let cachedNotifications: typeof import('expo-notifications') | null = null;
function loadNotifications(): typeof import('expo-notifications') | null {
  if (isLikelyExpoGo) return null;
  if (!cachedNotifications) {
    try {
      cachedNotifications = require('expo-notifications');
      cachedNotifications!.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    } catch (e) {
      console.warn('expo-notifications is unavailable in this runtime', e);
      return null;
    }
  }
  return cachedNotifications;
}

// Requires an EAS project id (app.json `extra.eas.projectId`, set by `eas init`)
// to mint a real Expo push token. Returns null (and never throws) if that's not
// configured yet, if running in Expo Go, if the user declines notification
// permission, or on a simulator — loop-in still works locally either way, it
// just won't push.
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const Notifications = loadNotifications();
  if (!Notifications) {
    if (isLikelyExpoGo) {
      console.warn('Push notifications need a development build or standalone app — not supported in Expo Go since SDK 53.');
    }
    return null;
  }
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
