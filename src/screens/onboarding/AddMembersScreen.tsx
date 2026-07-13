import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { copy } from '../../constants/copy';
import { colors, radius, spacing, touchTarget, typography } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingAddMembers'>;

type DraftMember = { id: string; name: string; phoneNumber: string };

export function AddMembersScreen({ navigation }: Props) {
  const [added, setAdded] = useState<DraftMember[]>([]);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const addMember = () => {
    if (!name.trim() || !phoneNumber.trim()) return;
    // Creates a CircleMember row with status "invited" and sends an SMS invite once backend is wired.
    setAdded((prev) => [...prev, { id: `${Date.now()}`, name: name.trim(), phoneNumber: phoneNumber.trim() }]);
    setName('');
    setPhoneNumber('');
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{copy.onboarding.addMembers.title}</Text>
      <Text style={styles.subtitle}>{copy.onboarding.addMembers.subtitle}</Text>

      <FlatList
        data={added}
        keyExtractor={(m) => m.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.addedRow}>
            <Text style={styles.addedName}>{item.name}</Text>
            <Text style={styles.addedPhone}>{item.phoneNumber}</Text>
          </View>
        )}
      />

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        accessibilityLabel="Family member name"
      />
      <TextInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="+44 7700 900000"
        placeholderTextColor={colors.textMuted}
        keyboardType="phone-pad"
        style={styles.input}
        accessibilityLabel="Family member phone number"
      />

      <Button label={copy.circle.addAnother} variant="outline" onPress={addMember} disabled={!name.trim() || !phoneNumber.trim()} style={styles.addButton} />

      <Button
        label="Continue"
        variant="primary"
        onPress={() => navigation.navigate('OnboardingSafeWord')}
        disabled={added.length === 0}
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
  addButton: {
    marginBottom: spacing.xl,
  },
});
