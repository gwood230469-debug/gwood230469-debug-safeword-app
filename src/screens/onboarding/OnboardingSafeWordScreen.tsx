import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { SafeWordForm } from '../../components/SafeWordForm';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useCircle } from '../../context/CircleContext';
import { colors, spacing, typography } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingSafeWord'>;

export function OnboardingSafeWordScreen({ navigation }: Props) {
  const { members, saveSafeWord } = useCircle();
  const hasConfirmedMember = members.some((m) => m.status === 'confirmed');

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  if (!hasConfirmedMember) {
    return (
      <ScreenContainer>
        <Text style={styles.waitingTitle}>Almost there</Text>
        <Text style={styles.waitingBody}>
          Once at least one family member confirms their phone, you'll be able to choose your circle's safe word.
          We'll let you know.
        </Text>
        <Button label="Continue to home" variant="primary" onPress={goHome} style={styles.waitingButton} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <SafeWordForm
        headline="Choose your safe word"
        savedMessage="Your circle is set up."
        onSaved={async (value) => {
          await saveSafeWord(value);
          goHome();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  waitingTitle: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  waitingBody: {
    fontSize: typography.bodyLarge,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  waitingButton: {
    marginTop: spacing.md,
  },
});
