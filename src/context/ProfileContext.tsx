import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createProfile, getOwnDisplayName } from '../lib/profile';
import { AuthProvider as SignInProvider } from '../types/models';
import { useAuth } from './AuthContext';

type ProfileContextValue = {
  loading: boolean;
  displayName: string | null;
  createProfile: (name: string, authProvider: SignInProvider) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayNameState] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setDisplayNameState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const name = await getOwnDisplayName(userId);
    setDisplayNameState(name);
    setLoading(false);
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
    <ProfileContext.Provider value={{ loading, displayName, createProfile: createProfileFn }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
