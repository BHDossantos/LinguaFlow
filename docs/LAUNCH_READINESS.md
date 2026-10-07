# Noelia — Launch Readiness Roadmap

Goal: get the whole platform **feature-complete, Brightspace-grade, and tested**
before we package and publish the native mobile apps (Google Play + Apple App
Store). Mobile publishing is the LAST step, not the next one.

Sequencing:
1. **Workstream A — Brightspace-parity LMS** (the explicit ask: grades + content
   from both teacher and student sides).
2. **Workstream B — Finish/verify every existing feature** (no stubs in the
   shipped surface).
3. **Workstream C — QA & testing** (automated + manual, so we can say it works).
4. **Workstream D — Mobile publish** (native build + store submission runbook).

---

## Workstream A — Brightspace-parity LMS

Reference model: D2L Brightspace (as used at SNHU). Target parity, teacher +
student + parent.

| Brightspace capability | Noelia today | Plan |
|---|---|---|
| **Grade Book** (grade items, categories, weighting, schemes, final grade) | NEW — foundation built (migration 0043, `src/lib/gradebook.ts`) | Build teacher gradebook grid + student Grades page (below) |
| Grade schemes (A/B/C letter + GPA) | Built (per-classroom `scheme` jsonb, default 12-band) | Editable scheme UI |
| Weighted vs points grading | Built (`mode`, category weights, item weights, drop-lowest) | Expose in settings UI |
| **Assignments / Dropbox** (submit, due dates, status) | Exists (`assignments`, `submissions`, `ai_grades`, `teacher_reviews`) | Link each assignment to a grade item; sync score |
| **Rubrics** | Exists on assignments (`rubric` jsonb) + AI criteria | Reuse for grade items; shared rubric UI |
| **Content** (modules, topics, sequencing, completion) | Courses → lessons exist; no module grouping/release conditions | Add modules + completion tracking (phase 2) |
| **Quizzes** | Quiz lessons + auto-grade exist | Wire quiz scores into grade items |
| **Announcements** | Exists (classroom announcements) | Verify + surface in student view |
| **Calendar** (due dates) | `/calendar` exists | Feed grade-item/assignment due dates in |
| **Classlist / roster** | Exists (classroom_members) + bulk auto-roster | OK |
| **Grades student view** | MISSING | Build `/grades` (below) |
| **Progress / class analytics** | Partial (`teach/courses/[id]/analytics`) | Extend with gradebook stats |

### A1. Gradebook data model — DONE ✅
- `supabase/migrations/0043_gradebook.sql`: `gradebook_settings` (mode + grade
  scheme + class-average toggle), `grade_categories`, `grade_items` (optional
  link to an assignment), `grade_entries`, plus a `is_classroom_member()`
  security-definer helper. Full RLS: teachers manage; students read published
  items + their own entries; guardians read their child's.
- `src/lib/gradebook.ts`: pure grade calc (points + weighted, per-item weights,
  drop-lowest, letter/GPA from scheme).
- **Verified**: full migration chain applies on throwaway Postgres; RLS tested
  (teacher writes; student sees published items/categories + own entries only;
  student writes denied); grade math unit-checked (points/weighted/drop-lowest/
  letter bands/empty all correct).

### A2. Teacher gradebook UI — TODO
- `/teach/classrooms/[classroomId]/gradebook`: spreadsheet grid (students × grade
  items), inline entry edit, add/edit categories & items, set weights, pick
  scheme/mode, per-student feedback, "release" (publish) grades.
- Import scores from an assignment's submissions/AI grades into a grade item.

### A3. Student grades UI — TODO
- `/grades` (and per-classroom): list grade items with points, %, letter,
  feedback, due dates, and the running **final grade** (letter + %). Optional
  class average when the teacher enables it. Parent sees the same for their child.

### A4. Integrations — TODO
- Assignment graded (teacher_review.final_score) → upsert the linked grade_item's
  entry. Quiz/paper grading → optional grade item. Calendar shows due dates.

---

## Workstream B — Finish/verify existing features
A full route-by-route audit is running; this section will be filled from it.
Known-good foundations: catalog (223 courses), lessons (reading/quiz/vocab/code —
JS/Python/SQL), mastery + retention, paper grading + bulk grading, roles,
family/parent, PWA. Each route gets a WORKING/PARTIAL/STUB verdict and any stub
is either finished or hidden before launch.

## Workstream C — QA & testing
- Unit tests for pure libs (start: `gradebook.ts`, `grading.ts`) — add a runner
  (vitest).
- Expand e2e (Playwright) beyond the current 8 specs to cover the LMS flows:
  teacher creates grade item → grades student → student sees grade; assignment
  submit → grade → gradebook.
- Manual QA checklist per role (student / teacher / parent / admin).
- `tsc` + `next build` green on every change (already enforced).

## Workstream D — Mobile publish (LAST)
- `npx cap add ios && npx cap add android` on a Mac/PC with Xcode / Android
  Studio (cannot be done in the cloud container).
- Icons/splash already configured; app is login-only in the shell (store billing
  compliance). Build signed `.ipa` / `.aab`, submit to App Store Connect / Google
  Play Console with the developer accounts. Full runbook to be added here.

---

## Status log
- 2026-10-07: Gradebook foundation (A1) built + verified. Launch-readiness audit
  started. Roadmap created.
