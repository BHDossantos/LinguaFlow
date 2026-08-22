-- First-class question item bank (spec §8) + backfill from existing quiz
-- lessons. Questions are course content (not user data): any signed-in learner
-- may read them; only the service role / seed writes them. Idempotent.
--
-- The item bank powers delayed RETENTION CHECKS (spec §7/§27): re-surfacing the
-- questions behind a mastered skill 14+ days later to prove it still sticks.

create table if not exists public.questions (
  id bigserial primary key,
  course_id uuid references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  prompt text not null,
  options jsonb not null,          -- array of choice strings
  answer int not null,             -- 0-based index of the correct option
  explanation text,
  bloom text,                      -- optional Bloom level (remember/understand/apply/…)
  distractor_rationale jsonb,      -- optional: why each wrong option is wrong
  created_at timestamptz not null default now(),
  unique (lesson_id, prompt)
);
alter table public.questions enable row level security;
drop policy if exists "read questions" on public.questions;
create policy "read questions" on public.questions
  for select to authenticated using (true);
create index if not exists questions_lesson_idx on public.questions (lesson_id);
create index if not exists questions_course_idx on public.questions (course_id);

-- Backfill the bank from every quiz lesson's embedded questions. Idempotent via
-- the (lesson_id, prompt) unique key, so re-running only adds new items.
insert into public.questions (course_id, lesson_id, prompt, options, answer, explanation)
select
  l.course_id,
  l.id,
  q->>'prompt',
  q->'options',
  (q->>'answer')::int,
  q->>'explanation'
from public.lessons l
cross join lateral jsonb_array_elements(l.body->'questions') as q
where l.kind = 'quiz'
  and jsonb_typeof(l.body->'questions') = 'array'
  and coalesce(q->>'prompt', '') <> ''
  and jsonb_typeof(q->'options') = 'array'
  and (q->>'answer') ~ '^[0-9]+$'
on conflict (lesson_id, prompt) do nothing;
