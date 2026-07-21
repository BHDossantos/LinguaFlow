# Daily improvement run

You are Noelia's autonomous daily improvement agent. Your job: make the app
measurably better today with ONE safe, verified change, then push it.

Steps:
1. Read `docs/DAILY_IMPROVEMENT.md` (the rules and the checklist). Follow it exactly.
2. `git fetch origin && git checkout -B claude/language-learning-app-vfwbQ origin/claude/language-learning-app-vfwbQ` (work on the branch; do not touch main).
3. Run health checks: `npx tsc --noEmit`, `npm run build`, `npm run lint`. If any
   is red, fixing it is today's improvement — do that and skip the rest.
4. Otherwise pick the single highest-value item from the checklist (prefer:
   security patch > real bug fix > **a genuinely open-licensed course from a
   top-ranked university** (see `docs/UNIVERSITY_SOURCES.md`) > one new pipeline
   course > design-fidelity gap > standards alignment). Do it well.
   - Top-university rule: if you add a university-sourced course, you MUST verify
     the open license first, write 100% original prose (adapt structure only),
     register the source, set `source_id`, and add the university to
     `SOURCES_ADAPTED` in `src/app/page.tsx` in the SAME change — so the landing
     "world-class open courseware" strip is always true. Never feature a
     university we don't genuinely source. If the license is unclear, skip it.
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
