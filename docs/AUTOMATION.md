# Automated daily improvement — how it runs

Noelia improves itself every day: it adds new courses via the ingestion pipeline
and makes one safe, verified change, then commits and pushes. Two layers:

## 1. Durable (survives everything) — GitHub Actions

`.github/workflows/daily-agent.yml` runs on GitHub's own schedule (every 8 hours), independent of any Claude session. It executes the playbook in
`.claude/daily-improve.md`, verifies `tsc` + `build`, then commits & pushes.

**It stays dormant until you flip it on at go-live** — add one repository secret:

- **`ANTHROPIC_API_KEY`** — Settings → Secrets and variables → Actions → New
  repository secret.

That's it. The built-in `GITHUB_TOKEN` handles the push (the workflow already
grants `contents: write`). You can also trigger a run any time from the Actions
tab ("Run workflow"). If you want to change cadence, edit the `cron:` line.

> First real run: after adding the key, open the Actions tab, run it manually
> once, and confirm the `claude` invocation + commit succeed on the runner
> (headless-CLI flags occasionally change between versions — adjust the "Run the
> daily agent" step if needed).

## 2. Applying new courses to the live database

The agent commits course **seed SQL** and a numbered `noelia_update_N.sql`. To
land those in production you either:

- **Manual (today):** run the day's `noelia_update_N.sql` in the Supabase SQL
  editor (idempotent — safe to run once or many times), or
- **Automated (optional):** add a Supabase step to the workflow using
  `SUPABASE_DB_URL` as a secret and `psql`/`supabase db push`. Left off by
  default so no DB credentials sit in CI until you choose to.

## 3. What each run does (see `.claude/daily-improve.md`)

1. Sync the branch, health-check (`tsc`, `build`).
2. Add 2–3 new courses (open-licensed sources only, per
   `docs/UNIVERSITY_SOURCES.md`), each validated through
   `scripts/ingest/build-sql.mjs`.
3. One extra safe improvement if clearly safe.
4. Verify, log to `docs/improvement-log.md`, commit, push. Draft PR for anything
   touching auth/payments/RLS.

## Guardrails

- Never pushes a red build.
- Content is idempotent + source-credited; only genuinely open licenses.
- No user-facing "AI" wording.
- A university appears on the landing strip only after a real course from it exists.
