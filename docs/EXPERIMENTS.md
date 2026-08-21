# Experimentation (A/B) framework

Spec §28. Measure which product changes actually move the north-star —
**skills mastered per learner** — without any external service.

## How it works

```
experiments (config)  ──►  assignVariant(key)  ──►  experiment_exposures (who saw what)
                                                             │
skill_states / lesson_progress ──────────────────►  /admin/experiments (per-variant outcomes)
```

- **Assignment is deterministic.** `pickVariant()` hashes `(userId, key)` with
  FNV-1a and buckets over 10000, weighted by the experiment's `weights` (equal
  split by default). The same learner always lands in the same variant.
- **Exposure is recorded once.** The first time a learner hits `assignVariant`,
  a row is written to `experiment_exposures`. That row pins the variant even if
  the config's weights later change.
- **Outcomes are intention-to-treat.** `/admin/experiments` rolls the mastery
  and completion tables up per variant across every exposed learner.

## Add an experiment

1. Insert a config row:

   ```sql
   insert into public.experiments (key, name, description, variants, weights)
   values ('checkout_cta', 'Pricing CTA copy',
           'Test "Start free" vs "Try Noelia" on the pricing button.',
           '{control,treatment}', '{50,50}')
   on conflict (key) do nothing;
   ```

2. Read the variant on the server surface you want to vary and branch on it:

   ```ts
   import { assignVariant } from "@/lib/experiments";
   const variant = await assignVariant("checkout_cta"); // "control" | "treatment" | null
   // null => treat as control (no user, disabled, or missing config)
   ```

3. Watch results at **`/admin/experiments`**. Read directionally until each arm
   has enough learners; this framework reports lift, not significance.

## Live experiment

`lesson_nudge` — shows a short motivational banner at the top of each lesson
(treatment) vs. nothing (control), wired in `learn/[courseId]/[lessonId]`.
Outcome: skills mastered per exposed learner.

## Disable / weight

- Turn an experiment off: `update public.experiments set enabled = false where key = '…';`
  (assignment returns null → control path; existing exposures are kept).
- Ramp a variant: set `weights` (same length as `variants`). New learners split
  by the weights; already-exposed learners keep their pinned variant.
