-- Adds 3 more real UK scam-warning items to digest_items, following the
-- same pattern as 0007_seed_digest_items.sql (fixed uuids, idempotent via
-- on conflict do nothing). Three items looked thin for a feature called
-- "Weekly digest" — see supabase/DIGEST_RUNBOOK.md for how to add more.

insert into digest_items (id, title, body, published_at, region)
values
  (
    '44444444-4444-4444-4444-444444444444',
    '"Hi Mum, I''ve lost my phone" WhatsApp scams',
    'A message from an unknown number claims to be your child or grandchild texting from a borrowed phone after losing theirs, then asks you to urgently pay a bill or transfer money. Because it comes through a normal messaging app, it can feel more convincing than a phone call — but the same rule applies: use your family''s safe word before sending anything, even over text.',
    '2026-07-15T00:00:00Z',
    'UK'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Fake HMRC tax refund and fine texts',
    'Texts claiming you''re owed a tax refund, or that you owe a fine and must pay immediately to avoid legal action, link to convincing fake HMRC login pages that steal your bank details. HMRC will never ask for payment or personal details by text.',
    '2026-07-08T00:00:00Z',
    'UK'
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Investment and cryptocurrency cold calls',
    'Callers offering "guaranteed" high returns on an investment or crypto opportunity, often pressuring you to decide quickly, are a common way scammers target people looking to grow their savings. Legitimate investment firms don''t cold-call, and never pressure you to act before you''ve had time to check them out independently.',
    '2026-07-01T00:00:00Z',
    'UK'
  )
on conflict (id) do nothing;
