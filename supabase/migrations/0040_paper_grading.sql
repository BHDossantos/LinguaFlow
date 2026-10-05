-- Roles + paper grading (teacher uploads a student's paper — typed, scanned, or
-- photographed — the system grades it, and the student, their teachers, and their
-- guardians are all notified with feedback, focus areas, and a next-steps plan).
-- Spec §5/§8/§14/§15. Idempotent.

-- 1) First-class account role. Student is the default; teacher and parent get the
--    corresponding workspaces (/teach, /parent, /family). admin for org owners.
alter table public.profiles
  add column if not exists role text not null default 'student'
  check (role in ('student', 'teacher', 'parent', 'admin'));

-- 2) Graded papers. A paper can be typed, an uploaded scan/photo (graded via
--    vision), or a PDF. Graded for the student themselves or by one of their
--    teachers on the student's behalf.
create table if not exists public.paper_gradings (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  graded_by uuid references public.profiles(id) on delete set null,
  title text,
  subject text,
  source text not null default 'typed' check (source in ('typed', 'image', 'pdf')),
  raw_text text,                 -- typed answers or the text the model read from the scan
  score numeric,
  max_score numeric,
  feedback_md text,              -- detailed feedback for the student
  focus_areas jsonb,             -- array of short strings: what to focus on next
  plan_md text,                  -- a concrete next-steps study plan
  status text not null default 'graded' check (status in ('graded', 'reviewed')),
  created_at timestamptz not null default now()
);
create index if not exists idx_paper_gradings_student on public.paper_gradings (student_id, created_at desc);

alter table public.paper_gradings enable row level security;

-- The student reads their own; their classroom teachers and linked guardians read
-- them too (same visibility model as the mastery tables).
drop policy if exists "student reads own papers" on public.paper_gradings;
create policy "student reads own papers" on public.paper_gradings
  for select using (auth.uid() = student_id);
drop policy if exists "teacher reads student papers" on public.paper_gradings;
create policy "teacher reads student papers" on public.paper_gradings
  for select using (public.teaches_student(student_id));
drop policy if exists "guardian reads student papers" on public.paper_gradings;
create policy "guardian reads student papers" on public.paper_gradings
  for select using (public.is_guardian_of(student_id));

-- A paper can be filed by the student themselves or by one of their teachers.
drop policy if exists "file own or taught papers" on public.paper_gradings;
create policy "file own or taught papers" on public.paper_gradings
  for insert with check (auth.uid() = student_id or public.teaches_student(student_id));

-- Student or teacher may update status (e.g. mark reviewed).
drop policy if exists "update own or taught papers" on public.paper_gradings;
create policy "update own or taught papers" on public.paper_gradings
  for update using (auth.uid() = student_id or public.teaches_student(student_id))
  with check (auth.uid() = student_id or public.teaches_student(student_id));

-- 3) Allow the new notification kind.
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in ('grade_returned', 'announcement', 'attendance_alert', 'paper_graded'));

-- 4) On grading, notify the student, their guardians, and their teachers
--    (security definer — owns the notification insert path, like the other
--    notification triggers).
create or replace function public.notify_paper_graded() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_score text;
  v_link text;
begin
  select display_name into v_name from public.profiles where id = new.student_id;
  v_score := coalesce(new.score::text, '?') || '/' || coalesce(new.max_score::text, '100');
  v_link := '/papers/' || new.id::text;

  -- the student
  insert into public.notifications (user_id, kind, title, body, link)
  values (new.student_id, 'paper_graded', 'Your paper was graded',
          coalesce(new.title, 'Paper') || ' — ' || v_score, v_link);

  -- their guardians
  insert into public.notifications (user_id, kind, title, body, link)
  select g.guardian_id, 'paper_graded',
         coalesce(v_name, 'Your student') || '''s paper was graded',
         coalesce(new.title, 'Paper') || ' — ' || v_score, v_link
  from public.guardians g
  where g.student_id = new.student_id;

  -- their teachers (not the one who just graded it)
  insert into public.notifications (user_id, kind, title, body, link)
  select distinct tm.user_id, 'paper_graded',
         coalesce(v_name, 'A student') || '''s paper was graded',
         coalesce(new.title, 'Paper') || ' — ' || v_score, v_link
  from public.classroom_members sm
  join public.classroom_members tm
    on tm.classroom_id = sm.classroom_id and tm.role = 'teacher'
  where sm.user_id = new.student_id and sm.role = 'student'
    and tm.user_id is distinct from new.graded_by;

  return new;
end;
$$;

drop trigger if exists trg_notify_paper_graded on public.paper_gradings;
create trigger trg_notify_paper_graded
  after insert on public.paper_gradings
  for each row execute function public.notify_paper_graded();
