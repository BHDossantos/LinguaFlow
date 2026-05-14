-- Phase 4 wedge: parent / guardian portal.
-- A guardian links to a student using a short invite code the student shares.

alter table public.profiles
  add column if not exists guardian_invite_code text unique;

create table if not exists public.guardians (
  guardian_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (guardian_id, student_id),
  check (guardian_id <> student_id)
);

create index if not exists idx_guardians_student on public.guardians (student_id);

alter table public.guardians enable row level security;

-- Guardian manages their own links; student can see (and remove) who follows them.
create policy "guardian own links" on public.guardians
  for all using (auth.uid() = guardian_id) with check (auth.uid() = guardian_id);
create policy "student sees own guardians" on public.guardians
  for select using (auth.uid() = student_id);
create policy "student removes own guardians" on public.guardians
  for delete using (auth.uid() = student_id);

-- Helper: is the current user a linked guardian of :student?
create or replace function public.is_guardian_of(student uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.guardians g
    where g.guardian_id = auth.uid() and g.student_id = student
  );
$$;

-- Guardian read access across the student's academic record.
create policy "guardian reads profile" on public.profiles
  for select using (public.is_guardian_of(id));
create policy "guardian reads enrollments" on public.enrollments
  for select using (public.is_guardian_of(user_id));
create policy "guardian reads lesson progress" on public.lesson_progress
  for select using (public.is_guardian_of(user_id));
create policy "guardian reads weekly goals" on public.weekly_goals
  for select using (public.is_guardian_of(user_id));
create policy "guardian reads submissions" on public.submissions
  for select using (public.is_guardian_of(student_id));
create policy "guardian reads ai grades" on public.ai_grades
  for select using (
    public.is_guardian_of((select student_id from public.submissions s where s.id = submission_id))
  );
create policy "guardian reads teacher reviews" on public.teacher_reviews
  for select using (
    public.is_guardian_of((select student_id from public.submissions s where s.id = submission_id))
  );
