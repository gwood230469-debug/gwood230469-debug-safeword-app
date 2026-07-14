import { beforeEach, describe, expect, it, vi } from 'vitest';

// safeWordHash.ts's only non-plain-TS dependency is expo-crypto, which needs
// a native module and can't run outside Expo — fake it with a deterministic
// stand-in digest/random so we can assert on hashSafeWord's *behavior*
// (salting, normalization) without needing real SHA-256 or CSPRNG output.
vi.mock('expo-crypto', () => {
  let randomBytesCallCount = 0;
  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    digestStringAsync: vi.fn(async (_algorithm: unknown, data: string) => {
      let h = 0;
      for (let i = 0; i < data.length; i++) {
        h = (h * 31 + data.charCodeAt(i)) >>> 0;
      }
      return h.toString(16).padStart(8, '0');
    }),
    getRandomBytesAsync: vi.fn(async (byteCount: number) => {
      randomBytesCallCount++;
      const bytes = new Uint8Array(byteCount);
      for (let i = 0; i < byteCount; i++) {
        bytes[i] = (randomBytesCallCount * 7 + i) % 256;
      }
      return bytes;
    }),
  };
});

import * as Crypto from 'expo-crypto';
import { hashSafeWord } from '../safeWordHash';

const FIXED_SALT_BYTES = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

describe('hashSafeWord', () => {
  beforeEach(() => {
    vi.mocked(Crypto.getRandomBytesAsync).mockClear();
  });

  it('produces a different salt (and thus different output) on repeated calls with the same input', async () => {
    const first = await hashSafeWord('correct horse battery staple');
    const second = await hashSafeWord('correct horse battery staple');

    expect(first).not.toBe(second);

    const [firstSalt] = first.split(':');
    const [secondSalt] = second.split(':');
    expect(firstSalt).not.toBe(secondSalt);
  });

  it('normalizes (trims + lowercases) before hashing, so equivalent words hash identically given the same salt', async () => {
    vi.mocked(Crypto.getRandomBytesAsync).mockResolvedValueOnce(FIXED_SALT_BYTES);
    const spaced = await hashSafeWord(' MyWord ');

    vi.mocked(Crypto.getRandomBytesAsync).mockResolvedValueOnce(FIXED_SALT_BYTES);
    const lower = await hashSafeWord('myword');

    expect(spaced).toBe(lower);
  });

  it('returns a "<salt>:<hash>" shaped string', async () => {
    const result = await hashSafeWord('anything');
    const parts = result.split(':');
    expect(parts).toHaveLength(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });
});
