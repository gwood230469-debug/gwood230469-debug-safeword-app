import { AuthProvider } from '../types/models';

export type RootStackParamList = {
  Home: undefined;
  VerifyCall: undefined;
  SafeWord: undefined;
  FamilyCircle: undefined;
  WeeklyDigest: undefined;
  WeeklyDigestDetail: { itemId: string };
  Settings: undefined;
  OnboardingSignIn: undefined;
  OnboardingName: { authProvider: AuthProvider };
  OnboardingAddMembers: undefined;
  OnboardingSafeWord: undefined;
};
