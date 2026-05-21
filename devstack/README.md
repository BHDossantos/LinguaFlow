# Local dev stack (no `supabase start`)

Boots a minimal Supabase-compatible backend so the app can be exercised
end-to-end without paying for or provisioning a hosted Supabase project.

`supabase start` itself pulls images from `public.ecr.aws`, which was blocked
in our build sandbox — this stack pulls only from Docker Hub instead.

## TL;DR

```bash
# .env.local must have NEXT_PUBLIC_SUPABASE_URL/ANON_KEY + SUPABASE_SERVICE_ROLE_KEY
set -a && . .env.local && set +a
bash devstack/setup.sh        # boots everything, applies migrations, seeds data
npm run dev                   # the app, against the local stack
```

`setup.sh` is idempotent — safe to re-run.

## What's running

- `supabase/postgres` — postgres with the Supabase roles/schemas preloaded
- `supabase/gotrue` — auth (signup, password sign-in, JWT issuance)
- `postgrest/postgrest` — the REST layer behind `supabase.from()` / `.rpc()`
- `supabase/storage-api` *or* `storage-stub.mjs` — object storage (see below)
- `gateway.mjs` — host Node proxy on `:54321` that routes `/auth/v1/*` →
  gotrue, `/rest/v1/*` → postgrest, `/storage/v1/*` → storage, and injects
  CORS headers (the real Supabase setup does this in its kong gateway).

Skipped: realtime, edge-runtime, mailpit, studio, kong, imgproxy. Nothing in
the app depends on them for page rendering or the assignment-submission flow.

## Storage: container vs. stub

`setup.sh` prefers the real `supabase/storage-api` container. If that image
isn't present locally (e.g. Docker Hub anonymous pull-rate limit), it falls
back to `storage-stub.mjs` — a ~90-line Node service implementing exactly the
storage HTTP subset `@supabase/storage-js` v2 uses in this app: multipart
object upload, signed-URL minting, signed-URL GET. The stub does NOT enforce
auth/RLS — it exercises the app's own upload code path, not Supabase's storage
security. To use the real container, pre-pull the image:
`docker pull supabase/storage-api:v1.19.3` then re-run `setup.sh`.

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

## Seeded test data

`setup.sh` creates (idempotently):
- user `learner@test.local` / `test-password-123` (email pre-confirmed)
- profile + a Spanish (es/latam, A1) target language → clears onboarding
- sample content from `supabase/seed/*.sql` (3 courses, 13 lessons)
- an enrollment + a `project`-kind assignment so the submission flow is testable

## Notes / known sharp edges

- `supabase_auth_admin`, `authenticator`, and `supabase_storage_admin` ship
  with no password in the supabase/postgres image. `setup.sh` sets them by
  connecting over 127.0.0.1 (trust auth) as the superuser `supabase_admin`.
- Migration `0004_storage.sql` needs `storage.buckets`/`objects`. With the
  real storage-api container these are created by its own migrations; in stub
  mode `setup.sh` creates the bare tables first so `0004` applies cleanly.
- The supabase/postgres image restarts a few times during first init, so the
  unix-socket healthcheck can pass before the TCP listener is ready —
  `setup.sh` polls the real 127.0.0.1 connection instead.
