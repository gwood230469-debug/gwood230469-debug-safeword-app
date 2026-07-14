import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getErrorMessage } from '../lib/errors';
import { createProfile, getOwnDisplayName } from '../lib/profile';
import { AuthProvider as SignInProvider } from '../types/models';
import { useAuth } from './AuthContext';

type ProfileContextValue = {
  loading: boolean;
  displayName: string | null;
  error: string | null;
  refresh: () => Promise<void>;
  createProfile: (name: string, authProvider: SignInProvider) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Without a try/catch here, a Supabase failure inside getOwnDisplayName
  // (it throws on error) would reject this promise with nothing to catch
  // it — an unhandled rejection, and `loading` would never flip back to
  // false, leaving App.tsx's loading gate stuck on a spinner forever.
  const refresh = useCallback(async () => {
    setError(null);
    if (!userId) {
      setDisplayNameState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const name = await getOwnDisplayName(userId);
      setDisplayNameState(name);
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Could not load your profile.'));
      setDisplayNameState(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createProfileFn = useCallback(
    async (name: string, authProvider: SignInProvider) => {
      if (!userId) throw new Error('Not signed in');
      await createProfile(userId, name, authProvider);
      setDisplayNameState(name);
    },
    [userId]
  );

  return (
    <ProfileContext.Provider value={{ loading, displayName, error, refresh, createProfile: createProfileFn }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
