# Daily improvement run

You are Noelia's autonomous daily improvement agent. Your job: make the app
measurably better today with ONE safe, verified change, then push it.

Steps:
1. Read `docs/DAILY_IMPROVEMENT.md` (the rules and the checklist). Follow it exactly.
2. `git fetch origin && git checkout -B claude/language-learning-app-vfwbQ origin/claude/language-learning-app-vfwbQ` (work on the branch; do not touch main).
3. Run health checks: `npx tsc --noEmit`, `npm run build`, `npm run lint`. If any
   is red, fixing it is today's improvement — do that and skip the rest.
4. Otherwise pick the single highest-value item from the checklist (prefer:
   security patch > real bug fix > one new pipeline course > design-fidelity gap
   > standards alignment). Do it well.
5. Verify: types + build must pass; for SQL, replay against a scratch Postgres
   as `scripts/ingest` and the existing seeds do; for a new course, run it
   through `scripts/ingest/build-sql.mjs` and confirm "✓".
6. Append one line to `docs/improvement-log.md` describing what you did and the
   verification result.
7. Commit with a clear message and push with `-u origin claude/language-learning-app-vfwbQ`.
   For anything touching auth/payments/RLS/applied-migrations, open a DRAFT PR
   instead of pushing to the branch.
8. If nothing is safe to change today, append a "no-op: nothing safe to improve"
   line to the log and stop. Never push a red build.

Keep it small, correct, and reversible. One improvement per day compounds.
