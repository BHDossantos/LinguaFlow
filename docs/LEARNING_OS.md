# Noelia as a Learning Operating System — implementation map

This turns Bruno's product vision into a tracked plan against the real codebase.
The product standard is not *"did the student finish the lesson?"* but
**"can they recall it later, explain it, apply it independently, and transfer
it to a new situation?"** Every item below is scored against that.

The core loop we are building toward:

    Diagnose → Personalized path → Teach → Practice → Assess →
    Identify misconception → Remediate → Schedule review →
    Real-world application → Verify mastery → Advance

Legend: ✅ built · ◐ partial · ○ planned · 🔑 needs `ANTHROPIC_API_KEY` ·
👤 needs human subject-expert review · ☁️ needs infra (vector DB / queue).

---

## Where we are today (honest gap analysis)

| # | Vision area | Status | What exists / next step |
|---|-------------|--------|-------------------------|
| 1 | Onboarding + diagnostic | ✅/◐ 🔑 | Onboarding (multi-language, goals, placement) + a full **adaptive diagnostic** at /diagnostic that saves a learner model (level, mastered/developing, gaps, misconceptions, recommendation) and seeds misconceptions. Runs at go-live. |
| 2 | Knowledge-graph curriculum | ◐ | `courses→lessons`, `curriculum_sources`, `standards`, `standard_descriptors`, `course_standards`, `courses.prerequisite_ids`. **Missing:** sub-lesson `concepts`/`skills`/`learning_objectives`. **Next:** add those tables; the mastery engine already carries `skill_kind` for them. |
| 3 | Sourcing + quality control | ◐ | Ingestion pipeline (`scripts/ingest`), source credit + licenses, `docs/UNIVERSITY_SOURCES.md` allowlist. **Missing:** formal per-lesson quality score + 👤 expert sign-off workflow. |
| 4 | Lesson experience (objective→mastery check) | ✅/◐ | Lessons render vocab/quiz/reading/roleplay/code; **sequential gating** (can't skip ahead) + a **70% mastery gate** on checkpoint quizzes; SRS + retention review. **Next:** explicit prior-knowledge activation + reflection prompts. |
| 5 | AI tutor (Socratic, hint ladder, modes) | ✅/◐ 🔑 | Socratic tutor with teaching guardrails, 6-level hint ladder, 8 modes, mastery+misconception context, and tutor-memory logging (`tutor_conversations`). Runs the moment the key is set. **Next:** pass live screen context from each lesson page. |
| 6 | Adaptive engine + skill-state model | ✅ (foundation) | **Shipped:** `skill_states`, `mastery_events`, `misconceptions` + `src/lib/mastery.ts`, wired into lesson completion. **Next:** prerequisite back-routing + next-item selection. |
| 7 | Practice + memory (spaced/interleaved) | ✅ | `srs_cards`, `srs_reviews`, daily review queue + **delayed retention checks** (/retention): mastered skills resurface 14+ days later, and passing/failing feeds `mastery_events` and updates the skill state. **Next:** interleaving across skills. |
| 8 | Assessment system + item bank | ✅/◐ | **Shipped:** first-class `questions` item bank (migration 0039) backfilled from every quiz lesson; carries options, answer, explanation, and optional Bloom/distractor-rationale columns. Item analysis on /admin. **Next:** author distractor rationale + Bloom tags. |
| 9 | Project-based learning + portfolio | ✅/◐ | /projects (8 seeded briefs across schools, deliverables + rubric + submit) and /portfolio (verified skills + submissions + certs). migration 0034. **Next:** mentor/AI review + richer rubric scoring. |
| 10 | Course formats | ◐ | Self-paced + classrooms + live meetings (LiveKit) + exam-mastery tier. Cohorts/bootcamps later. |
| 11 | Language module | ✅/◐ 🔑 | Vocab/grammar/listening/reading/roleplay + `pronunciation_attempts` + scenarios. Speech scoring depth needs 🔑. |
| 12 | STEM + coding lab | ✅ | **Shipped:** a `code` lesson kind + standalone /playground — write JavaScript, Python (Pyodide, incl. numpy/pandas/**matplotlib** via `packages`, with figures rendered inline), or **SQL (sql.js / SQLite)**, all auto-graded in a sandboxed browser worker. Six hands-on coding courses seeded (JS foundations, Python foundations, pandas data analysis, practical SQL, **intermediate SQL: subqueries + window functions**, matplotlib visualization). **Next:** interactive/manipulable graphs. |
| 13 | Note/document intelligence (Quizlet-style) | ◐ 🔑 | `/study` turns pasted notes into flashcards/quiz/summary, grounded in the source. **Next:** file upload (PDF/DOCX) + save to a library. |
| 14 | Teacher platform | ✅/◐ | `classrooms`, assignments, auto/teacher grading, attendance, announcements, at-risk signals via analytics. **Next:** mastery-map + misconception views (now that the data exists). |
| 15 | Parent/guardian | ✅/◐ | `guardians` + `/parent/[studentId]` weekly view. **Next:** safety/content controls surface. |
| 16 | Social/collaborative | ◐ | `/community`, `discussions`, moderation basics. |
| 17 | Motivation (no dark patterns) | ✅ | Streaks + **streak freezes**, daily goal (XP-measured), badges, weekly challenge. Already avoids one-miss punishment. |
| 18 | Accessibility (WCAG 2.2 AA) | ◐ | Reduced-motion, semantic HTML, theming. **Next:** full audit (captions, keyboard, screen-reader pass). |
| 19 | AI safety + privacy | ◐ 👤 | RLS tenant isolation, role-based access, rate limits, `audit`/`error_log`, `integrity_checks`. **Next:** guardian consent gates, retention/export/delete, prompt-injection guardrails. Get 👤 legal review before claiming GDPR/COPPA/FERPA. |
| 20 | Credentialing | ✅ | Certificates issue **verifiable credentials** with a public /verify/[code] URL + mastery % (migration 0035) and an **Open Badges v2** assertion at /api/badge/[code]. |
| 21 | Career engine | ◐ | `/career` tracks, skill-gap framing, interview practice. **Next:** wire skill-gap to real `skill_states`. |
| 22 | Search + NL discovery | ◐ 🔑 | `/search` across courses/lessons/discussions. NL requests need 🔑. |
| 23 | Core screens | ✅/◐ | Home, My Learning, Practice, Coach, Community, Calendar, Progress, Career, Messages, Settings, **Daily Plan (/plan)**, **Projects (/projects)**, **Portfolio (/portfolio)**, **Study tools (/study)**, **Diagnostic (/diagnostic)** all exist. |
| 24 | Data model | ◐ | Most core entities exist (see migrations). **Shipped this pass:** skill_states, mastery_events, misconceptions. Still to add: concepts, skills, learning_objectives, questions, projects, rubrics, credentials. |
| 25 | Technical architecture | ✅ | Next.js + TS + Tailwind + Supabase (Postgres/RLS/Auth/Storage) + Stripe + LiveKit + web-push. Modular monolith — correct for this stage. |
| 26 | AI architecture (safety→retrieval→gen→checks) | ○ 🔑 ☁️ | Design the tutor orchestration + guardrail + eval pipeline when the key lands. |
| 27 | Analytics + north-star | ✅ | `analytics_events` capture + **the true north-star on /admin: skills mastered AND retained per learner** (retained = passed a delayed retention check ≥14 days after mastery), computed from `mastery_events`. |
| 28 | Experimentation | ✅ | A/B framework (migration 0038): deterministic assignment, exposure logging, per-variant north-star + lift at /admin/experiments. First live experiment: `lesson_nudge`. See docs/EXPERIMENTS.md. |
| 29 | Monetization | ✅ | Free + Bronze/Silver/Gold/Platinum, live tutoring, schools, multi-currency, Stripe wiring (`docs/STRIPE_SETUP.md`). |
| 30 | Build order | — | This document is that order. |

---

## Phase 1 — shipped in this pass (the mastery backbone)

- `skill_states` — per-learner, per-skill status: `introduced → developing →
  proficient → mastered`, plus `fragile`, `decaying`, `needs_remediation`.
- `mastery_events` — append-only evidence (score, correct, attempts, hints,
  confidence, response time) for every graded interaction.
- `misconceptions` — tracked, with open/improving/resolved lifecycle.
- `src/lib/mastery.ts` — `recordMasteryEvent()` logs evidence and recomputes
  the skill state with a conservative rule: mastery needs sustained ≥0.9; one
  weak attempt drops the skill to remediation.
- Wired into `completeLessonAction` — completing a lesson now produces mastery
  evidence, not just a checkmark.

Run `supabase/migrations/0030_mastery_engine.sql` in Supabase to enable it.

## Phase 2 — in progress (no API key needed)

1. ✅ **Mastery map UI** — course page shows an evidence-based
   mastered/proficient/developing/review breakdown per course; the home
   dashboard shows a Skills-Mastery snapshot with a remediation nudge. Both read
   `skill_states` and degrade gracefully pre-migration.
2. ○ **Concepts/skills tables** + tag lessons → concepts (unlocks prerequisite
   back-routing: "you're failing limits because of algebra").
3. ✅ **Teacher mastery view** — per-student mastered/developing/to-review + at-risk flags + clustered misconceptions on the classroom page (RLS: migration 0031 lets teachers read only their own students).
4. ✅ **Item bank** (`questions`, migration 0039) backfilled from quizzes; Bloom + distractor-rationale columns ready; item analysis on /admin.
5. ✅ **Full lesson sequence** — sequential gating + 70% mastery gate before "advance".
6. ✅ **North-star metric** — mastered **and retained** per learner on /admin, from `mastery_events` + delayed retention checks (/retention).

## Phase 3 — needs the key / infra 🔑☁️👤

Adaptive diagnostic depth, Socratic tutor + hint ladder + tutor memory,
note→study-asset generation, STEM/coding labs, speech scoring, NL search,
tutor eval suite. Each gets a guardrail + human-review gate.

---

## North-star metric

**Verified skills mastered and retained per active learner per month** —
computed as: count of `skill_states` reaching `mastered` **and** still passing a
delayed check ≥14 days later (a `mastery_events` review with score ≥ threshold).
This is the number to optimize, not minutes watched.

## The one rule

Ship nothing that lets a learner advance without evidence they can **recall,
explain, apply, and transfer**. The mastery engine is how we enforce it.
