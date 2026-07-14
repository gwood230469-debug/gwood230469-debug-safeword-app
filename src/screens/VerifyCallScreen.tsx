import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { FlatList, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { colors, lineHeight, radius, shadow, spacing, touchTarget, typography } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';
import { CircleMember } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyCall'>;

export function VerifyCallScreen({ navigation }: Props) {
  const { session } = useAuth();
  const { displayName } = useProfile();
  const { circleId, members } = useCircle();
  const confirmedMembers = members.filter((m) => m.status === 'confirmed');
  const [selectedMember, setSelectedMember] = useState<CircleMember | null>(null);
  const [loopInPickerVisible, setLoopInPickerVisible] = useState(false);
  const [loopInSentTo, setLoopInSentTo] = useState<string | null>(null);

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
    setLoopInPickerVisible(false);
    setLoopInSentTo(member.displayName);

    const userId = session?.user.id;
    if (!circleId || !userId) return;
    await createLoopInEvent(circleId, userId);

    if (member.userId) {
      const token = await getPushToken(member.userId);
      if (token) {
        await sendPushNotification(token, 'Family Circle', copy.loopin.notification(displayName ?? 'Someone in your circle'));
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

        <Text style={styles.sectionLabel}>{copy.verify.picker.label}</Text>
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
            <Text style={styles.modalTitle}>{copy.verify.loopin.modalTitle}</Text>
            <FlatList
              data={confirmedMembers.filter((m) => m.id !== selectedMember?.id)}
              keyExtractor={(m) => m.id}
              renderItem={({ item }) => (
                <Pressable style={styles.modalRow} onPress={() => requestLoopIn(item)}>
                  <Avatar name={item.displayName} size={touchTarget.minSize} />
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
    lineHeight: lineHeight.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  instructionCard: {
    marginBottom: spacing.xl,
  },
  instructionTitle: {
    fontSize: typography.bodyLarge,
    lineHeight: lineHeight.bodyLarge,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  instructionBody: {
    fontSize: typography.body,
    lineHeight: lineHeight.body,
    color: colors.text,
  },
  sectionLabel: {
    // Deliberately not uppercase/letter-spaced: all-caps small text is
    // harder to read at a glance for low-vision users, so this leans on
    // size and weight instead, at full (not muted) text contrast.
    fontSize: typography.label,
    lineHeight: lineHeight.label,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  memberPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  memberChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: touchTarget.minSize,
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  memberChipSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  memberChipText: {
    fontSize: typography.bodyLarge,
    lineHeight: lineHeight.bodyLarge,
    color: colors.text,
  },
  memberChipTextSelected: {
    color: colors.white,
    fontWeight: '700',
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
    lineHeight: lineHeight.body,
    color: colors.text,
  },
  footer: {
    fontSize: typography.body,
    lineHeight: lineHeight.body,
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
    ...shadow.card,
  },
  modalTitle: {
    fontSize: typography.subtitle,
    lineHeight: lineHeight.subtitle,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: touchTarget.minSize,
  },
  modalRowText: {
    fontSize: typography.bodyLarge,
    lineHeight: lineHeight.bodyLarge,
    color: colors.text,
  },
});
