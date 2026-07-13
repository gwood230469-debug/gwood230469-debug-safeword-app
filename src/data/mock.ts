import { DigestItem } from '../types/models';

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
