import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CircleProvider, useCircle } from './src/context/CircleContext';
import { ProfileProvider, useProfile } from './src/context/ProfileContext';
import { registerForPushNotificationsAsync, saveOwnPushToken } from './src/lib/push';
import { RootNavigator } from './src/navigation/RootNavigator';
import { RootStackParamList } from './src/navigation/types';
import { colors } from './src/theme/tokens';

function Root() {
  const { session, loading: authLoading } = useAuth();
  const { loading: circleLoading, circleId, members, hasSafeWord } = useCircle();
  const { loading: profileLoading } = useProfile();

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;
    registerForPushNotificationsAsync().then((token) => {
      if (token) saveOwnPushToken(userId, token).catch(() => {});
    });
  }, [session?.user.id]);

  if (authLoading || (session && (circleLoading || profileLoading))) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  const hasConfirmedMember = members.some((m) => m.status === 'confirmed');

  let initialRouteName: keyof RootStackParamList;
  if (!session) {
    initialRouteName = 'OnboardingPhoneEntry';
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
            <NavigationContainer>
              <Root />
              <StatusBar style="dark" />
            </NavigationContainer>
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
