import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { mockDigestItems } from '../data/mock';
import { colors, spacing, typography } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'WeeklyDigest'>;

export function WeeklyDigestScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <Text style={styles.header}>Weekly digest</Text>
      <FlatList
        data={mockDigestItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('WeeklyDigestDetail', { itemId: item.id })}>
            <Card style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body} numberOfLines={2}>
                {item.body}
              </Text>
            </Card>
          </Pressable>
        )}
      />
    </ScreenContainer>
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
  listContent: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
});
