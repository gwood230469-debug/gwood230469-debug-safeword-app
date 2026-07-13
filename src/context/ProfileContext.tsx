import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getOwnDisplayName, setOwnDisplayName } from '../lib/profile';
import { useAuth } from './AuthContext';

type ProfileContextValue = {
  loading: boolean;
  displayName: string | null;
  setDisplayName: (name: string) => Promise<void>;
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

  const setDisplayName = useCallback(
    async (name: string) => {
      if (!userId) throw new Error('Not signed in');
      await setOwnDisplayName(userId, name);
      setDisplayNameState(name);
    },
    [userId]
  );

  return (
    <ProfileContext.Provider value={{ loading, displayName, setDisplayName }}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
