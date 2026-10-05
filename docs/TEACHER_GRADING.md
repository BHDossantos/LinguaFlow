# Teacher grading: bulk upload, auto-roster, email & printable reports

Teachers grade student work at `/teach/grade`. Two modes:

- **Single paper** — pick a student, type/scan/upload one paper, grade it.
- **Bulk upload** — drop a stack of files (one paper per file). The system reads
  each student's name off the paper, finds or creates their account, grades, and
  files the result.

## What bulk upload does, per file

1. **Reads the file.** Images and PDFs are read natively by the model (vision /
   document). PowerPoint (`.pptx`) has its slide text extracted first.
2. **Identifies the student.** The model reads the first/last name written on the
   paper. The name is matched (case-insensitive) against the students already in
   the chosen **classroom**.
   - If no student matches, a **placeholder account is created** and enrolled in
     that classroom (this is what lets the teacher file and read the paper).
     Enrolling is required because paper visibility is governed by classroom
     co-membership (`teaches_student`).
   - If the model can't find a name, the file is handed back so the teacher can
     pick the student from a dropdown and file it manually.
3. **Grades and files it.** Score, feedback, focus areas, a study plan, and
   per-question **annotations** (correct/incorrect + the right answer) are stored.
   The existing trigger notifies the student, their parents, and their other
   teachers.

## Placeholder accounts

Auto-created students get a synthetic login email like
`auto.jane.doe.ab12cd@students.learnnoelia.com` and `auto_created = true`. The
teacher later sets the real student/parent email from the grading result (the
"Email" button prompts for it when none is on file) or from the student's profile.
Requires `SUPABASE_SERVICE_ROLE_KEY` (already used elsewhere).

## Emailing feedback

Each graded result has **Email student** / **Email parent** buttons.

- With `RESEND_API_KEY` set, the server sends the feedback email (from
  `EMAIL_FROM`, which must be a verified Resend sender/domain).
- Without it, the button opens the teacher's own mail client (`mailto:`)
  pre-filled with the recipient, subject, and feedback.
- If no email is on file, the button asks for one and saves it to the student's
  profile (`email` / `parent_email`) for next time.

## Printable marked-up report

`/papers/<id>/print` renders a teacher-style report: each question with a green
check (correct) or red X (wrong) plus the correct answer, then the feedback
summary, areas to improve, and the study plan. The Print button uses the
browser's print dialog (print CSS hides the app chrome).

## Database

Migration `0042_bulk_grading.sql`:
- `profiles.email`, `profiles.parent_email`, `profiles.auto_created`
- `paper_gradings`: `source` widened to include `pptx`; `annotations jsonb`;
  `emailed_to`, `emailed_at`
- teacher read policy for taught students' contact fields

## Env

```
SUPABASE_SERVICE_ROLE_KEY=...        # account creation + contact writes (already present)
RESEND_API_KEY=...                   # optional: real email sending (else mailto fallback)
EMAIL_FROM="Noelia <feedback@learnnoelia.com>"   # verified sender for Resend
```
