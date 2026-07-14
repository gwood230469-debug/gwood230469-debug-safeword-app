import { Session } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getErrorCode, getErrorMessage } from '../lib/errors';
import { supabase } from '../lib/supabase';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signInWithApple: () => Promise<{ error: string | null; userId: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null; userId: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .catch(() => {
        setSession(null);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      signInWithApple: async () => {
        try {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
          if (!credential.identityToken) {
            return { error: 'Apple did not return an identity token.', userId: null };
          }
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
          });
          return { error: error?.message ?? null, userId: data.user?.id ?? null };
        } catch (e: unknown) {
          if (getErrorCode(e) === 'ERR_REQUEST_CANCELED') return { error: null, userId: null };
          return { error: getErrorMessage(e, 'Apple sign-in failed.'), userId: null };
        }
      },
      signInWithGoogle: async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const response = await GoogleSignin.signIn();
          if (response.type !== 'success' || !response.data.idToken) {
            return { error: null, userId: null };
          }
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.data.idToken,
          });
          return { error: error?.message ?? null, userId: data.user?.id ?? null };
        } catch (e: unknown) {
          return { error: getErrorMessage(e, 'Google sign-in failed.'), userId: null };
        }
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
