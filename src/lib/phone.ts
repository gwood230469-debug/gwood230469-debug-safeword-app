// Strips spaces/dashes/parens so the same number typed with different visual
// formatting (e.g. "+44 7700 900000" vs "+447700900000") normalizes to one
// consistent value. Since migration 0006 (OAuth + share-link invites),
// phone_number is contact-info-only and plays no role in identity matching —
// this is purely for display/dialing (the `tel:` links in
// FamilyCircleScreen.tsx / AddMembersScreen.tsx). Doesn't validate or add a
// missing country code.
export function normalizePhoneNumber(input: string): string {
  const trimmed = input.trim();
  const hasLeadingPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
}
