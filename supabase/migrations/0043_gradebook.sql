-- Brightspace-style gradebook (D2L parity: grade categories, weighted/points
-- grade items, grade schemes/letter grades, per-student grade entries, and a
-- student-facing grades view). Scoped to a classroom (the teaching unit;
-- teacher/student visibility already flows through classroom membership).
-- Idempotent. Builds on 0009 (classrooms) and 0003 (assignments).

-- 1) Per-classroom gradebook settings + grade scheme (percentage -> letter).
create table if not exists public.gradebook_settings (
  classroom_id uuid primary key references public.classrooms(id) on delete cascade,
  mode text not null default 'points' check (mode in ('points', 'weighted')),
  -- ranges sorted high->low; each {min: percent floor, symbol: letter, gpa?: number}
  scheme jsonb not null default '[
    {"min":93,"symbol":"A","gpa":4.0},{"min":90,"symbol":"A-","gpa":3.7},
    {"min":87,"symbol":"B+","gpa":3.3},{"min":83,"symbol":"B","gpa":3.0},
    {"min":80,"symbol":"B-","gpa":2.7},{"min":77,"symbol":"C+","gpa":2.3},
    {"min":73,"symbol":"C","gpa":2.0},{"min":70,"symbol":"C-","gpa":1.7},
    {"min":67,"symbol":"D+","gpa":1.3},{"min":63,"symbol":"D","gpa":1.0},
    {"min":60,"symbol":"D-","gpa":0.7},{"min":0,"symbol":"F","gpa":0.0}
  ]'::jsonb,
  show_class_average boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 2) Grade categories (weighted buckets, e.g. Homework 20%, Tests 50%).
create table if not exists public.grade_categories (
  id uuid primary key default uuid_generate_v4(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  name text not null,
  weight numeric not null default 0,       -- percent of final grade (weighted mode)
  drop_lowest int not null default 0,      -- drop N lowest items in the category
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_grade_categories_classroom on public.grade_categories (classroom_id, position);

-- 3) Grade items (columns in the gradebook). May link to an assignment.
create table if not exists public.grade_items (
  id uuid primary key default uuid_generate_v4(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  category_id uuid references public.grade_categories(id) on delete set null,
  name text not null,
  type text not null default 'manual'
    check (type in ('assignment', 'quiz', 'paper', 'participation', 'project', 'manual')),
  assignment_id uuid references public.assignments(id) on delete set null,
  max_points numeric not null default 100,
  weight numeric not null default 0,       -- within-category weight (weighted mode); 0 = equal
  due_at timestamptz,
  position int not null default 0,
  published boolean not null default true, -- unpublished = hidden from students (draft)
  created_at timestamptz not null default now()
);
create index if not exists idx_grade_items_classroom on public.grade_items (classroom_id, position);
create index if not exists idx_grade_items_category on public.grade_items (category_id);
create index if not exists idx_grade_items_assignment on public.grade_items (assignment_id);

-- 4) Grade entries (one per student per item). points null = not yet graded.
create table if not exists public.grade_entries (
  id uuid primary key default uuid_generate_v4(),
  grade_item_id uuid not null references public.grade_items(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  points numeric,
  feedback_md text,
  exempt boolean not null default false,
  graded_by uuid references public.profiles(id) on delete set null,
  graded_at timestamptz not null default now(),
  unique (grade_item_id, student_id)
);
create index if not exists idx_grade_entries_student on public.grade_entries (student_id);
create index if not exists idx_grade_entries_item on public.grade_entries (grade_item_id);

-- Security-definer membership check (bypasses classroom_members RLS so a student
-- can be recognized as a member inside other tables' policies, mirroring
-- is_classroom_teacher).
create or replace function public.is_classroom_member(p_classroom uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from classroom_members m
    where m.classroom_id = p_classroom and m.user_id = auth.uid()
  );
$$;
revoke all on function public.is_classroom_member(uuid) from public;
grant execute on function public.is_classroom_member(uuid) to authenticated;

-- ===== RLS =====
alter table public.gradebook_settings enable row level security;
alter table public.grade_categories enable row level security;
alter table public.grade_items enable row level security;
alter table public.grade_entries enable row level security;

-- Readable by anyone in the classroom (teacher or student) and by guardians of a
-- member. Managed only by the classroom's teacher.
-- gradebook_settings
drop policy if exists "gb_settings read" on public.gradebook_settings;
create policy "gb_settings read" on public.gradebook_settings for select using (
  public.is_classroom_teacher(classroom_id)
  or public.is_classroom_member(classroom_id)
  or public.is_guardian_of_classroom_member(classroom_id)
);
drop policy if exists "gb_settings manage" on public.gradebook_settings;
create policy "gb_settings manage" on public.gradebook_settings for all
  using (public.is_classroom_teacher(classroom_id))
  with check (public.is_classroom_teacher(classroom_id));

-- grade_categories
drop policy if exists "gb_categories read" on public.grade_categories;
create policy "gb_categories read" on public.grade_categories for select using (
  public.is_classroom_teacher(classroom_id)
  or public.is_classroom_member(classroom_id)
  or public.is_guardian_of_classroom_member(classroom_id)
);
drop policy if exists "gb_categories manage" on public.grade_categories;
create policy "gb_categories manage" on public.grade_categories for all
  using (public.is_classroom_teacher(classroom_id))
  with check (public.is_classroom_teacher(classroom_id));

-- grade_items (students only see published ones)
drop policy if exists "gb_items read" on public.grade_items;
create policy "gb_items read" on public.grade_items for select using (
  public.is_classroom_teacher(classroom_id)
  or (published and (
    public.is_classroom_member(classroom_id)
    or public.is_guardian_of_classroom_member(classroom_id)
  ))
);
drop policy if exists "gb_items manage" on public.grade_items;
create policy "gb_items manage" on public.grade_items for all
  using (public.is_classroom_teacher(classroom_id))
  with check (public.is_classroom_teacher(classroom_id));

-- grade_entries: student reads own; guardian reads their student's; teacher of
-- the item's classroom manages all.
drop policy if exists "gb_entries student read" on public.grade_entries;
create policy "gb_entries student read" on public.grade_entries for select
  using (auth.uid() = student_id or public.is_guardian_of(student_id));
drop policy if exists "gb_entries teacher read" on public.grade_entries;
create policy "gb_entries teacher read" on public.grade_entries for select using (
  public.is_classroom_teacher((select gi.classroom_id from public.grade_items gi where gi.id = grade_item_id))
);
drop policy if exists "gb_entries teacher write" on public.grade_entries;
create policy "gb_entries teacher write" on public.grade_entries for all using (
  public.is_classroom_teacher((select gi.classroom_id from public.grade_items gi where gi.id = grade_item_id))
) with check (
  public.is_classroom_teacher((select gi.classroom_id from public.grade_items gi where gi.id = grade_item_id))
);
