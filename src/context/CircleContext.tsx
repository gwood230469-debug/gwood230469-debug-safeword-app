import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  createCircle,
  getOwnCircleState,
  inviteMember,
  listMembers,
  safeWordExists,
  setSafeWord as setSafeWordRow,
} from '../lib/circle';
import { hashSafeWord } from '../lib/safeWordHash';
import { CircleMember } from '../types/models';
import { useAuth } from './AuthContext';

type CircleContextValue = {
  loading: boolean;
  circleId: string | null;
  members: CircleMember[];
  hasSafeWord: boolean;
  refresh: () => Promise<void>;
  ensureOwnCircle: () => Promise<string>;
  addMember: (displayName: string, phoneNumber: string) => Promise<void>;
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

  const refresh = useCallback(async () => {
    if (!userId) {
      setCircleId(null);
      setMembers([]);
      setHasSafeWord(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const state = await getOwnCircleState(userId);
    if (state.role === 'none') {
      setCircleId(null);
      setMembers([]);
      setHasSafeWord(false);
      setLoading(false);
      return;
    }
    const [memberRows, wordExists] = await Promise.all([
      listMembers(state.circleId),
      safeWordExists(state.circleId),
    ]);
    setCircleId(state.circleId);
    setMembers(memberRows);
    setHasSafeWord(wordExists);
    setLoading(false);
  }, [userId]);

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
    async (displayName: string, phoneNumber: string) => {
      const id = await ensureOwnCircle();
      await inviteMember(id, displayName, phoneNumber);
      await refresh();
    },
    [ensureOwnCircle, refresh]
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
