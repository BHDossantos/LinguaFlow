# Noelia

Mobile-first hybrid AI + human language-learning platform. See [PRODUCT.md](./PRODUCT.md) for the spec.

## Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind, mobile-first PWA.
- **Backend:** Supabase (Postgres + Auth + Storage + Realtime).
- **AI:** Anthropic Claude for tutoring, roleplay, writing feedback, translation refinement.
- **Payments:** Stripe (per-minute tutor billing).

## Setup

```bash
cp .env.example .env.local
# fill in Supabase + Anthropic + Stripe keys
npm install
npm run dev
```

Apply the schema:
```bash
# in Supabase SQL editor, run supabase/migrations/0001_init.sql
```

## Routes
- `/` — landing / dashboard.
- `/learn` — self-study course list.
- `/learn/[courseId]/[lessonId]` — lesson player.
- `/practice` — AI roleplay scenarios.
- `/translate` — real-time voice/text translation.
- `/tutors` — browse + instant-connect with instructors.
- `/api/translate`, `/api/roleplay`, `/api/pronunciation`, `/api/writing-feedback` — AI endpoints.

## Branch
Active development: `claude/language-learning-app-vfwbQ`.
