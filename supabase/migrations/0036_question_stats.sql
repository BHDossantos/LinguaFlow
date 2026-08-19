-- Item analysis (spec §8): per-question performance statistics, so weak items
-- can be found and improved. Aggregate counters only (no per-learner PII).
-- Written via a SECURITY DEFINER function (learners can't read/tamper the table);
-- the owner reads aggregates on /admin with the service role.

create table if not exists public.question_stats (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  q_index int not null,
  prompt text,
  exposures int not null default 0,
  correct int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (lesson_id, q_index)
);
alter table public.question_stats enable row level security;
-- No direct user policies: only the function below writes; service role reads.

create or replace function public.bump_question_stat(
  p_lesson uuid, p_index int, p_prompt text, p_correct boolean
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.question_stats (lesson_id, q_index, prompt, exposures, correct, updated_at)
  values (p_lesson, p_index, p_prompt, 1, case when p_correct then 1 else 0 end, now())
  on conflict (lesson_id, q_index) do update
    set exposures = question_stats.exposures + 1,
        correct   = question_stats.correct + (case when p_correct then 1 else 0 end),
        prompt    = coalesce(question_stats.prompt, excluded.prompt),
        updated_at = now();
$$;
revoke all on function public.bump_question_stat(uuid, int, text, boolean) from public;
grant execute on function public.bump_question_stat(uuid, int, text, boolean) to authenticated;
