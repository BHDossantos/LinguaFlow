# Local dev stack (no `supabase start`)

Boots a minimal Supabase-compatible backend so the app can be exercised
end-to-end without paying for or provisioning a hosted Supabase project.

What's running:
- `supabase/postgres` — postgres with the Supabase roles/schemas preloaded
- `supabase/gotrue` — auth (signup, password sign-in, JWT issuance)
- `postgrest/postgrest` — REST layer that PostgREST exposes for `.from()` queries
- `gateway.mjs` — tiny Node proxy on `:54321` that routes `/auth/v1/*` → gotrue,
  `/rest/v1/*` → postgrest, mimicking the Supabase URL shape `supabase-js` expects.

Skipped: storage, realtime, edge-runtime, mailpit, studio, kong. The app uses
storage in one place (assignment file uploads via `SubmitForm`); everything
else is exercisable without it.

## Boot

```bash
cd devstack
docker compose up -d
# wait for postgres health (a few seconds), then:
docker exec lf_pg psql -U postgres -f - < ../supabase/migrations/0001_init.sql
# ...etc, or apply all in a loop; see scripts below.
node gateway.mjs &
```

## Env vars for Next.js

Set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<HS256 JWT signed with the shared secret, role=anon>
SUPABASE_SERVICE_ROLE_KEY=<same but role=service_role>
```

JWT secret used across all services:
`super-secret-jwt-token-with-at-least-32-characters-long`

Generate anon/service-role JWTs:

```js
const crypto = require('crypto');
const SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long';
const b64 = s => Buffer.from(s).toString('base64url');
const jwt = payload => {
  const h = b64(JSON.stringify({alg:'HS256',typ:'JWT'}));
  const p = b64(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', SECRET).update(h+'.'+p).digest('base64url');
  return `${h}.${p}.${sig}`;
};
const exp = Math.floor(Date.now()/1000) + 60*60*24*365;
console.log('anon =', jwt({iss:'supabase-demo',role:'anon',iat:Math.floor(Date.now()/1000),exp}));
console.log('srv  =', jwt({iss:'supabase-demo',role:'service_role',iat:Math.floor(Date.now()/1000),exp}));
```

## Seed a test user

```bash
SRK="<service-role JWT>"
curl -X POST http://localhost:54321/auth/v1/admin/users \
  -H "Authorization: Bearer $SRK" -H "apikey: $SRK" \
  -H "Content-Type: application/json" \
  -d '{"email":"learner@test.local","password":"test-password-123","email_confirm":true}'
```

Then in psql, populate the `target_languages` row so `requireOnboardedUser`
passes, and apply `../supabase/seed/seed_es_a1.sql` for sample content.

## Notes / known sharp edges

- `supabase_auth_admin` and `authenticator` ship with no password in this
  image. Set them via the local-trust 127.0.0.1 path as `supabase_admin`:
  `docker exec -e PGPASSWORD=any lf_pg psql -h 127.0.0.1 -U supabase_admin -c "ALTER USER supabase_auth_admin WITH PASSWORD 'postgres'; ALTER USER authenticator WITH PASSWORD 'postgres';"`
- Migration `0004_storage.sql` needs `storage.buckets`/`objects`, which are
  normally created by `storage-api` on first boot. Since we're skipping that
  service, create the bare tables once as `supabase_admin` (see the script
  above) and `0004` will apply cleanly.
