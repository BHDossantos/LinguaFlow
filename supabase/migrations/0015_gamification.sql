-- Gamification core: XP, levels (derived from XP), daily streaks, and an
-- event log that doubles as the activity heatmap datasource.

create table public.user_stats (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  xp bigint not null default 0,
  streak_days int not null default 0,
  longest_streak int not null default 0,
  last_activity_date date,
  daily_goal_minutes int not null default 20,
  updated_at timestamptz not null default now()
);

alter table public.user_stats enable row level security;
create policy "own stats" on public.user_stats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.xp_events (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null,
  kind text not null, -- 'lesson_complete' | 'card_review' | 'submission' | 'pronunciation'
  created_at timestamptz not null default now()
);

create index xp_events_user_created_idx on public.xp_events (user_id, created_at desc);

alter table public.xp_events enable row level security;
create policy "own xp events" on public.xp_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Atomic award: bump XP, log the event, and roll the streak.
--   - first activity ever            -> streak 1
--   - already active today           -> streak unchanged
--   - last active yesterday          -> streak + 1
--   - gap of 2+ days                 -> streak resets to 1
create or replace function public.award_xp(p_amount int, p_kind text)
returns table (xp bigint, streak_days int) as $$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  insert into public.xp_events (user_id, amount, kind)
    values (v_user, p_amount, p_kind);

  insert into public.user_stats as s (user_id, xp, streak_days, longest_streak, last_activity_date)
  values (v_user, p_amount, 1, 1, v_today)
  on conflict (user_id) do update set
    xp = s.xp + excluded.xp,
    streak_days = case
      when s.last_activity_date = v_today then s.streak_days
      when s.last_activity_date = v_today - 1 then s.streak_days + 1
      else 1
    end,
    longest_streak = greatest(
      s.longest_streak,
      case
        when s.last_activity_date = v_today then s.streak_days
        when s.last_activity_date = v_today - 1 then s.streak_days + 1
        else 1
      end
    ),
    last_activity_date = v_today,
    updated_at = now();

  return query
    select s.xp, s.streak_days from public.user_stats s where s.user_id = v_user;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.award_xp(int, text) to authenticated;
