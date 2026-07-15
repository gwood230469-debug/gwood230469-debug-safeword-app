# Keeping the database in sync with this repo

Up to now, migrations in `migrations/` have been applied by hand-pasting
them into the Supabase SQL Editor. That's exactly how the live database
can quietly drift from what's in git — a real risk worth closing off now
that the app actually has real family circle data in it.

## One-time setup

```
npx supabase login
npx supabase link --project-ref <your-project-ref>
```

Your project ref is the random string in your Supabase dashboard URL:
`supabase.com/dashboard/project/<this-part>`.

## From now on

Instead of pasting SQL into the dashboard, run:
```
npx supabase db push
```
This applies any migration files in `migrations/` that the linked database
doesn't have yet, in order. `npx supabase migration list` shows you which
migrations the live database actually has applied — treat that as the
source of truth for "what's really live," not just what files exist here.

## Strongly recommended: a separate database for testing

Right now there's one Supabase project, and it's the same one real invited
family members' data lives in. Since some migrations in this repo are
explicitly destructive (`0006_oauth_reset.sql` drops and rebuilds every
table), doing further app development directly against production risks
losing real data by accident.

Cheap fix: create a second, free-tier Supabase project for development —

```
npx supabase projects create safeword-dev
npx supabase link --project-ref <the-new-dev-project-ref>
npx supabase db push
```

— then keep a separate `.env.local` (or just swap the two Supabase values
in `.env`) pointing at the dev project while actively changing the app,
and only point back at the production project when you're confident a
change is ready for real users.
