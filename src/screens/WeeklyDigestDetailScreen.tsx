import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { getDigestItem } from '../lib/digest';
import { colors, spacing, typography } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';
import { DigestItem } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'WeeklyDigestDetail'>;

export function WeeklyDigestDetailScreen({ route }: Props) {
  const [item, setItem] = useState<DigestItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDigestItem(route.params.itemId)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch(() => {
        if (!cancelled) setItem(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [route.params.itemId]);

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      </ScreenContainer>
    );
  }

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
