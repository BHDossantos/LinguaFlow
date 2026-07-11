# Deploying Noelia

The app is a Next.js 15 App Router project backed by Supabase. Production
build is verified (`npm run build` compiles all routes). Publishing takes
two free-tier accounts and ~20 minutes.

## 1. Supabase (database + auth + storage)

1. Create a project at https://supabase.com/dashboard (free tier is fine).
2. Apply the schema — either:
   - **CLI:** `supabase link --project-ref <ref>` then `supabase db push`
     (applies everything in `supabase/migrations/`), or
   - **Dashboard:** paste each file from `supabase/migrations/` into the
     SQL editor in filename order (0001 → 0014).
3. Optional starter content: run `supabase/seed/seed_es_a1.sql`,
   `seed_academic.sql`, and `seed_starter_pack.sql` (4-language starter
   library, 20 lessons) in the SQL editor.
4. Storage: create a **private** bucket named `submissions`
   (Storage → New bucket). The RLS policies for it ship in migration 0004.
5. Auth → URL Configuration: set Site URL to your production domain
   (magic-link emails redirect there). Supabase's built-in email service
   works out of the box for low volume.
6. Optional — Google sign-in: Authentication → Providers → Google, paste
   OAuth client ID/secret from Google Cloud Console, and add
   `https://<your-domain>/auth/callback` to the provider's redirect URLs.
   The button is already on the sign-in page and reports "not enabled"
   gracefully until this is configured.
7. Collect three values from Project Settings → API:
   - Project URL            → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key      → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key     → `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)

## 2. Vercel (hosting)

1. https://vercel.com/new → Import the GitHub repo. Framework auto-detects
   as Next.js; no custom build settings needed.
2. Add the three Supabase env vars above (all environments).
3. Deploy. Every push to the production branch redeploys automatically.

### Custom domain: learnnoelia.com

1. Vercel → Project → Settings → Domains → add `learnnoelia.com` and
   `www.learnnoelia.com` (set www to redirect to the apex).
2. At your registrar's DNS panel, add the records Vercel shows — typically:
   - `A` record, host `@`, value `76.76.21.21`
   - `CNAME` record, host `www`, value `cname.vercel-dns.com`
   HTTPS is automatic once DNS propagates (minutes to a few hours).
3. Supabase → Auth → URL Configuration → Site URL: `https://learnnoelia.com`
   (magic links redirect here). If Google sign-in is enabled, add
   `https://learnnoelia.com/auth/callback` to the provider redirect URLs.
4. Vercel env: `NEXT_PUBLIC_SITE_URL=https://learnnoelia.com` (canonical/OG).

Any Next-compatible host (Netlify, Railway, Fly, self-hosted `next start`)
works the same way — the app has no Vercel-specific code.

## 3. Optional integrations (features degrade gracefully without them)

| Env var | Unlocks |
| --- | --- |
| `ANTHROPIC_API_KEY` | System grading, roleplay conversations, translate, lesson draft generation, pronunciation coaching tips |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Tutor-minute billing (point the Stripe webhook at `/api/stripe/webhook`) |
| `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`, `NEXT_PUBLIC_LIVEKIT_URL` | Live tutor video sessions |

Without `ANTHROPIC_API_KEY`, pronunciation scoring still works fully (it is
computed locally); only the extra coaching tip is skipped. Grading, roleplay,
and translate endpoints return errors until the key is set — the UI surfaces
them as "generation failed" style messages rather than crashing.

## 4. Optional — streak reminders (web push)

1. Generate keys once: `npx web-push generate-vapid-keys`.
2. Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
   `VAPID_SUBJECT` (mailto:you@yourdomain), and a random `CRON_SECRET`
   in Vercel env vars.
3. vercel.json already schedules `/api/push/send-reminders` daily at 17:00
   UTC; Vercel sends the `Authorization: Bearer CRON_SECRET` header
   automatically when the env var is set.
4. Users opt in from Settings → Streak reminders. Without the env vars the
   toggle reports push as unavailable and nothing breaks.

## 5. Post-deploy smoke check

1. Open the site → home page renders with Noelia branding.
2. Sign in with a magic link (check your email).
3. Complete onboarding, open Learn → the seeded Spanish course appears.
4. Open a vocab lesson → the three-mode player (Recognize/Recall/Listen)
   runs and ratings persist (check `srs_cards` in the dashboard).
5. Submit the seeded assignment with a file → row in `submissions`, object
   in the `submissions` bucket.

## Local development

See `devstack/README.md` — both a docker compose stack and a fully
docker-free native stack (`devstack/setup-native.sh`) are provided, plus a
22-spec Playwright e2e suite (`npm run e2e`).
