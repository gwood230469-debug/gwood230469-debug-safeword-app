import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { copy } from '../../constants/copy';
import { colors, radius, spacing, touchTarget, typography } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingOtp'>;

export function OtpScreen({ route, navigation }: Props) {
  const [code, setCode] = useState('');

  const confirmCode = () => {
    if (code.trim().length < 6) return;
    // Verifies the OTP against `route.params.phoneNumber` via Supabase once auth is wired.
    navigation.navigate('OnboardingAddMembers');
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
          onChangeText={setCode}
          placeholder="123456"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
          accessibilityLabel="Verification code"
        />

        <Button label="Confirm" variant="primary" onPress={confirmCode} disabled={code.trim().length < 6} />
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
