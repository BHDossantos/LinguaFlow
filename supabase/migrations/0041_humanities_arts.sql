-- Add 'humanities' and 'arts' to the course taxonomy so culture, history,
-- literature, classical languages, philosophy, religion, and the visual/
-- performing arts have a proper home (previously forced under 'science').
-- Idempotent.

alter table public.courses drop constraint if exists courses_school_check;
alter table public.courses add constraint courses_school_check
  check (school in ('language', 'math', 'technology', 'business', 'science', 'humanities', 'arts'));

alter table public.projects drop constraint if exists projects_school_check;
alter table public.projects add constraint projects_school_check
  check (school in ('language', 'math', 'technology', 'business', 'science', 'humanities', 'arts'));
