-- Adaptive diagnostic results (spec §1): the saved learner model produced by the
-- onboarding/diagnostic engine — current level, mastered/developing topics,
-- prerequisite gaps, misconceptions, and a recommended starting point.
create table if not exists public.diagnostic_results (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  model jsonb not null default '{}'::jsonb,   -- { level, masteredTopics, developingTopics, gaps, misconceptions, recommendation, estimatedHours }
  created_at timestamptz not null default now()
);
alter table public.diagnostic_results enable row level security;
drop policy if exists "own diagnostic_results" on public.diagnostic_results;
create policy "own diagnostic_results" on public.diagnostic_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists diagnostic_results_user_idx
  on public.diagnostic_results (user_id, created_at desc);
