# Daily improvement run (autonomous)

You are Noelia's autonomous daily agent. Each run you (1) ADD NEW COURSES and
(2) make ONE safe verified improvement, then commit and push. Work only on the
branch `claude/language-learning-app-vfwbQ`. Keep every run small, correct, and
reversible. Never push a red build.

## Steps

1. `git fetch origin && git checkout -B claude/language-learning-app-vfwbQ origin/claude/language-learning-app-vfwbQ`.
2. Health check: `npx tsc --noEmit` and `npm run build`. If either is red, fixing
   it IS today's work — fix, verify, commit, push, and stop.
3. **Add 2–3 new courses (primary task).** Follow `docs/UNIVERSITY_SOURCES.md`
   (open-licensed sources only) and `scripts/ingest/README.md`:
   - Pick subjects/levels not already in the catalog (query the seed files or
     `supabase/seed/curriculum/` to avoid duplicates). Prefer filling thin
     schools and completing tracks; genuinely open top-university sources are a plus.
   - Assign the next free course IDs per the scheme in `docs/CURRICULUM_ENGINE.md`
     (languages `aaaa000N`, math `bbbb0001`, technology `bbbb0002`, business
     `bbbb0003`, science `bbbb0004`; increment the hex suffix).
   - Author each as a JSON interchange file in `scripts/ingest/examples/`,
     mimicking `scripts/ingest/examples/discrete_math.json` (10+ lessons,
     reading/quiz kinds only, quizzes have exactly 4 options + 0-based answer +
     explanation, five-heading readings with inline answers). Original prose
     only; credit the source in the description; never use the word "AI".
   - Validate EACH: `node scripts/ingest/build-sql.mjs scripts/ingest/examples/<name>.json supabase/seed/curriculum/<name>.sql` — must print "✓ N lessons". Fix until it passes.
   - Append provenance + CEFR alignment (for languages) to
     `supabase/seed/curriculum_graph_seed.sql` following the existing pattern.
   - Assemble a numbered `noelia_update_N.sql` (next number after the highest
     existing one) containing the new course SQL + provenance, for the owner to
     run in Supabase. (SQL is idempotent by construction.)
4. Optionally, ONE additional safe improvement from `docs/DAILY_IMPROVEMENT.md`
   (a real bug fix, a design-fidelity gap, a standards alignment, or an
   accessibility fix). Skip if nothing is clearly safe.
5. Verify: `npx tsc --noEmit` + `npm run build` must pass.
6. Append one line to `docs/improvement-log.md`: `YYYY-MM-DD — added <courses> (+<improvement>) — verified ✓`.
7. Commit with a clear message; `git pull --rebase origin claude/language-learning-app-vfwbQ` then `git push -u origin claude/language-learning-app-vfwbQ`.
   For anything touching auth/payments/RLS/applied migrations, open a DRAFT PR instead of pushing to the branch.

## Rules

- Never break the build. If unsure a change is safe, don't ship it.
- Content is idempotent + source-credited; only genuinely open-licensed sources.
- No user-facing "AI" wording (say "system"/"coach").
- Only feature a university on the landing strip after a real course from it
  exists (see `docs/UNIVERSITY_SOURCES.md`).
- Keep the app deployable: production must always build.
