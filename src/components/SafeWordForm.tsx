import * as ScreenCapture from 'expo-screen-capture';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from './Button';
import { copy } from '../constants/copy';
import { colors, lineHeight, radius, spacing, touchTarget, typography } from '../theme/tokens';

type Props = {
  headline: string;
  savedMessage: string;
  saveLabel?: string;
  onSaved: (value: string) => void | Promise<void>;
};

export function SafeWordForm({ headline, savedMessage, saveLabel, onSaved }: Props) {
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useScreenCaptureProtection();

  const onSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    await onSaved(value.trim());
    setSaving(false);
    setSaved(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>{headline}</Text>
      <Text style={styles.instruction}>{copy.safeword.instruction}</Text>

      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={(text) => {
            setValue(text);
            setSaved(false);
          }}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Enter your safe word"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          accessibilityLabel="Safe word"
        />
      </View>

      <Text style={styles.guidance}>{copy.safeword.guidance}</Text>

      <Button
        label={saving ? 'Saving…' : saveLabel ?? copy.safeword.save}
        variant="accent"
        onPress={onSave}
        disabled={!value.trim() || saving}
        style={styles.saveButton}
      />

      {saved && <Text style={styles.savedNote}>{savedMessage}</Text>}
    </ScrollView>
  );
}

function useScreenCaptureProtection() {
  // Prevents screenshots/recording while this screen is mounted (Android also hides it from the app switcher via FLAG_SECURE).
  ScreenCapture.usePreventScreenCapture('safe-word-screen');

  useEffect(() => {
    // iOS-only blur so the safe word isn't visible in app-switcher previews or background snapshots.
    ScreenCapture.enableAppSwitcherProtectionAsync(1.0).catch(() => {});
    return () => {
      ScreenCapture.disableAppSwitcherProtectionAsync().catch(() => {});
    };
  }, []);
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  header: {
    fontSize: typography.title,
    lineHeight: lineHeight.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  instruction: {
    fontSize: typography.bodyLarge,
    lineHeight: lineHeight.bodyLarge,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  inputWrap: {
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
  },
  guidance: {
    fontSize: typography.caption,
    lineHeight: lineHeight.caption,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  saveButton: {
    marginBottom: spacing.lg,
  },
  savedNote: {
    fontSize: typography.body,
    lineHeight: lineHeight.body,
    color: colors.sage,
    fontWeight: '700',
  },
});
