-- Removes the temporary diagnostic function from 0008_debug_whoami.sql now
-- that the "new row violates row-level security policy for table 'circles'"
-- root cause is found and fixed (see src/lib/circle.ts's createCircle()):
-- INSERT ... RETURNING on `circles` required the new row to also satisfy a
-- SELECT policy whose security-definer helper could see a pre-insert
-- snapshot within the same statement. Splitting the insert and the
-- read-back into two separate statements fixed it — no schema change was
-- actually needed.

drop function if exists whoami();
