import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeWordForm } from '../../components/SafeWordForm';
import { ScreenContainer } from '../../components/ScreenContainer';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingSafeWord'>;

export function OnboardingSafeWordScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <SafeWordForm
        headline="Choose your safe word"
        savedMessage="Your circle is set up."
        onSaved={() => {
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }}
      />
    </ScreenContainer>
  );
}
