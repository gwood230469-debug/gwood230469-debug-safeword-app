import * as Linking from 'expo-linking';
import { Share } from 'react-native';

// If EXPO_PUBLIC_INVITE_LANDING_URL is set (pointing at wherever
// web/invite-redirect/index.html is hosted — see that folder's README),
// share an https:// link to that static landing page instead: it attempts
// the safeword://invite/<token> deep link itself and falls back to Play/App
// Store links if the app isn't installed. Without it, fall back to the bare
// custom-scheme URL exactly as before — tapping it with the app missing
// just does nothing, but that's the same behavior every caller already had.
export function buildInviteUrl(token: string): string {
  const landingBaseUrl = process.env.EXPO_PUBLIC_INVITE_LANDING_URL;
  if (landingBaseUrl) {
    const separator = landingBaseUrl.includes('?') ? '&' : '?';
    return `${landingBaseUrl}${separator}token=${encodeURIComponent(token)}`;
  }
  return Linking.createURL(`invite/${token}`);
}

export async function shareInvite(circleOwnerName: string, memberName: string, token: string): Promise<void> {
  const url = buildInviteUrl(token);
  // Only `message` is set (with the URL embedded in the text) — Android's
  // Share module has a known issue where providing both `message` and a
  // separate `url` at the same time can corrupt the resulting text (a stray
  // "]" character has been observed appearing right before the link in
  // WhatsApp). `message` alone works correctly on both platforms since the
  // URL is already part of the text.
  await Share.share({
    message: `${circleOwnerName} wants you to join their family circle on SafeWord — it's how you'll both know a call is really the other person, not a scam. Tap to join, ${memberName}: ${url}`,
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
