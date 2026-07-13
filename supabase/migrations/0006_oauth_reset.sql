-- ============================================================================
-- DESTRUCTIVE RESET. Drops every table/function from the phone-OTP era and
-- rebuilds the schema for Apple/Google sign-in + share-link invites. Only
-- run this if you don't have real data worth keeping in the old tables —
-- this was confirmed with the project owner before writing this file.
-- ============================================================================

drop table if exists push_tokens cascade;
drop table if exists verification_events cascade;
drop table if exists safe_words cascade;
drop table if exists circle_members cascade;
drop table if exists circles cascade;
drop table if exists digest_items cascade;
drop table if exists profiles cascade;

drop function if exists is_confirmed_member_of(uuid);
drop function if exists is_circle_creator(uuid);
drop function if exists is_circle_member(uuid);
drop function if exists shares_a_circle_with(uuid);
drop function if exists caller_phone_number();

create extension if not exists "pgcrypto";

-- ── profiles ─────────────────────────────────────────────────────────────
-- One row per signed-in user. Created client-side right after their first
-- Apple/Google sign-in, once they've entered a display name.

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  auth_provider text not null check (auth_provider in ('apple', 'google')),
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "users manage own profile"
  on profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- ── circles ─────────────────────────────────────────────────────────────

create table circles (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table circles enable row level security;

-- ── circle_members ──────────────────────────────────────────────────────
-- phone_number is contact info only now (for the "call directly" dialer),
-- never used to verify or link an identity — that's what circle_invites is
-- for. Nullable since a phone number is optional when adding someone.
--
-- Created here (before its RLS policies, and before the is_circle_member()
-- family of helpers below) purely so those helper functions — which
-- reference this table — have something to reference. Postgres validates
-- `language sql` function bodies against the schema at CREATE time, not
-- lazily at first call.

create table circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  phone_number text,
  display_name text not null,
  status text not null default 'invited' check (status in ('invited', 'confirmed')),
  invited_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index circle_members_circle_id_idx on circle_members (circle_id);
create index circle_members_user_id_idx on circle_members (user_id);

alter table circle_members enable row level security;

-- Security-definer helpers: avoid recursive RLS evaluation when a policy on
-- circle_members needs to check the caller's own membership in that table.

create function is_circle_creator(target_circle_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from circles
    where id = target_circle_id
      and created_by = auth.uid()
  );
$$;

create function is_confirmed_member_of(target_circle_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from circle_members
    where circle_id = target_circle_id
      and user_id = auth.uid()
      and status = 'confirmed'
  );
$$;

-- Covers both "created it" and "is a confirmed member of it" — the circle
-- creator never gets their own circle_members row, so most member-facing
-- policies need to check both.
create function is_circle_member(target_circle_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select is_circle_creator(target_circle_id) or is_confirmed_member_of(target_circle_id);
$$;

create policy "circle members and creator can view circle"
  on circles for select
  using (is_circle_member(id));

create policy "authenticated users can create a circle"
  on circles for insert
  with check (created_by = auth.uid());

create policy "circle members can view members"
  on circle_members for select
  using (is_circle_member(circle_id) or user_id = auth.uid());

create policy "circle members can invite members"
  on circle_members for insert
  with check (is_circle_member(circle_id));

create policy "circle members can update a row"
  on circle_members for update
  using (user_id = auth.uid() or is_circle_member(circle_id))
  with check (user_id = auth.uid() or is_circle_member(circle_id));

create policy "circle members can remove a row"
  on circle_members for delete
  using (is_circle_member(circle_id));

-- ── circle_invites ──────────────────────────────────────────────────────
-- Token is the shareable deep link's secret. Claiming one (see
-- claim_invite() below) is deliberately NOT done via direct table RLS —
-- an unauthenticated-until-just-now invitee has no membership yet to check
-- against, so the security boundary is "do you have the exact token,"
-- enforced inside a security-definer function instead of exposing this
-- table to arbitrary reads.

create table circle_invites (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles (id) on delete cascade,
  member_id uuid not null references circle_members (id) on delete cascade,
  -- hex rather than base64: guaranteed URL-safe with no encode() format uncertainty
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_by uuid not null references auth.users (id),
  expires_at timestamptz not null default (now() + interval '30 days'),
  used_at timestamptz
);

create index circle_invites_member_id_idx on circle_invites (member_id);

alter table circle_invites enable row level security;

create policy "circle members can view invites for their circle"
  on circle_invites for select
  using (is_circle_member(circle_id));

create policy "circle members can create invites"
  on circle_invites for insert
  with check (is_circle_member(circle_id) and created_by = auth.uid());

-- Claims an invite token on behalf of the signed-in caller: confirms the
-- matching circle_members row and marks the invite used, atomically.
-- SECURITY DEFINER so it can look up the invite without the caller needing
-- (or ever getting) direct table access — see the comment on circle_invites.
create function claim_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id uuid;
  v_circle_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Must be signed in to claim an invite';
  end if;

  select ci.member_id, ci.circle_id
    into v_member_id, v_circle_id
  from circle_invites ci
  where ci.token = invite_token
    and ci.used_at is null
    and ci.expires_at > now()
  for update;

  if v_member_id is null then
    raise exception 'This invite link is invalid or has expired';
  end if;

  update circle_members
  set user_id = auth.uid(), status = 'confirmed', confirmed_at = now()
  where id = v_member_id;

  update circle_invites
  set used_at = now()
  where token = invite_token;

  return v_circle_id;
end;
$$;

grant execute on function claim_invite(text) to authenticated;

-- ── safe_words ───────────────────────────────────────────────────────────

create table safe_words (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null unique references circles (id) on delete cascade,
  encrypted_value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users (id)
);

alter table safe_words enable row level security;

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

-- ── verification_events ─────────────────────────────────────────────────

create table verification_events (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles (id) on delete cascade,
  triggered_by uuid not null references auth.users (id),
  type text not null default 'loop_in_request' check (type in ('loop_in_request')),
  created_at timestamptz not null default now(),
  acknowledged_by uuid references auth.users (id),
  acknowledged_at timestamptz
);

create index verification_events_circle_id_idx on verification_events (circle_id);

alter table verification_events enable row level security;

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

-- ── digest_items ─────────────────────────────────────────────────────────
-- Editorial content, not user-owned. Readable by any signed-in user; writes
-- are admin-only (service role), so no insert/update/delete policy here.

create table digest_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published_at timestamptz not null default now(),
  region text not null check (region in ('UK', 'US'))
);

alter table digest_items enable row level security;

create policy "any signed-in user can read digest items"
  on digest_items for select
  to authenticated
  using (true);

-- ── push_tokens ──────────────────────────────────────────────────────────
-- One Expo push token per account (latest device wins).

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
