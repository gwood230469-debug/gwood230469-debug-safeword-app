import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { copy } from '../../constants/copy';
import { colors, radius, spacing, touchTarget, typography } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingPhoneEntry'>;

export function PhoneEntryScreen({ navigation }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const sendCode = () => {
    if (!phoneNumber.trim()) return;
    // Sends a Supabase phone OTP to `phoneNumber` once auth is wired.
    navigation.navigate('OnboardingOtp', { phoneNumber: phoneNumber.trim() });
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.content}>
          <Text style={styles.title}>{copy.onboarding.phoneEntry.title}</Text>
          <Text style={styles.subtitle}>{copy.onboarding.phoneEntry.subtitle}</Text>

          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+44 7700 900000"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            autoComplete="tel"
            style={styles.input}
            accessibilityLabel="Phone number"
          />

          <Button label="Send code" variant="primary" onPress={sendCode} disabled={!phoneNumber.trim()} />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
    fontSize: typography.bodyLarge,
    color: colors.text,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
});
