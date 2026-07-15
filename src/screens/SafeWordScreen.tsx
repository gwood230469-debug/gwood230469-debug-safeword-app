import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeWordForm } from '../components/SafeWordForm';
import { ScreenContainer } from '../components/ScreenContainer';
import { useCircle } from '../context/CircleContext';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SafeWord'>;

export function SafeWordScreen({}: Props) {
  const { saveSafeWord } = useCircle();

  return (
    <ScreenContainer>
      <SafeWordForm
        headline="Safe word"
        savedMessage="Saved. Everyone in your circle will get a quiet notification that it changed."
        onSaved={async (value) => {
          await saveSafeWord(value);
        }}
      />
    </ScreenContainer>
  );
}
