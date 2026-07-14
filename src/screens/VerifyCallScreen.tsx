import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { copy } from '../constants/copy';
import { useAuth } from '../context/AuthContext';
import { useCircle } from '../context/CircleContext';
import { useProfile } from '../context/ProfileContext';
import { getPushToken, sendPushNotification } from '../lib/push';
import { createLoopInEvent } from '../lib/verification';
import { colors, spacing, typography } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';
import { CircleMember } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyCall'>;

// Purely a client-side "don't let an accidental double-tap send two loop-in
// requests to the same person" guard, not a security control — a member
// selected within this window is filtered out of the picker.
const LOOP_IN_COOLDOWN_MS = 60_000;

export function VerifyCallScreen({ navigation }: Props) {
  const { session } = useAuth();
  const { displayName } = useProfile();
  const { circleId, members } = useCircle();
  const confirmedMembers = members.filter((m) => m.status === 'confirmed');
  const [selectedMember, setSelectedMember] = useState<CircleMember | null>(null);
  const [loopInPickerVisible, setLoopInPickerVisible] = useState(false);
  const [loopInSentTo, setLoopInSentTo] = useState<string | null>(null);
  const [recentLoopIns, setRecentLoopIns] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!selectedMember && confirmedMembers.length > 0) {
      setSelectedMember(confirmedMembers[0]);
    }
  }, [confirmedMembers, selectedMember]);

  const callDirectly = (member: CircleMember) => {
    if (!member.phoneNumber) return;
    Linking.openURL(`tel:${member.phoneNumber}`);
  };

  const requestLoopIn = async (member: CircleMember) => {
    const userId = session?.user.id;
    if (!circleId || !userId) return;

    try {
      await createLoopInEvent(circleId, userId);
    } catch (e: any) {
      Alert.alert('Could not send request', e?.message ?? 'Please try again.');
      return;
    }

    setRecentLoopIns((prev) => {
      const next = new Map(prev);
      next.set(member.id, Date.now());
      return next;
    });
    setLoopInPickerVisible(false);
    setLoopInSentTo(member.displayName);

    // Best-effort push notification: the VerificationEvent above is already
    // the source of truth, so a failure here shouldn't affect the "sent"
    // confirmation the user just saw.
    if (member.userId) {
      try {
        const token = await getPushToken(member.userId);
        if (token) {
          await sendPushNotification(token, 'Family Circle', copy.loopin.notification(displayName ?? 'Someone in your circle'));
        }
      } catch (e) {
        console.warn('Could not send loop-in push notification', e);
      }
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>{copy.home.cta.title}</Text>

        <Card accentBorder="gold" style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>{copy.verify.instruction.title}</Text>
          <Text style={styles.instructionBody}>{copy.verify.instruction.body}</Text>
        </Card>

        <Text style={styles.sectionLabel}>Who is this about?</Text>
        <View style={styles.memberPicker}>
          {confirmedMembers.map((member) => {
            const selected = selectedMember?.id === member.id;
            return (
              <Pressable
                key={member.id}
                onPress={() => setSelectedMember(member)}
                style={[styles.memberChip, selected && styles.memberChipSelected]}
              >
                <Text style={[styles.memberChipText, selected && styles.memberChipTextSelected]}>
                  {member.displayName}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedMember && (
          <>
            {selectedMember.phoneNumber && (
              <Button
                label={copy.verify.call.button(selectedMember.displayName)}
                variant="primary"
                onPress={() => callDirectly(selectedMember)}
                style={styles.callButton}
              />
            )}
            <Button
              label={copy.verify.loopin.button}
              variant="outline"
              onPress={() => setLoopInPickerVisible(true)}
              style={styles.loopInButton}
            />
          </>
        )}

        {loopInSentTo && (
          <Card accentBorder="sage" tint="sage" style={styles.confirmationCard}>
            <Text style={styles.confirmationText}>{loopInSentTo} has been notified and can help you check.</Text>
          </Card>
        )}

        <Text style={styles.footer}>{copy.verify.footer}</Text>
      </ScrollView>

      <Modal visible={loopInPickerVisible} animationType="slide" transparent onRequestClose={() => setLoopInPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Loop in someone else</Text>
            <FlatList
              data={confirmedMembers.filter((m) => {
                if (m.id === selectedMember?.id) return false;
                const lastLoopInAt = recentLoopIns.get(m.id);
                return !lastLoopInAt || Date.now() - lastLoopInAt >= LOOP_IN_COOLDOWN_MS;
              })}
              keyExtractor={(m) => m.id}
              renderItem={({ item }) => (
                <Pressable style={styles.modalRow} onPress={() => requestLoopIn(item)}>
                  <Avatar name={item.displayName} size={44} />
                  <Text style={styles.modalRowText}>{item.displayName}</Text>
                </Pressable>
              )}
            />
            <Button label="Cancel" variant="outline" onPress={() => setLoopInPickerVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  instructionCard: {
    marginBottom: spacing.xl,
  },
  instructionTitle: {
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  instructionBody: {
    fontSize: typography.body,
    color: colors.text,
  },
  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  memberPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  memberChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  memberChipSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  memberChipText: {
    fontSize: typography.body,
    color: colors.text,
  },
  memberChipTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  callButton: {
    marginBottom: spacing.md,
  },
  loopInButton: {
    marginBottom: spacing.lg,
  },
  confirmationCard: {
    marginBottom: spacing.lg,
  },
  confirmationText: {
    fontSize: typography.body,
    color: colors.text,
  },
  footer: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 42, 74, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalRowText: {
    fontSize: typography.body,
    color: colors.text,
  },
});
