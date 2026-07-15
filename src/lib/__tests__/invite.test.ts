import { afterEach, describe, expect, it, vi } from 'vitest';

// invite.ts imports `Share` from react-native (used only by shareInvite,
// which these tests don't exercise) and `expo-linking` for parse/createURL —
// neither runs under plain node, so both need mocking just to let the
// module load.
vi.mock('react-native', () => ({
  Share: { share: vi.fn() },
}));

// Mirrors the shapes expo-linking's real `parse()` produces (it runs
// `new URL(url)` under the hood — see node_modules/expo-linking/build/createURL.js):
// - `safeword://invite/<token>` → hostname: 'invite', path: '<token>'
// - `https://host/invite/<token>` → hostname: 'host', path: 'invite/<token>'
vi.mock('expo-linking', () => ({
  createURL: vi.fn((path: string) => `safeword://${path}`),
  parse: vi.fn((url: string) => {
    if (url === 'safeword://invite/abc123') {
      return { hostname: 'invite', path: 'abc123', queryParams: {}, scheme: 'safeword' };
    }
    if (url === 'https://example.com/invite/xyz789') {
      return { hostname: 'example.com', path: 'invite/xyz789', queryParams: {}, scheme: 'https' };
    }
    if (url === 'safeword://home') {
      return { hostname: 'home', path: null, queryParams: {}, scheme: 'safeword' };
    }
    throw new Error(`parseInviteToken test: no mock configured for url ${url}`);
  }),
}));

import { buildInviteUrl, parseInviteToken } from '../invite';

describe('parseInviteToken', () => {
  it('extracts the token from a safeword://invite/<token> URL (hostname === "invite")', () => {
    expect(parseInviteToken('safeword://invite/abc123')).toBe('abc123');
  });

  it('extracts the token from a plain /invite/<token> path shape (segments[0] === "invite")', () => {
    expect(parseInviteToken('https://example.com/invite/xyz789')).toBe('xyz789');
  });

  it('returns null for an unrelated URL', () => {
    expect(parseInviteToken('safeword://home')).toBeNull();
  });
});

describe('buildInviteUrl', () => {
  const ENV_KEY = 'EXPO_PUBLIC_INVITE_LANDING_URL';
  const originalValue = process.env[ENV_KEY];

  afterEach(() => {
    if (originalValue === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = originalValue;
  });

  it('falls back to the bare safeword:// deep link when no landing URL is configured', () => {
    delete process.env[ENV_KEY];
    expect(buildInviteUrl('abc123')).toBe('safeword://invite/abc123');
  });

  it('builds a ?token= URL against the landing page when configured', () => {
    process.env[ENV_KEY] = 'https://example.com/invite-redirect/';
    expect(buildInviteUrl('abc123')).toBe('https://example.com/invite-redirect/?token=abc123');
  });

  it('uses & instead of ? if the landing URL already has a query string', () => {
    process.env[ENV_KEY] = 'https://example.com/invite-redirect/?ref=share';
    expect(buildInviteUrl('abc123')).toBe('https://example.com/invite-redirect/?ref=share&token=abc123');
  });

  it('URL-encodes the token', () => {
    process.env[ENV_KEY] = 'https://example.com/invite-redirect/';
    expect(buildInviteUrl('a b/c')).toBe('https://example.com/invite-redirect/?token=a%20b%2Fc');
  });
});
