import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  createCircle,
  getOwnCircleState,
  inviteMember,
  listMembers,
  NewMemberInvite,
  safeWordExists,
  setSafeWord as setSafeWordRow,
} from '../lib/circle';
import { getErrorMessage } from '../lib/errors';
import { hashSafeWord } from '../lib/safeWordHash';
import { CircleMember } from '../types/models';
import { useAuth } from './AuthContext';

type RefreshResult = { circleId: string | null; hasSafeWord: boolean; hasConfirmedMember: boolean };

type CircleContextValue = {
  loading: boolean;
  circleId: string | null;
  members: CircleMember[];
  hasSafeWord: boolean;
  error: string | null;
  // Accepts an optional userId override for callers (like right after sign-in)
  // that know the correct id before AuthContext's session state has
  // necessarily propagated through a re-render yet.
  refresh: (overrideUserId?: string) => Promise<RefreshResult>;
  ensureOwnCircle: () => Promise<string>;
  addMember: (displayName: string, phoneNumber: string | null) => Promise<NewMemberInvite>;
  saveSafeWord: (rawValue: string) => Promise<void>;
};

const CircleContext = createContext<CircleContextValue | undefined>(undefined);

export function CircleProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const [loading, setLoading] = useState(true);
  const [circleId, setCircleId] = useState<string | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [hasSafeWord, setHasSafeWord] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (overrideUserId?: string): Promise<RefreshResult> => {
      setError(null);
      const effectiveUserId = overrideUserId ?? userId;
      if (!effectiveUserId) {
        setCircleId(null);
        setMembers([]);
        setHasSafeWord(false);
        setLoading(false);
        return { circleId: null, hasSafeWord: false, hasConfirmedMember: false };
      }
      setLoading(true);
      try {
        const state = await getOwnCircleState(effectiveUserId);
        if (state.role === 'none') {
          setCircleId(null);
          setMembers([]);
          setHasSafeWord(false);
          return { circleId: null, hasSafeWord: false, hasConfirmedMember: false };
        }
        const [memberRows, wordExists] = await Promise.all([
          listMembers(state.circleId),
          safeWordExists(state.circleId),
        ]);
        setCircleId(state.circleId);
        setMembers(memberRows);
        setHasSafeWord(wordExists);
        return {
          circleId: state.circleId,
          hasSafeWord: wordExists,
          hasConfirmedMember: memberRows.some((m) => m.status === 'confirmed'),
        };
      } catch (e: unknown) {
        setError(getErrorMessage(e, 'Could not load your circle.'));
        setCircleId(null);
        setMembers([]);
        setHasSafeWord(false);
        return { circleId: null, hasSafeWord: false, hasConfirmedMember: false };
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ensureOwnCircle = useCallback(async () => {
    if (circleId) return circleId;
    if (!userId) throw new Error('Not signed in');
    const newId = await createCircle(userId);
    setCircleId(newId);
    return newId;
  }, [circleId, userId]);

  const addMember = useCallback(
    async (displayName: string, phoneNumber: string | null) => {
      if (!userId) throw new Error('Not signed in');
      const id = await ensureOwnCircle();
      const invite = await inviteMember(id, userId, displayName, phoneNumber);
      await refresh();
      return invite;
    },
    [ensureOwnCircle, refresh, userId]
  );

  const saveSafeWord = useCallback(
    async (rawValue: string) => {
      if (!circleId || !userId) throw new Error('No circle to save a safe word for');
      const hashed = await hashSafeWord(rawValue);
      await setSafeWordRow(circleId, userId, hashed);
      setHasSafeWord(true);
    },
    [circleId, userId]
  );

  const value: CircleContextValue = {
    loading,
    circleId,
    members,
    hasSafeWord,
    error,
    refresh,
    ensureOwnCircle,
    addMember,
    saveSafeWord,
  };

  return <CircleContext.Provider value={value}>{children}</CircleContext.Provider>;
}

export function useCircle() {
  const ctx = useContext(CircleContext);
  if (!ctx) throw new Error('useCircle must be used within a CircleProvider');
  return ctx;
}
