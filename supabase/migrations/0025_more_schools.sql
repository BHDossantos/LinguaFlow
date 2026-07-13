-- Schools of Business and Science (curriculum blueprint: 10-school vision,
-- grown incrementally). Postgres check constraints can't be altered in
-- place — drop and recreate with the wider set.

alter table public.courses drop constraint if exists courses_subject_check;
alter table public.courses
  add constraint courses_subject_check
  check (subject in ('language','math','technology','business','science'));
