# Noelia → an AI-native Learning Operating System

A mobile-first AI-native education platform. Where modern learning lives.

**Tagline:** Adaptive AI lessons, live instructors, AI grading, and real-world
immersion — built for middle school, high school, language learners, and
international curricula.

---

## Positioning

We are **not** "another language app." We are the operating system schools,
teachers, students, and parents use day-to-day:

- **Students** — adaptive lessons, AI tutoring, live instructors, instant feedback.
- **Teachers** — course builder, assignments, AI-assisted grading, analytics.
- **Parents** — visibility into progress, grades, attendance, communication.
- **Schools** — classroom, attendance, schedules, announcements — without the LMS pain.

---

## 5-Phase Roadmap

| Phase | Scope | Status |
|---|---|---|
| **1. Language + tutors** | 5 languages, AI roleplay, SRS, pronunciation, real-time translation, instant per-minute live tutors. | **In progress** ✅ mostly built |
| **2. Assignments + AI grading** | Teachers create assignments, students submit, AI grades in seconds, teachers approve/edit. | **In progress** ← current |
| **3. Academic subjects** | Math, science, history, philosophy, writing — adaptive at IB/AP level. | Planned |
| **4. Parent portal + school admin** | Parent visibility, classrooms, attendance, schedules. | Planned |
| **5. Full international school OS** | Multi-school tenancy, curriculum library, advisory & wellbeing modules. | Planned |

We deliberately ship Phase N before starting Phase N+1. One real teacher with a
real student going through one assignment beats six half-built modules.

---

## 15 Problems Most Education Platforms Fail to Solve

1. **Fragmented stacks** — Zoom + Docs + WhatsApp + PDFs + LMS. We unify them.
2. **AI bolted on, not native** — most LMSes treat AI as an add-on. We're AI-native end to end.
3. **Teachers drown in grading** — AI grades in seconds; teacher approves/edits.
4. **No personalization** — adaptive paths per learner, not one-size cohorts.
5. **Memorization over understanding** — interactive AI explanations and scenario learning.
6. **No real-time analytics** — live dashboards + predictive performance.
7. **Weak parent communication** — integrated parent portal and alerts.
8. **Delayed feedback** — instant AI correction; teacher confirms.
9. **Languages siloed from academics** — language embedded in real subjects (history in Spanish, biology in French).
10. **Passive learning** — conversation, roleplay, simulation.
11. **Teachers lack scalable content systems** — content builder + reusable curriculum modules.
12. **Motivation collapse** — accountability, goals, AI coaching — without dark patterns.
13. **International students adapting** — multilingual UI + adaptive onboarding.
14. **No scalable tutoring** — AI tutor + live human hybrid.
15. **LMS UX is hostile** — modern mobile-first UX, AI-native infrastructure.

---

## Phase 1 — Language Learning Pillar

Languages: **English, Spanish, Italian, Portuguese, French.**

### The 16 problems we solve in Phase 1

1. No real speaking practice → AI pronunciation scoring + on-demand human tutors.
2. No accent/dialect choice → pick a regional variant.
3. Vocabulary disconnected from your life → goal-driven content.
4. SRS done badly or paywalled → spaced repetition is the spine.
5. Studio-only listening → native-speed audio with slowdown without pitch shift.
6. Grammar babied or absent → optional adult-grade grammar notes.
7. No writing feedback → AI corrections; escalate to tutor for nuance.
8. Streaks punish life → streak freezes, weekly goals, mastery-based progress.
9. Plateau at A2/B1 → real content (news, podcasts, shows) with in-app lookup.
10. Tutors live in a separate marketplace → built-in instant connect, per-minute billing.
11. No conversation simulation → AI roleplay before paying for human tutoring.
12. Opaque progress → CEFR-aligned skill tree.
13. No offline → downloadable lessons; SRS works offline.
14. Kid-only content → adult mode with mature topics + professional vocab.
15. Forgets you between sessions → persistent learner model surfaced everywhere.
16. Real-time translation in another app → built-in voice/text translation that feeds the learner model.

---

## Pillars (over gamification)

Conversational fluency · Pronunciation accuracy · Confidence · Accountability · Real-world immersion.

## Non-goals (early)

- Owl mascots, leaderboards, lottery boxes, dark-pattern streak guilt.
- Becoming a generic translation app.
- Boiling the ocean by shipping all 5 phases in parallel.

---

## Vision 2.0 — The Seven Experiences (roadmap of record, July 2026)

North star: the Apple of education — beautiful, simple, personalized, AI-first.
Design DNA: Apple simplicity · Spotify personalization · Duolingo engagement ·
Notion cleanliness · conversational AI everywhere · Netflix-grade recommendations.

| # | Experience | What it is | Status |
|---|---|---|---|
| 1 | **Learn** | Courses, bite-sized lessons, quizzes, projects; visual learning paths (chapter → challenge → project → capstone → certification) | ✅ Core shipped (courses, multi-mode lessons, SRS); learning-path visualization planned |
| 2 | **AI Tutor (Coach)** | 24/7 personal teacher: explain anything, generate practice, test me, translate | ✅ Surface shipped (`/coach`); brain lights up with `ANTHROPIC_API_KEY` |
| 3 | **Practice** | Flashcards, pronunciation, roleplay conversations, mock exams | ✅ Shipped (3-mode drills, word-scored pronunciation, roleplay scenarios) |
| 4 | **Community** | Per-course discussions, study groups, peer review, mentors | Planned (schema next; needs moderation design before launch) |
| 5 | **Marketplace** | Teachers sell courses/tutoring/materials; platform takes a cut | Planned (blocked on Stripe keys; teacher authoring already shipped) |
| 6 | **Career** | Skills assessment, certificates, resume, interview prep, job matching | Planned (phase after retention proves out) |
| 7 | **Creator Studio** | AI-assisted authoring, analytics, revenue, engagement tools | Partially shipped (composer + AI drafts + per-course analytics); revenue view blocked on Stripe |

### Gamification (shipped July 2026)
XP on every action (lessons +25, reviews +2, submissions +15, pronunciation +5),
quadratic level curve, daily streaks with longest-streak memory, 12-week
activity heatmap, confetti + XP pop on completion. Next: achievements,
leaderboards, monthly challenges, coins/unlocks.

### Design system rules
Minimal palette (white / light gray / charcoal / blue accent / green success /
gold achievements) · one font (Inter) · rounded cards, soft shadows, big
buttons · every interaction animated (progress fills, confetti, count-ups) ·
mobile-first always · five-tab navigation (Home, Discover, Coach, Practice,
Profile) and no more.

### AI everywhere (key-gated)
Lesson/quiz/homework generation, study plans, roadmap generation ("I want to
become X" → generated path), voice conversations, interview practice, grading,
translations, recommendations. All routes are built to degrade gracefully:
the app is fully usable without the key; intelligence layers on when present.
