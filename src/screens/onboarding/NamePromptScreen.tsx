import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { copy } from '../../constants/copy';
import { useCircle } from '../../context/CircleContext';
import { usePendingInvite } from '../../context/PendingInviteContext';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { claimInvite } from '../../lib/circle';
import { colors, radius, spacing, touchTarget, typography } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingName'>;

export function NamePromptScreen({ route, navigation }: Props) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createProfile } = useProfile();
  const { session } = useAuth();
  const { refresh: refreshCircle } = useCircle();
  const { token: pendingInviteToken, clear: clearPendingInvite } = usePendingInvite();

  const onContinue = async () => {
    const trimmed = name.trim();
    const userId = session?.user.id;
    if (!trimmed || !userId) return;
    setSaving(true);
    setError(null);
    try {
      await createProfile(trimmed, route.params.authProvider);

      // A pending invite link (someone shared this app with them) means they're
      // joining an existing circle, not starting a brand new one.
      if (pendingInviteToken) {
        try {
          await claimInvite(pendingInviteToken);
        } catch {
          // Invalid/expired invite: fall through to the normal new-circle flow.
        }
        clearPendingInvite();
      }
      const { circleId } = await refreshCircle(userId);

      navigation.reset({
        index: 0,
        routes: [{ name: circleId ? 'Home' : 'OnboardingAddMembers' }],
      });
    } catch (e: any) {
      setError(e?.message ?? 'Could not save your name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>{copy.onboarding.name.prompt}</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your first name"
          placeholderTextColor={colors.textMuted}
          autoComplete="name"
          style={styles.input}
          accessibilityLabel="Your first name"
        />

        {error && <Text style={styles.error}>⚠ {error}</Text>}

        <Button
          label={saving ? 'Saving…' : 'Continue'}
          variant="primary"
          onPress={onContinue}
          disabled={!name.trim() || saving}
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
});
