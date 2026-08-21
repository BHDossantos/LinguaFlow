-- Lightweight experimentation / A-B framework (spec §28). Measures which
-- product changes actually move the north-star (skills mastered per learner),
-- with no external service. See docs/EXPERIMENTS.md.
--
-- An experiment names a set of variants; each learner is assigned one
-- deterministically (stable across sessions) and that assignment is recorded as
-- an exposure. Outcomes are read by joining exposures to the mastery tables.

-- Experiment registry (config). Readable by any signed-in user because variant
-- assignment happens in their request; only the service role writes rows.
create table if not exists public.experiments (
  key text primary key,                    -- stable slug, e.g. 'lesson_nudge'
  name text not null,
  description text,
  variants text[] not null default '{control,treatment}',
  weights int[],                           -- optional; same length as variants, else equal split
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.experiments enable row level security;
drop policy if exists "read experiments" on public.experiments;
create policy "read experiments" on public.experiments
  for select to authenticated using (true);

-- One row per (learner, experiment): which variant they were assigned, when
-- first seen. The primary key makes assignment idempotent and stable.
create table if not exists public.experiment_exposures (
  user_id uuid not null references public.profiles(id) on delete cascade,
  experiment_key text not null,
  variant text not null,
  first_seen_at timestamptz not null default now(),
  primary key (user_id, experiment_key)
);
alter table public.experiment_exposures enable row level security;
drop policy if exists "own exposures read" on public.experiment_exposures;
create policy "own exposures read" on public.experiment_exposures
  for select using (auth.uid() = user_id);
drop policy if exists "own exposures insert" on public.experiment_exposures;
create policy "own exposures insert" on public.experiment_exposures
  for insert with check (auth.uid() = user_id);
create index if not exists experiment_exposures_key_variant_idx
  on public.experiment_exposures (experiment_key, variant);

-- Seed the first live experiment: does a short motivational nudge at the top of
-- a lesson increase how much learners actually complete and master?
insert into public.experiments (key, name, description, variants)
values (
  'lesson_nudge',
  'Lesson motivational nudge',
  'Show a brief encouragement banner at the top of each lesson (treatment) vs. nothing (control). Outcome: skills mastered per learner.',
  '{control,treatment}'
)
on conflict (key) do nothing;
