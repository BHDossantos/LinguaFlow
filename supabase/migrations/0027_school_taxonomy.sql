-- School taxonomy in its own column. courses.subject remains what it always
-- was — a free-text teacher label ("AP Biology") — while courses.school is
-- the constrained platform taxonomy driving the Discover school tabs.
-- Convergent from ANY prior state: fresh DBs, DBs where earlier bundles
-- half-applied, and DBs where seeds already wrote taxonomy values into
-- subject.

-- Undo the earlier mistaken constraint wherever it landed.
alter table public.courses drop constraint if exists courses_subject_check;

alter table public.courses add column if not exists school text;

-- Rows seeded before this fix put taxonomy values in subject — migrate them.
update public.courses set school = subject
  where school is null
    and subject in ('math','technology','business','science');

update public.courses set school = 'language' where school is null;

alter table public.courses alter column school set default 'language';
alter table public.courses alter column school set not null;

alter table public.courses drop constraint if exists courses_school_check;
alter table public.courses
  add constraint courses_school_check
  check (school in ('language','math','technology','business','science'));

alter table public.courses
  add column if not exists prerequisite_ids uuid[] not null default '{}';

create index if not exists courses_school_idx on public.courses (school, position);
