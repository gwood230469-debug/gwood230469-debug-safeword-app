import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CircleProvider, useCircle } from './src/context/CircleContext';
import { PendingInviteProvider, usePendingInvite } from './src/context/PendingInviteContext';
import { ProfileProvider, useProfile } from './src/context/ProfileContext';
import { claimInvite } from './src/lib/circle';
import { registerForPushNotificationsAsync, saveOwnPushToken } from './src/lib/push';
import { RootNavigator } from './src/navigation/RootNavigator';
import { RootStackParamList } from './src/navigation/types';
import { colors } from './src/theme/tokens';

function Root() {
  const { session, loading: authLoading } = useAuth();
  const { loading: circleLoading, circleId, members, hasSafeWord, refresh: refreshCircle } = useCircle();
  const { loading: profileLoading, displayName } = useProfile();
  const { token: pendingInviteToken, clear: clearPendingInvite } = usePendingInvite();
  const [claimingInvite, setClaimingInvite] = useState(false);
  const claimAttempted = useRef(false);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;
    registerForPushNotificationsAsync().then((token) => {
      if (token) saveOwnPushToken(userId, token).catch(() => {});
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
      .catch(() => {})
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
  },
});
