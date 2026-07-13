import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { copy } from '../../constants/copy';
import { useAuth } from '../../context/AuthContext';
import { normalizePhoneNumber } from '../../lib/phone';
import { colors, radius, spacing, touchTarget, typography } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingPhoneEntry'>;

export function PhoneEntryScreen({ navigation }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const { sendOtp } = useAuth();

  const sendCode = async () => {
    const trimmedName = displayName.trim();
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!trimmedName || !normalizedPhone) return;
    setSending(true);
    setError(null);
    const { error: sendError } = await sendOtp(normalizedPhone);
    setSending(false);
    if (sendError) {
      setError(sendError);
      return;
    }
    navigation.navigate('OnboardingOtp', { phoneNumber: normalizedPhone, displayName: trimmedName });
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.content}>
          <Text style={styles.title}>{copy.onboarding.phoneEntry.title}</Text>
          <Text style={styles.subtitle}>{copy.onboarding.phoneEntry.subtitle}</Text>

          <TextInput
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              setError(null);
            }}
            placeholder="Your first name"
            placeholderTextColor={colors.textMuted}
            autoComplete="name"
            style={styles.input}
            accessibilityLabel="Your first name"
          />

          <TextInput
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setError(null);
            }}
            placeholder="+44 7700 900000"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            autoComplete="tel"
            style={styles.input}
            accessibilityLabel="Phone number"
          />

          {error && <Text style={styles.error}>⚠ {error}</Text>}

          <Button
            label={sending ? 'Sending…' : 'Send code'}
            variant="primary"
            onPress={sendCode}
            disabled={!displayName.trim() || !phoneNumber.trim() || sending}
          />
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
    fontSize: typography.bodyLarge,
    color: colors.text,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
});
