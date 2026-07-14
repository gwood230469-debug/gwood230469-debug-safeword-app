import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, lineHeight, radius, spacing, touchTarget, typography } from '../theme/tokens';

type Variant = 'primary' | 'accent' | 'outline';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  style?: ViewStyle;
  disabled?: boolean;
};

// Contrast note: navy text on gold passes WCAG AA (~5:1); white text on gold does not (~2.9:1).
export function Button({ label, onPress, variant = 'primary', style, disabled }: ButtonProps) {
  const variantStyle = variantStyles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        pressed && variantStyle.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, variantStyle.label]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget.minSize,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.bodyLarge,
    lineHeight: lineHeight.bodyLarge,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = {
  primary: StyleSheet.create({
    container: { backgroundColor: colors.navy },
    pressed: { backgroundColor: colors.navyDark },
    label: { color: colors.white },
  }),
  accent: StyleSheet.create({
    container: { backgroundColor: colors.gold },
    pressed: { backgroundColor: colors.gold, opacity: 0.85 },
    label: { color: colors.navy },
  }),
  outline: StyleSheet.create({
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.navy },
    pressed: { backgroundColor: colors.goldLight },
    label: { color: colors.navy },
  }),
};
