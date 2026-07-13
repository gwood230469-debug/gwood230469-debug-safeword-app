-- The Family Circle screen's "Add family member" button is shown to any
-- confirmed circle member, not just the original creator — but the insert
-- policy from migration 0001 only allowed the creator. Anyone else tapping
-- that (visible, enabled) button would hit a permission-denied error.
-- Loosen it to match how safe_words already treats all confirmed members as
-- equals, rather than special-casing the creator throughout the UI.

drop policy "circle creator can invite members" on circle_members;

create policy "circle members can invite members"
  on circle_members for insert
  with check (is_circle_member(circle_id));
