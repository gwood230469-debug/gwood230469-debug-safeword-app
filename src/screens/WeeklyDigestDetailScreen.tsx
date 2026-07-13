import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { mockDigestItems } from '../data/mock';
import { colors, spacing, typography } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'WeeklyDigestDetail'>;

export function WeeklyDigestDetailScreen({ route }: Props) {
  const item = mockDigestItems.find((d) => d.id === route.params.itemId);

  if (!item) {
    return (
      <ScreenContainer>
        <Text style={styles.body}>This item is no longer available.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  body: {
    fontSize: typography.bodyLarge,
    color: colors.text,
    lineHeight: 26,
  },
});
