import { describe, expect, it } from 'vitest';
import { getErrorCode, getErrorMessage } from '../errors';

describe('getErrorMessage', () => {
  it('returns the message from an Error instance', () => {
    expect(getErrorMessage(new Error('boom'), 'fallback')).toBe('boom');
  });

  it('returns the message from a plain object with a string message', () => {
    expect(getErrorMessage({ message: 'plain object failure' }, 'fallback')).toBe('plain object failure');
  });

  it('falls back for a thrown string', () => {
    expect(getErrorMessage('just a string', 'fallback')).toBe('fallback');
  });

  it('falls back for a thrown number', () => {
    expect(getErrorMessage(42, 'fallback')).toBe('fallback');
  });

  it('falls back for null', () => {
    expect(getErrorMessage(null, 'fallback')).toBe('fallback');
  });

  it('falls back for undefined', () => {
    expect(getErrorMessage(undefined, 'fallback')).toBe('fallback');
  });

  it('falls back when message is present but not a string', () => {
    expect(getErrorMessage({ message: 404 }, 'fallback')).toBe('fallback');
  });

  it('falls back when message is an empty string', () => {
    expect(getErrorMessage({ message: '' }, 'fallback')).toBe('fallback');
  });
});

describe('getErrorCode', () => {
  it('returns the code from a native-SDK-style error object', () => {
    expect(getErrorCode({ code: 'ERR_REQUEST_CANCELED' })).toBe('ERR_REQUEST_CANCELED');
  });

  it('returns undefined when there is no code', () => {
    expect(getErrorCode(new Error('boom'))).toBeUndefined();
  });

  it('returns undefined when code is present but not a string', () => {
    expect(getErrorCode({ code: 1 })).toBeUndefined();
  });

  it('returns undefined for non-object values', () => {
    expect(getErrorCode('just a string')).toBeUndefined();
    expect(getErrorCode(null)).toBeUndefined();
    expect(getErrorCode(undefined)).toBeUndefined();
  });
});
