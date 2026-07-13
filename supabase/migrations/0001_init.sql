-- SafeWord app schema. Run this in Supabase SQL Editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ── circles ─────────────────────────────────────────────────────────────

create table circles (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table circles enable row level security;

-- ── circle_members ──────────────────────────────────────────────────────

create table circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  phone_number text not null,
  display_name text not null,
  status text not null default 'invited' check (status in ('invited', 'confirmed')),
  invited_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create unique index circle_members_circle_phone_unique on circle_members (circle_id, phone_number);
create index circle_members_circle_id_idx on circle_members (circle_id);
create index circle_members_user_id_idx on circle_members (user_id);

alter table circle_members enable row level security;

-- Security-definer helper: avoids recursive RLS evaluation when a policy on
-- circle_members needs to check the caller's own membership in that same table.
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

-- circles policies

create policy "circle members and creator can view circle"
  on circles for select
  using (created_by = auth.uid() or is_confirmed_member_of(id));

create policy "authenticated users can create a circle"
  on circles for insert
  with check (created_by = auth.uid());

-- circle_members policies

create policy "circle creator and confirmed members can view members"
  on circle_members for select
  using (is_circle_creator(circle_id) or is_confirmed_member_of(circle_id) or user_id = auth.uid());

create policy "circle creator can invite members"
  on circle_members for insert
  with check (is_circle_creator(circle_id));

create policy "invited member can confirm their own row, creator can update any"
  on circle_members for update
  using (user_id = auth.uid() or is_circle_creator(circle_id))
  with check (user_id = auth.uid() or is_circle_creator(circle_id));

create policy "circle creator can remove a member"
  on circle_members for delete
  using (is_circle_creator(circle_id));

-- ── safe_words ───────────────────────────────────────────────────────────

create table safe_words (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null unique references circles (id) on delete cascade,
  encrypted_value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users (id)
);

alter table safe_words enable row level security;

create policy "confirmed members can view their circle's safe word"
  on safe_words for select
  using (is_confirmed_member_of(circle_id));

create policy "confirmed members can set the safe word"
  on safe_words for insert
  with check (is_confirmed_member_of(circle_id) and updated_by = auth.uid());

create policy "confirmed members can change the safe word"
  on safe_words for update
  using (is_confirmed_member_of(circle_id))
  with check (is_confirmed_member_of(circle_id) and updated_by = auth.uid());

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

create policy "confirmed members can view their circle's verification events"
  on verification_events for select
  using (is_confirmed_member_of(circle_id));

create policy "confirmed members can create a verification event"
  on verification_events for insert
  with check (is_confirmed_member_of(circle_id) and triggered_by = auth.uid());

create policy "confirmed members can acknowledge a verification event"
  on verification_events for update
  using (is_confirmed_member_of(circle_id))
  with check (is_confirmed_member_of(circle_id));

-- ── digest_items ─────────────────────────────────────────────────────────
-- Editorial content, not user-owned. Readable by any signed-in user; writes are
-- admin-only (service role), so no insert/update/delete policy is defined here.

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
