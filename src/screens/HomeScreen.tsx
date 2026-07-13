import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { copy } from '../constants/copy';
import { mockFirstName, mockMembers } from '../data/mock';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>{copy.home.greeting(mockFirstName)}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            hitSlop={8}
            style={styles.bellButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.bellIcon}>🔔</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('VerifyCall')}
          style={({ pressed }) => [styles.ctaCard, pressed && styles.ctaCardPressed]}
        >
          <View style={styles.ctaIconChip}>
            <Text style={styles.ctaIcon}>📞</Text>
          </View>
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>{copy.home.cta.title}</Text>
            <Text style={styles.ctaSubtitle}>{copy.home.cta.subtitle}</Text>
          </View>
        </Pressable>

        <Text style={styles.sectionLabel}>{copy.home.circle.label}</Text>
        <FlatList
          data={mockMembers}
          keyExtractor={(m) => m.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.circleRow}
          renderItem={({ item }) => (
            <View style={styles.memberItem}>
              <Avatar name={item.displayName} />
              <Text style={styles.memberName} numberOfLines={1}>
                {item.displayName}
              </Text>
            </View>
          )}
          ListFooterComponent={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.circle.add}
              style={styles.addMemberCircle}
              onPress={() => navigation.navigate('FamilyCircle')}
            >
              <Text style={styles.addMemberPlus}>+</Text>
            </Pressable>
          }
        />

        <Pressable onPress={() => navigation.navigate('WeeklyDigest')}>
          <Card tint="sage" style={styles.digestCard}>
            <Text style={styles.digestTitle}>Weekly digest</Text>
            <Text style={styles.digestSubtitle}>{copy.home.digest.teaser}</Text>
          </Card>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.text,
  },
  bellButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 22,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  ctaCardPressed: {
    backgroundColor: colors.navyDark,
  },
  ctaIconChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  ctaIcon: {
    fontSize: 24,
  },
  ctaTextWrap: {
    flex: 1,
  },
  ctaTitle: {
    color: colors.white,
    fontSize: typography.subtitle,
    fontWeight: '700',
    marginBottom: 4,
  },
  ctaSubtitle: {
    color: colors.goldLight,
    fontSize: typography.body,
  },
  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  circleRow: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  memberItem: {
    alignItems: 'center',
    width: 72,
  },
  memberName: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.text,
  },
  addMemberCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  addMemberPlus: {
    fontSize: 26,
    color: colors.navy,
  },
  digestCard: {
    borderLeftWidth: 0,
  },
  digestTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  digestSubtitle: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
});
