import { describe, expect, it } from 'vitest';
import { normalizePhoneNumber } from '../phone';

describe('normalizePhoneNumber', () => {
  it('strips spaces, dashes, and parens', () => {
    expect(normalizePhoneNumber('(020) 7946-0958')).toBe('02079460958');
  });

  it('preserves a leading +', () => {
    expect(normalizePhoneNumber('+44 7700 900000')).toBe('+447700900000');
  });

  it('produces the same normalized output for equivalent inputs', () => {
    expect(normalizePhoneNumber('+44 7700 900000')).toBe(normalizePhoneNumber('+447700900000'));
  });
});
