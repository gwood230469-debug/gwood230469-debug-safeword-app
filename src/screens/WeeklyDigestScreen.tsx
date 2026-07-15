import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { getErrorMessage } from '../lib/errors';
import { listDigestItems } from '../lib/digest';
import { colors, spacing, typography } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';
import { DigestItem } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'WeeklyDigest'>;

export function WeeklyDigestScreen({ navigation }: Props) {
  const [items, setItems] = useState<DigestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listDigestItems()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getErrorMessage(e, 'Could not load the weekly digest.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.header}>Weekly digest</Text>
      {error ? (
        <Text style={styles.errorText}>⚠ {error}</Text>
      ) : items.length === 0 ? (
        <Text style={styles.emptyText}>No digest items yet — check back soon.</Text>
      ) : (
        <FlatList
          data={items}
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
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: typography.body,
    color: colors.text,
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
