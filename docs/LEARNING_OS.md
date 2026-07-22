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
| 1 | Onboarding + diagnostic | ◐ | Onboarding with multi-language select, goals, a placement assessment. **Next:** expand to the full adaptive diagnostic (confidence + response time + misconception discriminators) producing a saved learner model. |
| 2 | Knowledge-graph curriculum | ◐ | `courses→lessons`, `curriculum_sources`, `standards`, `standard_descriptors`, `course_standards`, `courses.prerequisite_ids`. **Missing:** sub-lesson `concepts`/`skills`/`learning_objectives`. **Next:** add those tables; the mastery engine already carries `skill_kind` for them. |
| 3 | Sourcing + quality control | ◐ | Ingestion pipeline (`scripts/ingest`), source credit + licenses, `docs/UNIVERSITY_SOURCES.md` allowlist. **Missing:** formal per-lesson quality score + 👤 expert sign-off workflow. |
| 4 | Lesson experience (objective→mastery check) | ◐ | Lessons render vocab/quiz/reading/roleplay; SRS review. **Next:** enforce the full sequence (prior-knowledge activation, guided→independent→transfer, reflection, **mastery gate**). |
| 5 | AI tutor (Socratic, hint ladder, modes) | ◐ 🔑 | `/coach` + tutor modes + graceful offline banners today. **Next:** hint-ladder orchestration, screen-context passing, tutor memory (see tables below). |
| 6 | Adaptive engine + skill-state model | ✅ (foundation) | **Shipped:** `skill_states`, `mastery_events`, `misconceptions` + `src/lib/mastery.ts`, wired into lesson completion. **Next:** prerequisite back-routing + next-item selection. |
| 7 | Practice + memory (spaced/interleaved) | ✅/◐ | `srs_cards`, `srs_reviews`, daily review queue exist. **Next:** interleaving + delayed mastery checks feeding `mastery_events`. |
| 8 | Assessment system + item bank | ◐ | Quizzes embedded in lessons; `assignments`, `submissions`, `teacher_reviews`, `integrity_checks`. **Missing:** first-class `questions` item bank with distractor rationale, Bloom level, stats. |
| 9 | Project-based learning + portfolio | ○ | Career tracks exist. **Next:** `projects`, `project_submissions`, `rubrics`, portfolio page. |
| 10 | Course formats | ◐ | Self-paced + classrooms + live meetings (LiveKit) + exam-mastery tier. Cohorts/bootcamps later. |
| 11 | Language module | ✅/◐ 🔑 | Vocab/grammar/listening/reading/roleplay + `pronunciation_attempts` + scenarios. Speech scoring depth needs 🔑. |
| 12 | STEM + coding lab | ○ ☁️ | Interactive graphs, code runner, sandboxes — a dedicated build. |
| 13 | Note/document intelligence (Quizlet-style) | ○ 🔑 | Upload → flashcards/quiz/summary. Needs 🔑 + parsing. |
| 14 | Teacher platform | ✅/◐ | `classrooms`, assignments, auto/teacher grading, attendance, announcements, at-risk signals via analytics. **Next:** mastery-map + misconception views (now that the data exists). |
| 15 | Parent/guardian | ✅/◐ | `guardians` + `/parent/[studentId]` weekly view. **Next:** safety/content controls surface. |
| 16 | Social/collaborative | ◐ | `/community`, `discussions`, moderation basics. |
| 17 | Motivation (no dark patterns) | ✅ | Streaks + **streak freezes**, daily goal (XP-measured), badges, weekly challenge. Already avoids one-miss punishment. |
| 18 | Accessibility (WCAG 2.2 AA) | ◐ | Reduced-motion, semantic HTML, theming. **Next:** full audit (captions, keyboard, screen-reader pass). |
| 19 | AI safety + privacy | ◐ 👤 | RLS tenant isolation, role-based access, rate limits, `audit`/`error_log`, `integrity_checks`. **Next:** guardian consent gates, retention/export/delete, prompt-injection guardrails. Get 👤 legal review before claiming GDPR/COPPA/FERPA. |
| 20 | Credentialing | ◐ | `/certificates/[courseId]`. **Next:** competency-gated issuance + verify URL + Open Badges. |
| 21 | Career engine | ◐ | `/career` tracks, skill-gap framing, interview practice. **Next:** wire skill-gap to real `skill_states`. |
| 22 | Search + NL discovery | ◐ 🔑 | `/search` across courses/lessons/discussions. NL requests need 🔑. |
| 23 | Core screens | ✅/◐ | Home, My Learning, Practice, Coach, Community, Calendar, Progress, Career, Messages, Settings all exist. **Next:** Projects, Portfolio, Daily Plan. |
| 24 | Data model | ◐ | Most core entities exist (see migrations). **Shipped this pass:** skill_states, mastery_events, misconceptions. Still to add: concepts, skills, learning_objectives, questions, projects, rubrics, credentials. |
| 25 | Technical architecture | ✅ | Next.js + TS + Tailwind + Supabase (Postgres/RLS/Auth/Storage) + Stripe + LiveKit + web-push. Modular monolith — correct for this stage. |
| 26 | AI architecture (safety→retrieval→gen→checks) | ○ 🔑 ☁️ | Design the tutor orchestration + guardrail + eval pipeline when the key lands. |
| 27 | Analytics + north-star | ◐ | `analytics_events` capture exists. **Next:** compute the north-star (below) from `mastery_events`. |
| 28 | Experimentation | ○ | A/B framework measuring **delayed retention**, not just completions. |
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
4. ○ **Item bank** (`questions`) with distractor rationale + Bloom + stats.
5. ○ **Full lesson sequence** with a real mastery gate before "advance".
6. ○ **North-star metric** job (below) from `mastery_events`.

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
