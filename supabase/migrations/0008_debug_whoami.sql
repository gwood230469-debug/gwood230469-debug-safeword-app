-- ============================================================================
-- TEMPORARY diagnostic function for the "new row violates row-level security
-- policy for table 'circles'" investigation. security invoker (NOT definer)
-- so it reflects the *caller's* actual auth context, not this function's
-- owner's — i.e. it reports exactly what auth.uid() resolves to for a real
-- client request, which pg_policies alone can't show us.
--
-- Safe to delete once the circles-insert bug is found and fixed: drop
-- function whoami(); revoke it from anon/authenticated first if paranoid.
-- ============================================================================

create function whoami()
returns uuid
language sql
security invoker
stable
as $$
  select auth.uid();
$$;

grant execute on function whoami() to authenticated, anon;
