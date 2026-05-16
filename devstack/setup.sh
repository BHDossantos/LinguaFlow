#!/usr/bin/env bash
# One-shot boot of the local dev stack: brings up postgres/gotrue/postgrest,
# applies migrations, seeds a test user + Spanish content, starts the gateway.
# Idempotent — safe to re-run.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEV="$ROOT/devstack"

cd "$DEV"
docker compose up -d postgres

# Wait for postgres
until docker exec lf_pg pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done

# Set passwords (uses 127.0.0.1 trust auth)
docker exec -e PGPASSWORD=any lf_pg psql -h 127.0.0.1 -U supabase_admin \
  -c "ALTER USER supabase_auth_admin WITH PASSWORD 'postgres'; ALTER USER authenticator WITH PASSWORD 'postgres';" \
  >/dev/null

# Storage tables (normally created by storage-api which we skip)
docker exec -i -e PGPASSWORD=any lf_pg psql -h 127.0.0.1 -U supabase_admin -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
create table if not exists storage.buckets (id text primary key, name text not null, public boolean default false);
create table if not exists storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text, owner uuid, created_at timestamptz default now());
create or replace function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name, '/'); $$;
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated, service_role, postgres;
grant all on storage.buckets to postgres, service_role;
grant all on storage.objects to postgres, service_role;
SQL

# Apply migrations
for f in "$ROOT"/supabase/migrations/*.sql; do
  docker exec -i lf_pg psql -U postgres -v ON_ERROR_STOP=1 < "$f" >/dev/null 2>&1 || \
    echo "warn: migration $(basename "$f") had errors (likely idempotent reruns)"
done

# Boot auth + REST
docker compose up -d gotrue postgrest

# Wait for both
until docker logs lf_gotrue 2>&1 | grep -q "GoTrue\|listening"; do sleep 1; done
until curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ | grep -qE "200|400"; do sleep 1; done

# Seed test user (idempotent)
SRK="${SUPABASE_SERVICE_ROLE_KEY:-}"
if [[ -z "$SRK" ]]; then
  echo "warn: SUPABASE_SERVICE_ROLE_KEY not set; skipping test-user creation"
else
  curl -s -X POST http://localhost:54321/auth/v1/admin/users \
    -H "Authorization: Bearer $SRK" -H "apikey: $SRK" \
    -H "Content-Type: application/json" \
    -d '{"email":"learner@test.local","password":"test-password-123","email_confirm":true}' >/dev/null || true

  # Get the user id, then seed profile + target language + sample content
  USER_ID=$(curl -s "http://localhost:54321/auth/v1/admin/users" \
    -H "Authorization: Bearer $SRK" -H "apikey: $SRK" \
    | grep -oE '"id":"[^"]+"' | head -1 | cut -d'"' -f4)
  if [[ -n "$USER_ID" ]]; then
    docker exec -i lf_pg psql -U postgres -v ON_ERROR_STOP=1 <<SQL >/dev/null
      update public.profiles set display_name='Test Learner', ui_language='en' where id='$USER_ID';
      insert into public.target_languages (user_id, language, dialect, cefr_level, active)
        values ('$USER_ID', 'es', 'latam', 'A1', true) on conflict do nothing;
SQL
  fi
fi

# Sample content (idempotent — uses fixed UUIDs)
docker exec -i lf_pg psql -U postgres < "$ROOT/supabase/seed/seed_es_a1.sql" >/dev/null 2>&1 || true
docker exec -i lf_pg psql -U postgres < "$ROOT/supabase/seed/seed_academic.sql" >/dev/null 2>&1 || true

# Start the host gateway in background if not already running
if ! curl -s http://localhost:54321/auth/v1/health >/dev/null 2>&1; then
  nohup node "$DEV/gateway.mjs" >/tmp/lf_gateway.log 2>&1 &
  until curl -s http://localhost:54321/auth/v1/health >/dev/null 2>&1; do sleep 1; done
fi

echo "ready: http://localhost:54321  (gotrue + postgrest behind gateway)"
echo "seeded user: learner@test.local / test-password-123"
