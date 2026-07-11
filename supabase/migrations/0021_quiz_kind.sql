-- Add the 'quiz' lesson kind (multiple-choice checks between lessons —
-- the "Quick Quiz" step of the bite-sized course structure).
alter table public.lessons drop constraint if exists lessons_kind_check;
alter table public.lessons add constraint lessons_kind_check
  check (kind in ('vocab','grammar','listening','reading','speaking','roleplay','writing','quiz'));
