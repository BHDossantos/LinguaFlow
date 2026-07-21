# Noelia — Daily Autonomous Improvement Agent

A scheduled agent runs every day, studies the app, makes one safe, verified
improvement, and pushes it. This is the "gets smarter every day" system.

## Hard rules (never violate)

1. **One focused improvement per run.** Small, reviewable, reversible.
2. **Verify before pushing.** `npx tsc --noEmit`, `npm run build`, and (when a
   DB change) replay SQL against a scratch database must all pass. If anything
   is red, do NOT push — write findings to the log and stop.
3. **Never touch auth, payments, RLS, or migrations already applied to prod**
   without opening a draft PR for human review instead of committing.
4. **Content is idempotent + source-credited.** New courses go through
   `scripts/ingest/build-sql.mjs`; every course credits its open source.
5. **No user-facing "AI" wording** — say "system"/"coach" (house style).
6. Commit to the working branch; open a PR only for anything risky.

## What to check each run (pick the highest-value ONE)

1. **Health:** `npm run build` + `npm run lint` + `npx tsc --noEmit`. If broken,
   the fix IS today's improvement.
2. **Dependency security:** `npm audit`. Patch non-breaking advisories.
3. **Bug sweep:** pick one learner page; hunt a real runtime bug (null data,
   dead link, crash on empty state) and fix it.
4. **Content gap:** find a school/level with thin coverage; author ONE new
   course via the ingestion pipeline (see `scripts/ingest/README.md`).
4b. **Top-university open courseware (standing task):** whenever you can find a
   genuinely **open-licensed** course from a top-ranked university that we don't
   yet have, add it — automatically. Follow `docs/UNIVERSITY_SOURCES.md` exactly:
   verify the open license first, adapt only the topic structure with 100%
   original prose, run it through the pipeline, register the source in
   `curriculum_graph_seed.sql`, set `source_id`, and only then add the
   university's name to `SOURCES_ADAPTED` in `src/app/page.tsx`. Never put a
   university on the landing strip before a real course from it exists. If the
   license is unclear or restrictive, skip it — do not guess.
5. **Design fidelity:** compare one screen to `docs/PRD.md` Volume 2/3; close a
   gap.
6. **Standards coverage:** align any course still missing `course_standards`.
7. **Analytics-driven:** if `ANTHROPIC_API_KEY` + analytics exist, read
   `analytics_events` for the most-abandoned lesson/page and improve it.
8. **Data integrity:** verify the all-in-one setup file still builds a complete
   platform from empty (`noelia_ALL_IN_ONE` regeneration test).

## Output every run

- A commit (or draft PR) with a clear message describing the improvement.
- A one-line entry appended to `docs/improvement-log.md`:
  `YYYY-MM-DD — <what changed> — <verification result>`.

## How it's scheduled

A daily cron (Claude Code on the web) fires with the prompt in
`.claude/daily-improve.md`. It reads this playbook, picks one item, executes,
verifies, and pushes. The user can pause/adjust it anytime.
