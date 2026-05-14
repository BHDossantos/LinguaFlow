# Migration validation harness

Validates every migration + seed against a throwaway Postgres database —
without Docker or the Supabase CLI. Useful as a fast pre-flight before
`supabase db push`.

## What it checks

- All `supabase/migrations/*.sql` apply cleanly, in order, on a fresh DB.
- All `supabase/seed/*.sql` load without error.
- Functional smoke tests (`02_smoke.sql`):
  - `handle_new_user` trigger creates a `profiles` row per `auth.users` insert.
  - `create_organization` / `join_organization` security-definer functions.
  - `is_org_admin`, `is_guardian_of` helpers return correct booleans.
  - `max_submission_similarity` (pg_trgm) finds near-duplicate submissions.
  - RLS isolation: a student, under an RLS-enforced role, sees only their own
    submissions and only orgs they belong to.

## Run it

```bash
PGUSER=postgres ./supabase/test/run.sh
```

## Caveats

`00_shim.sql` provides **minimal** stand-ins for Supabase's `auth` and
`storage` schemas — enough to exercise our SQL, not a faithful reproduction.
`auth.uid()` here reads a session GUC (`request.jwt.claim.sub`) instead of a
real JWT. This validates our migration SQL and policy logic; it does not
replace testing against an actual Supabase project.
