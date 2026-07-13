import * as Crypto from 'expo-crypto';

// The app never needs to display an existing safe word back to a user — the
// Save flow only ever writes a new one — so there's no reversible-encryption
// requirement here, just "don't let it sit in the DB as plaintext." A salted,
// lightly-stretched hash treats it the way a password would be treated. This
// is not a full KDF (no native Argon2/scrypt module is installed): the fixed
// round count is a modest work-factor bump over a bare hash, appropriate for
// guarding against casual exposure (a DB browse, a log dump), not targeted
// offline brute-forcing of a leaked database.
const STRETCH_ROUNDS = 200;

export async function hashSafeWord(rawValue: string): Promise<string> {
  const salt = await randomHex(16);
  const hash = await stretchedSha256(`${salt}:${normalize(rawValue)}`);
  return `${salt}:${hash}`;
}

async function stretchedSha256(input: string): Promise<string> {
  let current = input;
  for (let i = 0; i < STRETCH_ROUNDS; i++) {
    current = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, current);
  }
  return current;
}

async function randomHex(byteCount: number): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(byteCount);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function normalize(word: string): string {
  return word.trim().toLowerCase();
}
