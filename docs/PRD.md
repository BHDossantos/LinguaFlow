# Noelia — Product Requirements Document

An AI-native global learning platform: languages, academics, and professional
skills in one system. This PRD is the blueprint a developer, designer, or
acquirer can build and evaluate from. It reflects what is **built** (✅),
**partial** (◐ — code exists, config/expansion pending), and **planned** (○).

Live: https://learnnoelia.com · Stack: Next.js 15 (App Router) · Supabase
(Postgres + RLS + Auth + Storage) · Stripe · LiveKit · web-push · Anthropic.

---

## Volume 1 — Product Vision

- **Mission:** make a world-class education — from A1 Spanish to university-level
  science and job-ready tech skills — personal, affordable, and measurable.
- **Users:** self-study students, language learners, K-12 & university students,
  teachers/tutors, parents/guardians, schools/orgs.
- **Business model:** free tier; Premium subscription ($9.99/mo, ✅ wired);
  per-minute live tutoring with revenue share (✅); course marketplace (◐);
  enterprise/school licensing (◐).
- **Competitive wedge:** the **Curriculum Engine** (Volume 4) + adaptive
  intelligence — not another prettier LMS. Courses are data flowing through an
  engine that ingests trusted sources and aligns them to standards.
- **Success metrics:** activation (onboarding→first lesson), D1/D7/D30 retention,
  streak rate, lessons/week, mastery velocity, paid conversion, tutor GMV.

## Volume 2 — Design System

- **Palette:** minimal — white / light-gray surfaces, `#0b1020` ink, brand blue
  `#3b6cf6`, violet accent, green success, amber achievement. No rainbow.
- **Sidebar** (desktop): dark `#0e1022` panel. **App shell** vs **marketing
  shell** chosen by auth state.
- **Type/layout:** one sans family, generous spacing, rounded-2xl cards, soft
  shadows, large tap targets. Forced light theme.
- **Components:** `.card`, `.btn-primary`, `.btn-ghost`, stat tiles, progress
  bars, skill bars, chips, letter-badge quiz options, celebration/confetti.
- **Motion:** fade-up, confetti on completion, XP pop; respects
  `prefers-reduced-motion`.
- **Responsive:** BottomNav < lg, SideNav ≥ lg; three-zone lesson view ≥ lg.
- **Accessibility (○ audit pending):** semantic HTML, aria labels, keyboard nav,
  captions/transcripts for future video.

## Volume 3 — Student Experience

Signup (magic link ✅ / Google OAuth ✅) → onboarding (multi-language, name,
goals, adult mode, **placement test** ✅) → **Home** (Today's Mission ✅, goal
ring, streak, weekly challenge, recommended) → **Discover** (5 schools) →
**Course dashboard** (hero, stat row, Overview panels, curriculum table) →
**Lesson player** (vocab 3-mode / quiz / roleplay / content; outline + vocab
panels ✅) → **Review** (SRS ✅) → **Practice** (roleplay ◐) → **Community** ✅ →
**Career** ✅ → **Profile** (level, heatmap, achievements, certificates ✅) →
**Certificate** ✅. Gamification: XP, levels, streaks + **freezes** ✅,
achievements, daily goal, weekly challenge, leaderboard ✅.

## Volume 4 — Curriculum Engine ✅

The differentiator. `docs/CURRICULUM_ENGINE.md` is the full reference.
- **Knowledge graph:** `curriculum_sources`, `standards`,
  `standard_descriptors`, `course_standards`, course provenance.
- **Ingestion pipeline:** `scripts/ingest/` — interchange `schema.json` +
  `build-sql.mjs` normalizer → idempotent seed SQL. Human review before publish.
- **Standards:** CEFR (A1–C1 × 5 skills), Common Core Math, ACM CS — 37
  descriptors, 137 course alignments; language courses auto-align by level.
- **Content today:** 5 schools, 36 courses, ~360 lessons (CEFR languages A1→C1 +
  university seminar tier; Math arithmetic→statistics; Tech literacy→CS;
  Business; Science incl. pipeline-generated Psychology). Structure sourced from
  OpenStax, CK-12, MIT OCW; prose original; every course credits its source.
- **Mastery:** derived per-lesson status (Attempted→Familiar→Proficient→
  Mastered) from scores; per-skill progress bars.

## Volume 5 — AI Engine ◐ (code built; activates with `ANTHROPIC_API_KEY`)

- **Tutor/Coach** with 4 modes: Explain, Socratic (guides, never spoils),
  Practice, Review — level- and language-aware.
- **Roleplay** conversation with corrections + captured vocabulary → SRS.
- **Grading** (rubric-based) + **integrity** (similarity + generated-text signal).
- **Draft generation** for teachers (lessons/assignments).
- **Translate** (voice/text) feeding the learner model.
- Every AI surface degrades honestly (503 + banner) when unconfigured.
- **Planned (○):** adaptive difficulty, completion prediction, forgetting-curve
  scheduling, pronunciation coaching feedback.

## Volume 6 — Teacher Studio ✅ (AI-authoring flow ◐)

Create courses/lessons/quizzes/assignments; per-kind editors; roster; reorder;
**system grading** + integrity panel + teacher review/override; **analytics**
(enrolled vs submitted, per-assignment averages, weak rubric criteria). Planned:
guided topic→generated-curriculum→edit→publish wizard on the ingestion pipeline.

## Volume 7 — Marketplace ◐

Live: per-minute tutoring (Stripe PaymentIntent, connected-account transfer,
capture-actual-usage, LiveKit video ✅). Premium subscription checkout + webhook
fulfillment ✅. Planned: course sales, instructor payouts, reviews, coupons.

## Volume 8 — Enterprise / Schools ✅ core

Orgs, join codes, classrooms, roster/roles, course assignment (auto-enroll),
schedule, announcements, **attendance**, **live class video** (LiveKit).
Parent/guardian portal ✅. Planned (○): SSO, HR dashboards, seat billing.

## Volume 9 — Backend Architecture

Next.js server components + server actions; Supabase Postgres with **RLS on
every table**; service-role only for privileged writes (analytics, subscriptions,
push). Rate limiting DB-backed (fixed-window, fails open). Migrations 0001–0028
(idempotent, replayable — verified against local Postgres). Web-push cron.
Event-shaped analytics (`analytics_events`, page beacons). Services conceptually
split: auth, curriculum, content, tutor, progress/mastery, assessment, payments,
certificates, marketplace, notifications, community, analytics.

## Volume 10 — Mobile

PWA today (manifest, service worker, offline fallback, installable, push).
Native iOS/Android (○) would reuse the same Supabase API surface.

---

## Roadmap (next)

1. Populate the engine — more sources through the pipeline (Economics,
   Chemistry, Sociology, Physics, more MIT OCW) → hundreds of aligned courses.
2. Turn on AI (`ANTHROPIC_API_KEY`) — Coach, roleplay, grading, translate.
3. Teacher AI-authoring wizard on the ingestion pipeline.
4. Adaptive personalization: mastery decay, completion prediction, recommendations.
5. Course marketplace payouts; enterprise SSO + seat billing.
6. Accessibility audit (WCAG) and native mobile apps.
