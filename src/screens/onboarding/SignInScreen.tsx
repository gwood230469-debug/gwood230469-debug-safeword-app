import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAuth } from '../../context/AuthContext';
import { useCircle } from '../../context/CircleContext';
import { usePendingInvite } from '../../context/PendingInviteContext';
import { claimInvite } from '../../lib/circle';
import { getErrorMessage } from '../../lib/errors';
import { getOwnDisplayName } from '../../lib/profile';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';
import { AuthProvider } from '../../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingSignIn'>;

export function SignInScreen({ navigation }: Props) {
  const { signInWithApple, signInWithGoogle } = useAuth();
  const { refresh: refreshCircle } = useCircle();
  const { token: pendingInviteToken, clear: clearPendingInvite } = usePendingInvite();
  const [error, setError] = useState<string | null>(null);

  const afterSignIn = async (authProvider: AuthProvider, signInError: string | null, userId: string | null) => {
    if (signInError) {
      setError(signInError);
      return;
    }
    if (!userId) return;

    // Query directly rather than reading ProfileContext's `displayName` here —
    // its refresh is async and triggered by the same session change, so it
    // may still hold last render's (stale) value at this exact point.
    const existingName = await getOwnDisplayName(userId);
    if (!existingName) {
      navigation.navigate('OnboardingName', { authProvider });
      return;
    }

    // A pending invite link takes priority over "does this user already have
    // their own circle" — they're here to join someone else's.
    if (pendingInviteToken) {
      try {
        await claimInvite(pendingInviteToken);
      } catch {
        // Invalid/expired invite: fall through to normal routing below.
      }
      clearPendingInvite();
    }

    // Returning user with a profile already: navigate explicitly, since
    // RootNavigator's initialRouteName only applies at first mount — just
    // updating context state wouldn't move this screen on its own. Passing
    // userId directly sidesteps waiting on AuthContext's session listener.
    const { circleId, hasSafeWord, hasConfirmedMember } = await refreshCircle(userId);
    if (!circleId) {
      navigation.reset({ index: 0, routes: [{ name: 'OnboardingAddMembers' }] });
    } else if (!hasSafeWord && hasConfirmedMember) {
      navigation.reset({ index: 0, routes: [{ name: 'OnboardingSafeWord' }] });
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  // afterSignIn does a raw (un-caught) getOwnDisplayName() lookup before any
  // try/catch of its own — without one here, a Supabase failure at that
  // point would silently strand the user on this screen with no feedback
  // (no error shown, no navigation) instead of surfacing as a retryable error.
  const onApplePress = async () => {
    setError(null);
    try {
      const { error: signInError, userId } = await signInWithApple();
      await afterSignIn('apple', signInError, userId);
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Could not finish signing in. Please try again.'));
    }
  };

  const onGooglePress = async () => {
    setError(null);
    try {
      const { error: signInError, userId } = await signInWithGoogle();
      await afterSignIn('google', signInError, userId);
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Could not finish signing in. Please try again.'));
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to set up or join your family circle.</Text>

        {error && <Text style={styles.error}>⚠ {error}</Text>}

        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={radius.button}
            style={styles.appleButton}
            onPress={onApplePress}
          />
        )}

        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          style={styles.googleButton}
          onPress={onGooglePress}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.bodyLarge,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  error: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  appleButton: {
    width: '100%',
    height: 52,
  },
  googleButton: {
    width: '100%',
    height: 52,
  },
});
