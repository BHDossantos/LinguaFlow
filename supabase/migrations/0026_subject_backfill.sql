-- Repair: migration 0003 had already created courses.subject (nullable, no
-- default), so 0024's "add column if not exists" was a no-op and language
-- courses were left with subject NULL. Converge the column to its intended
-- definition regardless of which path a database took.

update public.courses set subject = 'language' where subject is null;

update public.courses set subject = 'language'
  where subject not in ('language','math','technology','business','science');

alter table public.courses alter column subject set default 'language';
alter table public.courses alter column subject set not null;

alter table public.courses drop constraint if exists courses_subject_check;
alter table public.courses
  add constraint courses_subject_check
  check (subject in ('language','math','technology','business','science'));

alter table public.courses
  add column if not exists prerequisite_ids uuid[] not null default '{}';

create index if not exists courses_subject_idx on public.courses (subject, position);
