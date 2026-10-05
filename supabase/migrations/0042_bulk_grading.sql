-- Bulk teacher grading: upload many papers at once (images, PDFs, PowerPoint),
-- auto-detect each student by name, auto-create a student account when none
-- exists, grade, annotate for a printable marked-up report, and email the
-- feedback to the student or parent. Builds on 0040 (paper_gradings). Idempotent.

-- 1) Contact details on the profile. A teacher can fill these in so the "email
--    feedback" button is one click. parent_email is the guardian contact.
--    auto_created marks a student account the system made from a scanned paper
--    (placeholder login until the student/teacher sets a real email).
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists parent_email text;
alter table public.profiles add column if not exists auto_created boolean not null default false;

-- 2) Richer paper records.
--    - widen the source list to include PowerPoint ('pptx')
--    - annotations: per-item marks for the printable graded report
--      (array of { label, correct: boolean, detail, correct_answer })
--    - emailed_to / emailed_at: record that feedback was sent
alter table public.paper_gradings drop constraint if exists paper_gradings_source_check;
alter table public.paper_gradings add constraint paper_gradings_source_check
  check (source in ('typed', 'image', 'pdf', 'pptx'));

alter table public.paper_gradings add column if not exists annotations jsonb;
alter table public.paper_gradings add column if not exists emailed_to text;
alter table public.paper_gradings add column if not exists emailed_at timestamptz;

-- 3) A teacher may read the contact fields of students they teach (so the email
--    button can pre-fill). Reads only; writes go through a server action that
--    uses the service role. The base profiles select policy still applies to
--    everyone else.
drop policy if exists "teacher reads taught student contact" on public.profiles;
create policy "teacher reads taught student contact" on public.profiles
  for select using (public.teaches_student(id));
