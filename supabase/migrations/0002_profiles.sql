-- A user's own first/display name, for their own Home screen greeting.
-- (Not in the original Section 4 data model, but "Good afternoon, {firstName}"
-- needs a name for the account itself — CircleMember.display_name is only how
-- *other* people in a circle labelled that person, not their own identity.)

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "users manage own profile"
  on profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());
