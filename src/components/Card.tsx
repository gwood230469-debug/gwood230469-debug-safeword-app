import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme/tokens';

type CardProps = ViewProps & {
  accentBorder?: 'gold' | 'sage' | 'terracotta' | 'none';
  tint?: 'none' | 'sage';
};

export function Card({ style, accentBorder = 'none', tint = 'none', children, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        tint === 'sage' && { backgroundColor: colors.sageLight },
        accentBorder !== 'none' && {
          borderLeftWidth: 4,
          borderLeftColor:
            accentBorder === 'gold' ? colors.gold : accentBorder === 'sage' ? colors.sage : colors.terracotta,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
});
