-- Bug fix: the circle creator has no circle_members row for themselves, so
-- policies that only checked is_confirmed_member_of() locked the creator out
-- of their own circle's safe word and verification events. is_circle_member()
-- covers both "created it" and "is a confirmed member of it".

create function is_circle_member(target_circle_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select is_circle_creator(target_circle_id) or is_confirmed_member_of(target_circle_id);
$$;

drop policy "confirmed members can view their circle's safe word" on safe_words;
drop policy "confirmed members can set the safe word" on safe_words;
drop policy "confirmed members can change the safe word" on safe_words;

create policy "circle members can view their circle's safe word"
  on safe_words for select
  using (is_circle_member(circle_id));

create policy "circle members can set the safe word"
  on safe_words for insert
  with check (is_circle_member(circle_id) and updated_by = auth.uid());

create policy "circle members can change the safe word"
  on safe_words for update
  using (is_circle_member(circle_id))
  with check (is_circle_member(circle_id) and updated_by = auth.uid());

drop policy "confirmed members can view their circle's verification events" on verification_events;
drop policy "confirmed members can create a verification event" on verification_events;
drop policy "confirmed members can acknowledge a verification event" on verification_events;

create policy "circle members can view their circle's verification events"
  on verification_events for select
  using (is_circle_member(circle_id));

create policy "circle members can create a verification event"
  on verification_events for insert
  with check (is_circle_member(circle_id) and triggered_by = auth.uid());

create policy "circle members can acknowledge a verification event"
  on verification_events for update
  using (is_circle_member(circle_id))
  with check (is_circle_member(circle_id));

-- ── push_tokens ──────────────────────────────────────────────────────────
-- One Expo push token per account (latest device wins). Needed to send the
-- "loop in" push notification to a specific circle member.

create table push_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  expo_push_token text not null,
  updated_at timestamptz not null default now()
);

alter table push_tokens enable row level security;

create function shares_a_circle_with(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from circles c
    where (c.created_by = auth.uid() or exists (
             select 1 from circle_members cm
             where cm.circle_id = c.id and cm.user_id = auth.uid() and cm.status = 'confirmed'
           ))
      and (c.created_by = target_user_id or exists (
             select 1 from circle_members cm2
             where cm2.circle_id = c.id and cm2.user_id = target_user_id and cm2.status = 'confirmed'
           ))
  );
$$;

create policy "users manage own push token"
  on push_tokens for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "circle-mates can read each other's push token to send a loop-in alert"
  on push_tokens for select
  using (shares_a_circle_with(user_id));
