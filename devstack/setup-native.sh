#!/usr/bin/env bash
# Docker-free dev stack. Use when docker pulls are rate-limited/blocked.
# Requires: postgresql-16 server binaries, Go toolchain (to build gotrue once),
# PostgREST static binary, node. Idempotent.
#
# Components and ports match the docker stack so .env.local and the gateway
# are identical: postgres :54322, gotrue :9999, postgrest :3001,
# storage-stub :5000, gateway :54321.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEV="$ROOT/devstack"
PGBIN=${PGBIN:-/usr/lib/postgresql/16/bin}
PGDATA=${PGDATA:-/var/lib/lf-pg}
PGPORT=54322
GOTRUE_VERSION=v2.180.0
POSTGREST_VERSION=v12.2.12

# --- postgres ---------------------------------------------------------------
if [ ! -f "$PGDATA/PG_VERSION" ]; then
  mkdir -p "$PGDATA" && chown postgres:postgres "$PGDATA"
  su postgres -c "$PGBIN/initdb -D $PGDATA --auth-local=trust --auth-host=trust -U postgres" >/dev/null
fi
if ! pg_isready -h 127.0.0.1 -p $PGPORT >/dev/null 2>&1; then
  su postgres -c "$PGBIN/pg_ctl -D $PGDATA -l /tmp/lf-pg.log -o '-p $PGPORT -c listen_addresses=127.0.0.1' start" >/dev/null
  until pg_isready -h 127.0.0.1 -p $PGPORT >/dev/null 2>&1; do sleep 1; done
fi

PSQL="psql -h 127.0.0.1 -p $PGPORT -U postgres"

# Supabase-compatible roles/schemas (idempotent; see native-bootstrap.sql)
$PSQL -v ON_ERROR_STOP=1 -f "$DEV/native-bootstrap.sql" >/dev/null
$PSQL -c "grant usage, create on schema public to supabase_auth_admin;
          alter role supabase_auth_admin set search_path = auth, public;" >/dev/null
# gotrue's 00_init migration must own auth.uid()/auth.role()
$PSQL -c "alter function auth.uid() owner to supabase_auth_admin;
          alter function auth.role() owner to supabase_auth_admin;" >/dev/null 2>&1 || true

# --- postgrest binary --------------------------------------------------------
if ! command -v postgrest >/dev/null; then
  curl -sL -o /tmp/postgrest.tar.xz \
    "https://github.com/PostgREST/postgrest/releases/download/$POSTGREST_VERSION/postgrest-$POSTGREST_VERSION-linux-static-x86-64.tar.xz"
  tar -xJf /tmp/postgrest.tar.xz -C /usr/local/bin/
fi

# --- gotrue (build once from source; no release binaries exist) ---------------
if [ ! -x /usr/local/bin/gotrue ]; then
  curl -sL -o /tmp/auth-src.tar.gz \
    "https://github.com/supabase/auth/archive/refs/tags/$GOTRUE_VERSION.tar.gz"
  tar -xzf /tmp/auth-src.tar.gz -C /tmp
  ( cd "/tmp/auth-${GOTRUE_VERSION#v}" && go build -o /usr/local/bin/gotrue . )
  mkdir -p /opt/gotrue
  cp -r "/tmp/auth-${GOTRUE_VERSION#v}/migrations" /opt/gotrue/migrations
fi

export GOTRUE_API_HOST=0.0.0.0 GOTRUE_API_PORT=9999
export API_EXTERNAL_URL=http://localhost:54321
export GOTRUE_DB_DRIVER=postgres
export GOTRUE_DB_DATABASE_URL="postgres://supabase_auth_admin:postgres@127.0.0.1:$PGPORT/postgres"
export GOTRUE_DB_MIGRATIONS_PATH=/opt/gotrue/migrations
export GOTRUE_SITE_URL=http://localhost:3457 GOTRUE_URI_ALLOW_LIST='*'
export GOTRUE_DISABLE_SIGNUP=false GOTRUE_JWT_ADMIN_ROLES=service_role
export GOTRUE_JWT_AUD=authenticated GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated
export GOTRUE_JWT_EXP=3600
export GOTRUE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
export GOTRUE_EXTERNAL_EMAIL_ENABLED=true GOTRUE_MAILER_AUTOCONFIRM=true
export GOTRUE_SMS_AUTOCONFIRM=true GOTRUE_LOG_LEVEL=warn

/usr/local/bin/gotrue migrate >/dev/null
$PSQL -c "grant select on auth.users to postgres, anon, authenticated, service_role;" >/dev/null

# --- app migrations -----------------------------------------------------------
for f in "$ROOT"/supabase/migrations/*.sql; do
  $PSQL -v ON_ERROR_STOP=1 -f "$f" >/dev/null 2>&1 || true  # idempotent re-runs
done

# --- services ------------------------------------------------------------------
if ! curl -s -o /dev/null http://localhost:9999/health 2>/dev/null; then
  nohup /usr/local/bin/gotrue serve >/tmp/lf_gotrue.log 2>&1 &
fi
if ! curl -s -o /dev/null http://localhost:3001/ 2>/dev/null; then
  PGRST_DB_URI="postgres://authenticator:postgres@127.0.0.1:$PGPORT/postgres" \
  PGRST_DB_SCHEMAS=public,storage,graphql_public \
  PGRST_DB_ANON_ROLE=anon \
  PGRST_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long \
  PGRST_SERVER_PORT=3001 \
  nohup /usr/local/bin/postgrest >/tmp/lf_pgrst.log 2>&1 &
fi
if ! curl -s -o /dev/null http://localhost:5000/ 2>/dev/null; then
  nohup node "$DEV/storage-stub.mjs" >/tmp/lf_storage_stub.log 2>&1 &
fi
if ! curl -s -o /dev/null http://localhost:54321/auth/v1/health 2>/dev/null; then
  nohup node "$DEV/gateway.mjs" >/tmp/lf_gateway.log 2>&1 &
fi
until curl -s -o /dev/null http://localhost:54321/auth/v1/health; do sleep 1; done
until curl -s -o /dev/null http://localhost:3001/; do sleep 1; done

# --- seed -----------------------------------------------------------------------
$PSQL -f "$ROOT/supabase/seed/seed_es_a1.sql" >/dev/null 2>&1 || true
$PSQL -f "$ROOT/supabase/seed/seed_academic.sql" >/dev/null 2>&1 || true
$PSQL -f "$ROOT/supabase/seed/seed_starter_pack.sql" >/dev/null 2>&1 || true

SRK="${SUPABASE_SERVICE_ROLE_KEY:-}"
if [ -n "$SRK" ]; then
  curl -s -X POST http://localhost:54321/auth/v1/admin/users \
    -H "Authorization: Bearer $SRK" -H "apikey: $SRK" -H "Content-Type: application/json" \
    -d '{"email":"learner@test.local","password":"test-password-123","email_confirm":true}' >/dev/null || true
  USER_ID=$(curl -s "http://localhost:54321/auth/v1/admin/users" \
    -H "Authorization: Bearer $SRK" -H "apikey: $SRK" \
    | grep -oE '"id":"[^"]+"' | head -1 | cut -d'"' -f4)
  if [ -n "$USER_ID" ]; then
    $PSQL >/dev/null <<SQL
      update public.profiles set display_name='Test Learner', ui_language='en' where id='$USER_ID';
      insert into public.target_languages (user_id, language, dialect, cefr_level, active)
        values ('$USER_ID','es','latam','A1',true) on conflict do nothing;
      insert into public.enrollments (user_id, course_id)
        values ('$USER_ID','11111111-1111-1111-1111-111111111111') on conflict do nothing;
      insert into public.assignments (id, course_id, title, instructions_md, max_score, kind, language, published)
        values ('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111',
        'Describe your morning routine','Write 4-6 sentences in Spanish about your morning routine.',
        100,'project','es',true) on conflict (id) do nothing;
SQL
  fi
else
  echo "warn: SUPABASE_SERVICE_ROLE_KEY not set; skipped test-user seed"
fi

echo "ready: http://localhost:54321 (native: gotrue + postgrest + storage-stub behind gateway)"
echo "seeded user: learner@test.local / test-password-123"
