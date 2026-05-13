-- Phase 2: assignments + AI grading + teacher review.

alter table public.courses
  add column if not exists teacher_id uuid references public.profiles(id) on delete set null,
  add column if not exists subject text,
  add column if not exists kind text not null default 'language' check (kind in ('language','math','science','humanities','arts','life_skills'));

create index if not exists idx_courses_teacher on public.courses (teacher_id);

create table if not exists public.assignments (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  title text not null,
  instructions_md text not null,
  rubric jsonb not null default '[]'::jsonb, -- [{name, weight, description}]
  max_score int not null default 100,
  kind text not null default 'essay' check (kind in ('essay','short_answer','math','speaking','project')),
  language text,
  due_at timestamptz,
  published boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_assignments_course on public.assignments (course_id);
create index if not exists idx_assignments_teacher on public.assignments (teacher_id);

create table if not exists public.submissions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  text text,
  file_url text,
  submitted_at timestamptz default now(),
  status text not null default 'submitted' check (status in ('draft','submitted','graded','returned')),
  unique (assignment_id, student_id)
);

create index if not exists idx_submissions_student on public.submissions (student_id);
create index if not exists idx_submissions_assignment on public.submissions (assignment_id);

create table if not exists public.ai_grades (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  score real,
  max_score real,
  feedback_md text,
  criteria jsonb, -- [{name, score, max, feedback}]
  confidence real,
  created_at timestamptz default now()
);

create index if not exists idx_ai_grades_submission on public.ai_grades (submission_id);

create table if not exists public.teacher_reviews (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  final_score real,
  comments_md text,
  approved_ai boolean default false,
  reviewed_at timestamptz default now()
);

create index if not exists idx_teacher_reviews_submission on public.teacher_reviews (submission_id);

-- RLS
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.ai_grades enable row level security;
alter table public.teacher_reviews enable row level security;

-- Students see published assignments; teachers see/manage their own.
create policy "assignments student read" on public.assignments
  for select using (published);
create policy "assignments teacher manage" on public.assignments
  for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);

-- Students read/write their own submissions; the assignment's teacher can read.
create policy "submissions student rw" on public.submissions
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy "submissions teacher read" on public.submissions
  for select using (
    auth.uid() = (select teacher_id from public.assignments a where a.id = assignment_id)
  );

-- AI grades visible to the submission's student and the assignment's teacher.
create policy "ai_grades read participants" on public.ai_grades
  for select using (
    auth.uid() = (select student_id from public.submissions s where s.id = submission_id)
    or auth.uid() = (
      select a.teacher_id from public.assignments a
      join public.submissions s on s.assignment_id = a.id
      where s.id = submission_id
    )
  );

-- Teacher writes reviews; student reads their own.
create policy "teacher_reviews teacher rw" on public.teacher_reviews
  for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);
create policy "teacher_reviews student read" on public.teacher_reviews
  for select using (
    auth.uid() = (select student_id from public.submissions s where s.id = submission_id)
  );
