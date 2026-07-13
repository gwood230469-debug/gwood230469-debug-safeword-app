export type RootStackParamList = {
  Home: undefined;
  VerifyCall: undefined;
  SafeWord: undefined;
  FamilyCircle: undefined;
  WeeklyDigest: undefined;
  WeeklyDigestDetail: { itemId: string };
  Settings: undefined;
  OnboardingPhoneEntry: undefined;
  OnboardingOtp: { phoneNumber: string; displayName: string };
  OnboardingAddMembers: undefined;
  OnboardingSafeWord: undefined;
};
