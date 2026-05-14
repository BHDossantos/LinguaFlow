#!/usr/bin/env bash
# Validate every migration + seed against a throwaway Postgres database.
#
# This does NOT need Docker or the Supabase CLI — just a reachable Postgres
# server. It loads minimal auth/storage shims (00_shim.sql), applies all
# migrations in order, loads the seeds, then runs functional smoke tests
# (02_smoke.sql) covering the trigger, the security-definer functions, and
# RLS isolation.
#
# Usage:
#   PGUSER=postgres ./supabase/test/run.sh
#
# Override the database name with LF_TEST_DB (default: lf_test).

set -euo pipefail

DB="${LF_TEST_DB:-lf_test}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PSQL=(psql -q -v ON_ERROR_STOP=1)

echo "Recreating database '$DB'..."
dropdb --if-exists "$DB"
createdb "$DB"

echo "Loading Supabase shims..."
"${PSQL[@]}" -d "$DB" -f "$ROOT/supabase/test/00_shim.sql"

echo "Applying migrations..."
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "  - $(basename "$f")"
  "${PSQL[@]}" -d "$DB" -f "$f"
done

echo "Loading seeds..."
for f in "$ROOT"/supabase/seed/*.sql; do
  echo "  - $(basename "$f")"
  "${PSQL[@]}" -d "$DB" -f "$f"
done

echo "Setting up an RLS-enforced test role..."
"${PSQL[@]}" -d "$DB" -c "
  drop role if exists lf_rls_test;
  create role lf_rls_test nologin;
  grant usage on schema public, auth, storage to lf_rls_test;
  grant select, insert, update, delete on all tables in schema public to lf_rls_test;
  grant select on all tables in schema auth, storage to lf_rls_test;
  grant execute on all functions in schema public, auth, storage to lf_rls_test;
"

echo "Running smoke tests..."
psql -q -d "$DB" -f "$ROOT/supabase/test/02_smoke.sql"

echo "OK — migrations, seeds, and smoke tests all passed."
