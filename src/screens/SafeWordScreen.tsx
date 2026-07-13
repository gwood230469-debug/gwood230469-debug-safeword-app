import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeWordForm } from '../components/SafeWordForm';
import { ScreenContainer } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SafeWord'>;

export function SafeWordScreen({}: Props) {
  return (
    <ScreenContainer>
      <SafeWordForm
        headline="Safe word"
        savedMessage="Saved. Everyone in your circle will get a quiet notification that it changed."
        onSaved={() => {}}
      />
    </ScreenContainer>
  );
}
