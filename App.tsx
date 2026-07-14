import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Button } from './src/components/Button';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CircleProvider, useCircle } from './src/context/CircleContext';
import { PendingInviteProvider, usePendingInvite } from './src/context/PendingInviteContext';
import { ProfileProvider, useProfile } from './src/context/ProfileContext';
import { claimInvite } from './src/lib/circle';
import { registerForPushNotificationsAsync, saveOwnPushToken } from './src/lib/push';
import { captureException, initSentry } from './src/lib/sentry';
import { RootNavigator } from './src/navigation/RootNavigator';
import { RootStackParamList } from './src/navigation/types';
import { colors, spacing, typography } from './src/theme/tokens';

// Once per app start, not per render — mirrors Notifications.setNotificationHandler in push.ts.
initSentry();

function Root() {
  const { session, loading: authLoading } = useAuth();
  const {
    loading: circleLoading,
    circleId,
    members,
    hasSafeWord,
    error: circleError,
    refresh: refreshCircle,
  } = useCircle();
  const { loading: profileLoading, displayName } = useProfile();
  const { token: pendingInviteToken, clear: clearPendingInvite } = usePendingInvite();
  const [claimingInvite, setClaimingInvite] = useState(false);
  const claimAttempted = useRef(false);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;
    registerForPushNotificationsAsync().then((token) => {
      if (token)
        saveOwnPushToken(userId, token).catch((e) => {
          captureException(e);
        });
    });
  }, [session?.user.id]);

  // Already signed in (this device was used before, or is mid-session) and an
  // invite link just came in — claim it and pick up the resulting circle
  // rather than falling through to "does this user already have a circle".
  useEffect(() => {
    const userId = session?.user.id;
    if (!userId || !pendingInviteToken || !displayName || claimAttempted.current) return;
    claimAttempted.current = true;
    setClaimingInvite(true);
    claimInvite(pendingInviteToken)
      .then(() => refreshCircle(userId))
      .catch((e) => {
        // Invalid/expired invite: fall through to normal routing below, but
        // still report it so it's not silently invisible to us.
        captureException(e);
      })
      .finally(() => {
        clearPendingInvite();
        setClaimingInvite(false);
      });
  }, [session?.user.id, pendingInviteToken, displayName, refreshCircle, clearPendingInvite]);

  if (authLoading || claimingInvite || (session && (circleLoading || profileLoading))) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  // Loading finished but refresh() hit an error (e.g. a Supabase/RLS
  // failure) rather than genuinely finding "no circle yet" — surface it
  // instead of silently falling through to the onboarding flow.
  if (circleId === null && members.length === 0 && circleError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{circleError}</Text>
        <Button label="Try again" onPress={() => refreshCircle()} style={styles.retryButton} />
      </View>
    );
  }

  const hasConfirmedMember = members.some((m) => m.status === 'confirmed');

  let initialRouteName: keyof RootStackParamList;
  if (!session) {
    initialRouteName = 'OnboardingSignIn';
  } else if (!circleId) {
    initialRouteName = 'OnboardingAddMembers';
  } else if (!hasSafeWord && hasConfirmedMember) {
    // Safe word setup only makes sense once at least one other member has confirmed.
    initialRouteName = 'OnboardingSafeWord';
  } else {
    initialRouteName = 'Home';
  }

  return <RootNavigator initialRouteName={initialRouteName} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <CircleProvider>
            <PendingInviteProvider>
              <NavigationContainer>
                <Root />
                <StatusBar style="dark" />
              </NavigationContainer>
            </PendingInviteProvider>
          </CircleProvider>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 160,
  },
});
