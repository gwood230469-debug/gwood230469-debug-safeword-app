import * as Linking from 'expo-linking';
import { Share } from 'react-native';

// NOTE: this is a custom URL scheme (safeword://invite/<token>), which only
// works if the app is already installed — tapping it with the app missing
// just does nothing, rather than falling back to the App/Play Store listing
// as the spec describes. That fallback needs a real https:// universal link
// with a verified domain (apple-app-site-association / assetlinks.json),
// which isn't set up yet. Worth revisiting once there's a domain to host it on.
export function buildInviteUrl(token: string): string {
  return Linking.createURL(`invite/${token}`);
}

export async function shareInvite(circleOwnerName: string, memberName: string, token: string): Promise<void> {
  const url = buildInviteUrl(token);
  await Share.share({
    message: `${circleOwnerName} wants you to join their family circle on SafeWord — it's how you'll both know a call is really the other person, not a scam. Tap to join, ${memberName}: ${url}`,
    url,
  });
}

export function parseInviteToken(url: string): string | null {
  const { hostname, path } = Linking.parse(url);
  // Linking.parse splits differently depending on scheme shape; accept both
  // safeword://invite/<token> (hostname="invite") and a plain /invite/<token> path.
  const segments = (path ?? '').split('/').filter(Boolean);
  if (hostname === 'invite' && segments[0]) return segments[0];
  if (segments[0] === 'invite' && segments[1]) return segments[1];
  return null;
}
