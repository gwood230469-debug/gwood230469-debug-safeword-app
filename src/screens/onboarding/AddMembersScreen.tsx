import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { copy } from '../../constants/copy';
import { useCircle } from '../../context/CircleContext';
import { colors, radius, spacing, touchTarget, typography } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingAddMembers'>;

export function AddMembersScreen({ navigation }: Props) {
  const { members, addMember } = useCircle();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onAddAnother = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phoneNumber.trim();
    if (!trimmedName || !trimmedPhone) return;
    setSaving(true);
    setError(null);
    try {
      await addMember(trimmedName, trimmedPhone);
      setName('');
      setPhoneNumber('');
    } catch (e: any) {
      setError(e?.message ?? 'Could not add that family member.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{copy.onboarding.addMembers.title}</Text>
      <Text style={styles.subtitle}>{copy.onboarding.addMembers.subtitle}</Text>

      <FlatList
        data={members}
        keyExtractor={(m) => m.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.addedRow}>
            <Text style={styles.addedName}>{item.displayName}</Text>
            <Text style={styles.addedPhone}>{item.phoneNumber}</Text>
          </View>
        )}
      />

      <TextInput
        value={name}
        onChangeText={(text) => {
          setName(text);
          setError(null);
        }}
        placeholder="Name"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        accessibilityLabel="Family member name"
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
        style={styles.input}
        accessibilityLabel="Family member phone number"
      />

      {error && <Text style={styles.error}>⚠ {error}</Text>}

      <Button
        label={saving ? 'Adding…' : copy.circle.addAnother}
        variant="outline"
        onPress={onAddAnother}
        disabled={!name.trim() || !phoneNumber.trim() || saving}
        style={styles.addButton}
      />

      <Button
        label="Continue"
        variant="primary"
        onPress={() => navigation.navigate('OnboardingSafeWord')}
        disabled={members.length === 0}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  list: {
    maxHeight: 180,
    marginBottom: spacing.md,
  },
  addedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addedName: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  addedPhone: {
    fontSize: typography.body,
    color: colors.textMuted,
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
  error: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  addButton: {
    marginBottom: spacing.xl,
  },
});
