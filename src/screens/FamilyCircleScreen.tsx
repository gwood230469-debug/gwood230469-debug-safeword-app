import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { ScreenContainer } from '../components/ScreenContainer';
import { copy } from '../constants/copy';
import { useCircle } from '../context/CircleContext';
import { useProfile } from '../context/ProfileContext';
import { getInviteTokenForMember } from '../lib/circle';
import { getErrorMessage } from '../lib/errors';
import { shareInvite } from '../lib/invite';
import { colors, spacing, touchTarget, typography } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';
import { CircleMember } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'FamilyCircle'>;

export function FamilyCircleScreen({ navigation }: Props) {
  const { members } = useCircle();
  const { displayName } = useProfile();

  const onResend = async (member: CircleMember) => {
    try {
      const token = await getInviteTokenForMember(member.id);
      if (!token) {
        Alert.alert(
          'Could not resend invite',
          "We couldn't find an active invite link for this person. Please try again in a moment."
        );
        return;
      }
      await shareInvite(displayName ?? 'Your family', member.displayName, token);
    } catch (e: unknown) {
      Alert.alert('Could not resend invite', getErrorMessage(e, 'Please try again.'));
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.header}>Family circle</Text>
      <FlatList
        data={members}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <MemberRow member={item} onResend={onResend} />}
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

function MemberRow({ member, onResend }: { member: CircleMember; onResend: (member: CircleMember) => void }) {
  const pending = member.status === 'invited';
  return (
    <View style={styles.row}>
      <Avatar name={member.displayName} size={48} />
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{member.displayName}</Text>
        <Text style={styles.rowStatus}>{pending ? copy.circle.status.invited : 'Confirmed'}</Text>
      </View>
      {pending ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Resend invite to ${member.displayName}`}
          hitSlop={8}
          style={styles.resendButton}
          onPress={() => onResend(member)}
        >
          <Text style={styles.resendText}>{copy.circle.resend}</Text>
        </Pressable>
      ) : (
        member.phoneNumber && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Call ${member.displayName}`}
            hitSlop={8}
            style={styles.callIcon}
            onPress={() => Linking.openURL(`tel:${member.phoneNumber}`)}
          >
            <Text style={styles.callIconText} maxFontSizeMultiplier={1}>
              📞
            </Text>
          </Pressable>
        )
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
  rowStatus: {
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
  resendButton: {
    minHeight: touchTarget.minSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  resendText: {
    fontSize: typography.body,
    color: colors.navy,
    fontWeight: '600',
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
