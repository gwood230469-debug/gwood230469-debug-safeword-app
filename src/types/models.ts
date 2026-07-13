export type AuthProvider = 'apple' | 'google';

export type UserProfile = {
  id: string;
  authProvider: AuthProvider;
  displayName: string;
  createdAt: string;
};

export type MemberStatus = 'invited' | 'confirmed';

export type Circle = {
  id: string;
  createdBy: string;
  createdAt: string;
};

export type CircleMember = {
  id: string;
  circleId: string;
  userId: string | null;
  phoneNumber: string | null;
  displayName: string;
  status: MemberStatus;
  invitedAt: string;
  confirmedAt: string | null;
  avatarUrl?: string | null;
};

export type CircleInvite = {
  id: string;
  circleId: string;
  memberId: string;
  token: string;
  createdBy: string;
  expiresAt: string;
  usedAt: string | null;
};

export type SafeWord = {
  id: string;
  circleId: string;
  encryptedValue: string;
  updatedAt: string;
  updatedBy: string;
};

export type VerificationEventType = 'loop_in_request';

export type VerificationEvent = {
  id: string;
  circleId: string;
  triggeredBy: string;
  type: VerificationEventType;
  createdAt: string;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
};

export type DigestRegion = 'UK' | 'US';

export type DigestItem = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  region: DigestRegion;
};
