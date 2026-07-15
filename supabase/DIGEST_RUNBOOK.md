# Publishing a new Weekly Digest item

## Table shape

`digest_items` (see `supabase/migrations/0006_oauth_reset.sql`):

| column         | type        | notes                                   |
|----------------|-------------|------------------------------------------|
| `id`           | `uuid`      | defaults to `gen_random_uuid()`          |
| `title`        | `text`      | required                                 |
| `body`         | `text`      | required                                 |
| `published_at` | `timestamptz` | defaults to `now()`                    |
| `region`       | `text`      | required, must be `'UK'` or `'US'`       |

The table is read-only to signed-in users (RLS `select` policy for
`authenticated`) with no client-facing insert/update/delete policy, so new
rows must be added directly by an admin — either the SQL editor or a
service-role connection, never from the app.

## Adding a new item

Unlike `supabase/migrations/0007_seed_digest_items.sql` (which pins fixed
`id`s + `on conflict do nothing` so the seed migration stays idempotent
across re-runs), a one-off new item doesn't need an explicit `id` or
`published_at` — both have defaults:

```sql
insert into digest_items (title, body, region)
values (
  'Your title here',
  'Your body copy here.',
  'UK'
);
```

Swap `'UK'` for `'US'` for a US-region item. To publish for a specific date
instead of "now", add `published_at` explicitly:

```sql
insert into digest_items (title, body, published_at, region)
values (
  'Your title here',
  'Your body copy here.',
  '2026-07-21T00:00:00Z',
  'UK'
);
```

## Where to run it

- **Supabase SQL editor** (dashboard → SQL Editor) — paste the template
  above and run it. Simplest option, no local setup required.
- **`supabase db execute`** — if the Supabase CLI is linked to the project
  (`supabase link`), you can run the same SQL from a local file:
  `supabase db execute -f my-digest-item.sql`.

Either way, the app reads `digest_items` ordered by `published_at` (see
`src/lib/digest.ts` / `WeeklyDigestScreen.tsx`), so newly inserted rows
appear automatically — no app deploy needed.
