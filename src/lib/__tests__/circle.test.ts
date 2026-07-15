import { beforeEach, describe, expect, it, vi } from 'vitest';

// circle.ts imports the shared `supabase` client (which validates env vars
// and calls createClient() at module load) — mock it entirely so these
// tests can control auth/query responses without touching real Supabase.
const mockGetSession = vi.fn();
const mockFrom = vi.fn();

vi.mock('../supabase', () => ({
  supabase: {
    auth: { getSession: (...args: unknown[]) => mockGetSession(...args) },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { createCircle } from '../circle';

describe('createCircle', () => {
  const userId = 'user-123';

  beforeEach(() => {
    mockGetSession.mockReset();
    mockFrom.mockReset();
  });

  it("throws a specific message when there's no session yet", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    await expect(createCircle(userId)).rejects.toThrow("Your sign-in isn't ready yet");
  });

  it('throws a specific message when the session belongs to a different user', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'someone-else' } } } });
    await expect(createCircle(userId)).rejects.toThrow('The signed-in account changed');
  });

  // Regression test for the real production bug this codebase hit: chaining
  // .insert(...).select().single() issues INSERT ... RETURNING, which
  // requires the new row to also satisfy a SELECT policy in the *same*
  // statement — a security-definer helper in that policy could see a
  // pre-insert snapshot and reject a row its own INSERT had just allowed,
  // producing "new row violates row-level security policy" despite a
  // perfectly valid insert. The fix was splitting the insert and the
  // read-back into two separate statements — this test asserts that shape
  // stays that way, so nobody "simplifies" it back to the broken pattern.
  it('inserts and reads back the new circle as two separate statements', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: userId } } } });

    const insertFn = vi.fn().mockResolvedValue({ error: null });
    const selectChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'circle-abc' }, error: null }),
    };
    const selectFn = vi.fn().mockReturnValue(selectChain);

    mockFrom.mockImplementation((table: string) => {
      expect(table).toBe('circles');
      return { insert: insertFn, select: selectFn };
    });

    const result = await createCircle(userId);

    expect(result).toBe('circle-abc');
    // The insert call must stand alone — not chained with .select() — since
    // chaining is exactly what caused the bug above.
    expect(insertFn).toHaveBeenCalledWith({ created_by: userId });
    expect(insertFn).toHaveBeenCalledTimes(1);
    expect(insertFn.mock.results[0]?.value).toBeInstanceOf(Promise);
    // The read-back happens as its own filtered query, not a .select() tacked
    // onto the insert chain.
    expect(selectFn).toHaveBeenCalledWith('id');
    expect(selectChain.eq).toHaveBeenCalledWith('created_by', userId);
    expect(selectChain.single).toHaveBeenCalled();
  });

  it('throws if the insert itself fails', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: userId } } } });
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: { message: 'insert failed' } }),
      select: vi.fn(),
    });
    await expect(createCircle(userId)).rejects.toMatchObject({ message: 'insert failed' });
  });

  it('throws if the read-back select fails after a successful insert', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: userId } } } });
    const selectChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'select failed' } }),
    };
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnValue(selectChain),
    });
    await expect(createCircle(userId)).rejects.toMatchObject({ message: 'select failed' });
  });
});
