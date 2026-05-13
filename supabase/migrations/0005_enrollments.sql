-- Enrollments: which users are taking which courses, in what role.
-- Used to filter the student's assignments view and to gate access to private
-- course content.

create table if not exists public.enrollments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  role text not null default 'student' check (role in ('student','teaching_assistant')),
  enrolled_at timestamptz default now(),
  primary key (user_id, course_id)
);

create index if not exists idx_enrollments_course on public.enrollments (course_id);

alter table public.enrollments enable row level security;

-- Students see + manage their own enrollments.
create policy "own enrollments" on public.enrollments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- The course's teacher can read their roster.
create policy "teacher reads roster" on public.enrollments
  for select using (
    auth.uid() = (select teacher_id from public.courses c where c.id = course_id)
  );
