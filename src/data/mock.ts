import { CircleMember, DigestItem } from '../types/models';

export const mockFirstName = 'Sam';

export const mockMembers: CircleMember[] = [
  {
    id: 'm1',
    circleId: 'c1',
    userId: 'u1',
    phoneNumber: '+447700900001',
    displayName: 'Mum',
    status: 'confirmed',
    invitedAt: '2026-06-01T10:00:00Z',
    confirmedAt: '2026-06-01T10:05:00Z',
  },
  {
    id: 'm2',
    circleId: 'c1',
    userId: 'u2',
    phoneNumber: '+447700900002',
    displayName: 'Dad',
    status: 'confirmed',
    invitedAt: '2026-06-01T10:00:00Z',
    confirmedAt: '2026-06-01T10:10:00Z',
  },
  {
    id: 'm3',
    circleId: 'c1',
    userId: 'u3',
    phoneNumber: '+447700900003',
    displayName: 'Priya',
    status: 'confirmed',
    invitedAt: '2026-06-02T09:00:00Z',
    confirmedAt: '2026-06-02T09:20:00Z',
  },
  {
    id: 'm4',
    circleId: 'c1',
    userId: null,
    phoneNumber: '+447700900004',
    displayName: 'Uncle Joe',
    status: 'invited',
    invitedAt: '2026-07-10T09:00:00Z',
    confirmedAt: null,
  },
];

export const mockDigestItems: DigestItem[] = [
  {
    id: 'd1',
    title: 'Fake grandchild calls asking for bail money',
    body: "Scammers use AI voice cloning to sound like a grandchild in trouble, asking for money to be sent urgently. If you get a call like this, hang up and use your family's safe word before you send anything.",
    publishedAt: '2026-07-08T00:00:00Z',
    region: 'UK',
  },
  {
    id: 'd2',
    title: 'Bank "fraud department" callback scams',
    body: 'Callers pretend to be from your bank\'s fraud team and ask you to move money to a "safe account." Real banks never ask you to do this over the phone.',
    publishedAt: '2026-07-01T00:00:00Z',
    region: 'UK',
  },
  {
    id: 'd3',
    title: 'Delivery text scams asking for a small fee',
    body: 'Texts claiming a parcel is held for a small redelivery fee lead to fake payment pages that steal card details.',
    publishedAt: '2026-06-24T00:00:00Z',
    region: 'UK',
  },
];
