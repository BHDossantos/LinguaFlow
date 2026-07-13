-- Multi-subject platform (curriculum blueprint §4/§20): courses belong to a
-- school/subject, not only to a language. Language stays required as the
-- language of instruction; for language courses it is also what's taught.
-- Prerequisites (blueprint §2.9) start as ordered recommendations.

alter table public.courses
  add column if not exists subject text not null default 'language'
    check (subject in ('language','math','technology')),
  add column if not exists prerequisite_ids uuid[] not null default '{}';

create index if not exists courses_subject_idx on public.courses (subject, position);
