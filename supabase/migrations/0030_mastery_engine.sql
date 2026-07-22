-- Mastery engine (Learning-OS phase 1). Turns "finished the lesson" into an
-- evidence-based skill state: introduced -> developing -> proficient -> mastered,
-- or needs_remediation. See docs/LEARNING_OS.md.
--
-- v1 treats each lesson as a skill node (skill_kind='lesson'); when the
-- curriculum gains sub-lesson concepts/skills, the same tables carry them
-- (skill_kind='concept'|'skill') with no schema change.

-- Per-learner, per-skill current state (the "skill-state model", spec §6).
create table if not exists public.skill_states (
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null,
  skill_kind text not null default 'lesson'
    check (skill_kind in ('lesson', 'concept', 'skill')),
  status text not null default 'introduced'
    check (status in (
      'not_introduced','introduced','developing','proficient',
      'mastered','fragile','decaying','needs_remediation')),
  strength real not null default 0,          -- 0..1, EMA of evidence
  attempts int not null default 0,
  best_score real,
  last_score real,
  last_event_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);
alter table public.skill_states enable row level security;
drop policy if exists "own skill_states" on public.skill_states;
create policy "own skill_states" on public.skill_states
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists skill_states_user_status_idx
  on public.skill_states (user_id, status);

-- Append-only evidence log (every graded interaction, spec §6/§24).
create table if not exists public.mastery_events (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null,
  skill_kind text not null default 'lesson',
  event_type text not null,   -- lesson_complete | quiz | review | diagnostic | transfer
  score real,                 -- 0..1
  correct boolean,
  attempts int,
  hints_used int,
  confidence int,             -- 1..5 (optional self-report)
  response_ms int,
  created_at timestamptz not null default now()
);
alter table public.mastery_events enable row level security;
drop policy if exists "own mastery_events" on public.mastery_events;
create policy "own mastery_events" on public.mastery_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists mastery_events_user_skill_idx
  on public.mastery_events (user_id, skill_id, created_at desc);

-- Tracked misconceptions (spec §6 "Record misconceptions", §24).
create table if not exists public.misconceptions (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid,
  tag text not null,          -- e.g. 'algebra.sign_error', 'ser_vs_estar'
  description text,
  status text not null default 'open'
    check (status in ('open','improving','resolved')),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  resolved_at timestamptz
);
alter table public.misconceptions enable row level security;
drop policy if exists "own misconceptions" on public.misconceptions;
create policy "own misconceptions" on public.misconceptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists misconceptions_user_idx
  on public.misconceptions (user_id, status);
