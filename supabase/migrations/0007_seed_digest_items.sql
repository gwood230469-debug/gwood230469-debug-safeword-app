-- ============================================================================
-- Seeds the digest_items table with the real UK scam-warning content that
-- previously only existed as mock data in src/data/mock.ts. Idempotent via
-- fixed uuids + `on conflict do nothing`, so re-running this migration never
-- duplicates the seed rows.
-- ============================================================================

insert into digest_items (id, title, body, published_at, region)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Fake grandchild calls asking for bail money',
    'Scammers use AI voice cloning to sound like a grandchild in trouble, asking for money to be sent urgently. If you get a call like this, hang up and use your family''s safe word before you send anything.',
    '2026-07-08T00:00:00Z',
    'UK'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Bank "fraud department" callback scams',
    'Callers pretend to be from your bank''s fraud team and ask you to move money to a "safe account." Real banks never ask you to do this over the phone.',
    '2026-07-01T00:00:00Z',
    'UK'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Delivery text scams asking for a small fee',
    'Texts claiming a parcel is held for a small redelivery fee lead to fake payment pages that steal card details.',
    '2026-06-24T00:00:00Z',
    'UK'
  )
on conflict (id) do nothing;
