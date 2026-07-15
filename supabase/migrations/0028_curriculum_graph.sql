-- Curriculum Engine — knowledge-graph layer.
-- Provenance (where a course's structure came from) + academic standards
-- (CEFR, Common Core, ACM) as machine-readable descriptors, plus the
-- mapping from courses to the standards they cover. This is what turns a
-- pile of courses into an ingestable, standards-aligned curriculum.
-- Fully idempotent.

-- Where curriculum structure is sourced from.
create table if not exists public.curriculum_sources (
  id text primary key,
  name text not null,
  url text,
  license text,
  kind text check (kind in
    ('open_courseware','open_textbook','standard','certification','framework'))
);

-- A standards framework (e.g. CEFR, Common Core Math, ACM CS2023).
create table if not exists public.standards (
  id text primary key,
  organization text not null,
  framework text not null,
  version text,
  url text
);

-- An individual competency/can-do statement within a framework.
create table if not exists public.standard_descriptors (
  id text primary key,
  standard_id text references public.standards(id) on delete cascade,
  code text not null,
  description text not null,
  level text,
  parent_id text references public.standard_descriptors(id) on delete cascade
);

-- Which standards a course covers (the alignment map).
create table if not exists public.course_standards (
  course_id uuid references public.courses(id) on delete cascade,
  descriptor_id text references public.standard_descriptors(id) on delete cascade,
  primary key (course_id, descriptor_id)
);

-- Provenance on the course itself.
alter table public.courses add column if not exists source_id text
  references public.curriculum_sources(id);
alter table public.courses add column if not exists source_ref text;

create index if not exists course_standards_course_idx
  on public.course_standards (course_id);
create index if not exists descriptors_standard_idx
  on public.standard_descriptors (standard_id);

-- All four are public reference data: readable by everyone, writable only
-- by the service role (no write policies = no client writes under RLS).
alter table public.curriculum_sources enable row level security;
alter table public.standards enable row level security;
alter table public.standard_descriptors enable row level security;
alter table public.course_standards enable row level security;

drop policy if exists "read sources" on public.curriculum_sources;
create policy "read sources" on public.curriculum_sources for select using (true);
drop policy if exists "read standards" on public.standards;
create policy "read standards" on public.standards for select using (true);
drop policy if exists "read descriptors" on public.standard_descriptors;
create policy "read descriptors" on public.standard_descriptors for select using (true);
drop policy if exists "read course standards" on public.course_standards;
create policy "read course standards" on public.course_standards for select using (true);
