import * as Linking from 'expo-linking';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { parseInviteToken } from '../lib/invite';

type PendingInviteContextValue = {
  token: string | null;
  clear: () => void;
};

const PendingInviteContext = createContext<PendingInviteContextValue | undefined>(undefined);

export function PendingInviteProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {
        if (!url) return;
        const parsed = parseInviteToken(url);
        if (parsed) setToken(parsed);
      })
      .catch(() => {});

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const parsed = parseInviteToken(url);
      if (parsed) setToken(parsed);
    });

    return () => subscription.remove();
  }, []);

  const clear = useCallback(() => setToken(null), []);

  return <PendingInviteContext.Provider value={{ token, clear }}>{children}</PendingInviteContext.Provider>;
}

export function usePendingInvite() {
  const ctx = useContext(PendingInviteContext);
  if (!ctx) throw new Error('usePendingInvite must be used within a PendingInviteProvider');
  return ctx;
}
