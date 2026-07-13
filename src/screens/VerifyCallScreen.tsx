import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { copy } from '../constants/copy';
import { mockMembers } from '../data/mock';
import { colors, spacing, typography } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';
import { CircleMember } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyCall'>;

const confirmedMembers = mockMembers.filter((m) => m.status === 'confirmed');

export function VerifyCallScreen({ navigation }: Props) {
  const [selectedMember, setSelectedMember] = useState<CircleMember | null>(confirmedMembers[0] ?? null);
  const [loopInPickerVisible, setLoopInPickerVisible] = useState(false);
  const [loopInSentTo, setLoopInSentTo] = useState<string | null>(null);

  const callDirectly = (member: CircleMember) => {
    Linking.openURL(`tel:${member.phoneNumber}`);
  };

  const requestLoopIn = (member: CircleMember) => {
    // Creates a VerificationEvent (type: loop_in_request) and pushes copy.loopin.notification to `member` once backend is wired.
    setLoopInSentTo(member.displayName);
    setLoopInPickerVisible(false);
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
            <Button
              label={copy.verify.call.button(selectedMember.displayName)}
              variant="primary"
              onPress={() => callDirectly(selectedMember)}
              style={styles.callButton}
            />
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
              data={mockMembers.filter((m) => m.status === 'confirmed' && m.id !== selectedMember?.id)}
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
