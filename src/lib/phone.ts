// Strips spaces/dashes/parens so the same number typed with different visual
// formatting (e.g. "+44 7700 900000" vs "+447700900000") still matches when
// comparing an invited row's phone_number against the confirming user's own
// number. Doesn't validate or add a missing country code — whoever invites a
// member and whoever confirms as that member both need to type it the same
// way (with the country code) for the match to work.
export function normalizePhoneNumber(input: string): string {
  const trimmed = input.trim();
  const hasLeadingPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
}
