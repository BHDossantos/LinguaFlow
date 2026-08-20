-- Add the 'code' lesson kind (spec §12): an author-authored coding exercise
-- with a starter template and hidden tests, graded in-browser. Idempotent.
alter table public.lessons drop constraint if exists lessons_kind_check;
alter table public.lessons add constraint lessons_kind_check
  check (kind in ('vocab','grammar','listening','reading','speaking','roleplay','writing','quiz','code'));
