import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { copy } from '../../constants/copy';
import { useAuth } from '../../context/AuthContext';
import { useCircle } from '../../context/CircleContext';
import { useProfile } from '../../context/ProfileContext';
import { tryConfirmInvitedMembership } from '../../lib/circle';
import { colors, radius, spacing, touchTarget, typography } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingOtp'>;

export function OtpScreen({ route, navigation }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { confirmOtp } = useAuth();
  const { refresh: refreshCircle } = useCircle();
  const { setDisplayName } = useProfile();

  const confirmCode = async () => {
    if (code.trim().length < 6) return;
    setConfirming(true);
    setError(null);
    const { error: confirmError, userId } = await confirmOtp(route.params.phoneNumber, code.trim());
    if (confirmError || !userId) {
      setConfirming(false);
      setError(confirmError ?? 'Something went wrong confirming that code.');
      return;
    }

    await setDisplayName(route.params.displayName);

    // If someone already added this phone number to their circle, this links &
    // confirms that invited row — joining an existing circle, not creating one.
    const joinedExisting = await tryConfirmInvitedMembership(userId, route.params.phoneNumber);
    await refreshCircle();
    setConfirming(false);

    if (joinedExisting) {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } else {
      navigation.navigate('OnboardingAddMembers');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>{copy.onboarding.otp.title}</Text>
        <Text style={styles.subtitle}>
          {copy.onboarding.otp.subtitle} Sent to {route.params.phoneNumber}.
        </Text>

        <TextInput
          value={code}
          onChangeText={(text) => {
            setCode(text);
            setError(null);
          }}
          placeholder="123456"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
          accessibilityLabel="Verification code"
        />

        {error && <Text style={styles.error}>⚠ {error}</Text>}

        <Button
          label={confirming ? 'Confirming…' : 'Confirm'}
          variant="primary"
          onPress={confirmCode}
          disabled={code.trim().length < 6 || confirming}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.bodyLarge,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  error: {
    fontSize: typography.body,
    color: colors.text,
    marginTop: -spacing.sm,
  },
  input: {
    minHeight: touchTarget.minSize + 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    fontSize: typography.title,
    letterSpacing: 8,
    color: colors.text,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
});
