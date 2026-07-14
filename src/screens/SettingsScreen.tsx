import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { copy } from '../constants/copy';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, touchTarget, typography } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { signOut } = useAuth();

  const onSignOut = async () => {
    try {
      await signOut();
      navigation.reset({ index: 0, routes: [{ name: 'OnboardingSignIn' }] });
    } catch (e: any) {
      Alert.alert('Could not sign out', e?.message ?? 'Please try again.');
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.header}>Settings</Text>
      <SettingsRow label={copy.settings.changeSafeWord} onPress={() => navigation.navigate('SafeWord')} />
      <SettingsRow label={copy.settings.manageCircle} onPress={() => navigation.navigate('FamilyCircle')} />
      <SettingsRow label={`${copy.settings.notifications} (coming soon)`} disabled />
      <SettingsRow label={copy.settings.signOut} onPress={onSignOut} isLast />
    </ScreenContainer>
  );
}

function SettingsRow({
  label,
  onPress,
  isLast,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  isLast?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={disabled ? { disabled: true } : undefined}
      style={[styles.row, isLast && styles.rowLast, disabled && styles.rowDisabled]}
    >
      <Text style={[styles.rowLabel, disabled && styles.rowLabelDisabled]}>{label}</Text>
      {!disabled && (
        <Text style={styles.chevron} maxFontSizeMultiplier={1.3}>
          ›
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: touchTarget.minSize + 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowLabel: {
    fontSize: typography.bodyLarge,
    color: colors.text,
  },
  rowLabelDisabled: {
    color: colors.textMuted,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
  },
});
