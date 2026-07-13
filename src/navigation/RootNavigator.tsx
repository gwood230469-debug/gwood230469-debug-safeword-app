import { NativeStackNavigationOptions, createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { colors, typography } from '../theme/tokens';
import { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { VerifyCallScreen } from '../screens/VerifyCallScreen';
import { SafeWordScreen } from '../screens/SafeWordScreen';
import { FamilyCircleScreen } from '../screens/FamilyCircleScreen';
import { WeeklyDigestScreen } from '../screens/WeeklyDigestScreen';
import { WeeklyDigestDetailScreen } from '../screens/WeeklyDigestDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SignInScreen } from '../screens/onboarding/SignInScreen';
import { NamePromptScreen } from '../screens/onboarding/NamePromptScreen';
import { AddMembersScreen } from '../screens/onboarding/AddMembersScreen';
import { OnboardingSafeWordScreen } from '../screens/onboarding/OnboardingSafeWordScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.navy,
  headerTitleStyle: { fontSize: typography.body, fontWeight: '700' },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

export function RootNavigator({ initialRouteName = 'Home' }: { initialRouteName?: keyof RootStackParamList }) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VerifyCall" component={VerifyCallScreen} options={{ title: '' }} />
      <Stack.Screen name="SafeWord" component={SafeWordScreen} options={{ title: '' }} />
      <Stack.Screen name="FamilyCircle" component={FamilyCircleScreen} options={{ title: '' }} />
      <Stack.Screen name="WeeklyDigest" component={WeeklyDigestScreen} options={{ title: '' }} />
      <Stack.Screen name="WeeklyDigestDetail" component={WeeklyDigestDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '' }} />
      <Stack.Screen
        name="OnboardingSignIn"
        component={SignInScreen}
        options={{ title: '', headerBackVisible: false }}
      />
      <Stack.Screen name="OnboardingName" component={NamePromptScreen} options={{ title: '' }} />
      <Stack.Screen name="OnboardingAddMembers" component={AddMembersScreen} options={{ title: '' }} />
      <Stack.Screen name="OnboardingSafeWord" component={OnboardingSafeWordScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
