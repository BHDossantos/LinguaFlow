# End-to-end tests

Playwright tests that drive the real app in a browser against the local dev
stack — a logged-in user, real auth cookies, real Postgres/auth/storage.

## What's covered

- `auth.spec.ts` — signed-out behaviour: protected pages redirect to
  `/sign-in`, protected APIs return `401 JSON`, the sign-in page is public.
- `smoke.spec.ts` — every authenticated route renders: HTTP < 400, no bounce
  to sign-in, no uncaught JS / console errors.
- `upload.spec.ts` — the assignment-submission flow, including a file
  attachment upload through Supabase storage.

## Running

One-time: install the Playwright browser.

```bash
npx playwright install chromium
```

Then, with the dev stack running:

```bash
set -a && . .env.local && set +a
bash devstack/setup.sh        # boots Supabase-compatible stack + seeds data
npm run e2e                   # starts `next dev` automatically, runs the tests
```

`npm run e2e:ui` opens the Playwright UI mode.

## How auth works in the tests

There's no hosted Supabase and no email delivery, so tests don't click a magic
link. Instead `fixtures.ts` signs in through `@supabase/ssr` (the same library
the app uses) with the seeded password user, captures the session cookies that
library produces, and injects them into the browser context. The app's
middleware and server components then see a genuine logged-in session.

`global-setup.ts` fails fast with an actionable message if the dev stack
isn't reachable, and ensures the test user exists.

## Requirements

- `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` (see `devstack/README.md`).
- The dev stack up (`devstack/setup.sh`), which also seeds the user, sample
  courses, and the assignment that `upload.spec.ts` targets.
