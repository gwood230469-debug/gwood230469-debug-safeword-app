import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { ScreenContainer } from '../components/ScreenContainer';
import { copy } from '../constants/copy';
import { mockMembers } from '../data/mock';
import { colors, spacing, touchTarget, typography } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';
import { CircleMember } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'FamilyCircle'>;

export function FamilyCircleScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <Text style={styles.header}>Family circle</Text>
      <FlatList
        data={mockMembers}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <MemberRow member={item} />}
        ListFooterComponent={
          <Pressable
            style={styles.addRow}
            accessibilityRole="button"
            onPress={() => navigation.navigate('OnboardingAddMembers')}
          >
            <Text style={styles.addRowText}>+ {copy.circle.add}</Text>
          </Pressable>
        }
      />
    </ScreenContainer>
  );
}

function MemberRow({ member }: { member: CircleMember }) {
  const pending = member.status === 'invited';
  return (
    <View style={styles.row}>
      <Avatar name={member.displayName} size={48} />
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{member.displayName}</Text>
        {pending && <Text style={styles.rowPending}>Invited — waiting to confirm</Text>}
      </View>
      {!pending && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Call ${member.displayName}`}
          hitSlop={8}
          style={styles.callIcon}
          onPress={() => Linking.openURL(`tel:${member.phoneNumber}`)}
        >
          <Text style={styles.callIconText}>📞</Text>
        </Pressable>
      )}
    </View>
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: typography.bodyLarge,
    color: colors.text,
    fontWeight: '600',
  },
  rowPending: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  callIcon: {
    minWidth: touchTarget.minSize,
    minHeight: touchTarget.minSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIconText: {
    fontSize: 22,
  },
  addRow: {
    marginTop: spacing.lg,
    minHeight: touchTarget.minSize,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRowText: {
    fontSize: typography.body,
    color: colors.navy,
    fontWeight: '600',
  },
});
