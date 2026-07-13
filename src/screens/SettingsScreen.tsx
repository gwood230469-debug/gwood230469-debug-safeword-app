import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { copy } from '../constants/copy';
import { colors, spacing, touchTarget, typography } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <Text style={styles.header}>Settings</Text>
      <SettingsRow label={copy.settings.changeSafeWord} onPress={() => navigation.navigate('SafeWord')} />
      <SettingsRow label={copy.settings.manageCircle} onPress={() => navigation.navigate('FamilyCircle')} />
      <SettingsRow label={copy.settings.notifications} onPress={() => {}} isLast />
    </ScreenContainer>
  );
}

function SettingsRow({ label, onPress, isLast }: { label: string; onPress: () => void; isLast?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.row, isLast && styles.rowLast]}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
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
  rowLabel: {
    fontSize: typography.bodyLarge,
    color: colors.text,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
  },
});
