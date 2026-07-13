-- Critical bug: tryConfirmInvitedMembership() (called right after a new
-- member confirms their own phone via OTP) updates the matching invited row
-- to link it to that user. But the update policy from migration 0001 only
-- allowed `user_id = auth.uid()` (impossible — the row's user_id is still
-- null before this update) or `is_circle_creator()` (false — this is someone
-- else's invited row, not the creator's). So this update always silently
-- matched zero rows: every invited member would have fallen through to
-- creating their own duplicate circle instead of joining the one they were
-- actually invited to.
--
-- Fix: also allow claiming an unclaimed invited row when its phone_number
-- matches the caller's own verified phone number. Reads auth.users directly
-- via a security-definer function rather than trusting the JWT to carry a
-- `phone` claim, since that isn't guaranteed across Supabase auth configs.

create function caller_phone_number()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select phone from auth.users where id = auth.uid();
$$;

drop policy "invited member can confirm their own row, creator can update any" on circle_members;

create policy "circle creator, existing member, or the invited phone's owner can update a row"
  on circle_members for update
  using (
    user_id = auth.uid()
    or is_circle_creator(circle_id)
    or (status = 'invited' and phone_number = caller_phone_number())
  )
  with check (
    user_id = auth.uid()
    or is_circle_creator(circle_id)
  );
