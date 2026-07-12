-- Streak freezes: missing a single day consumes a freeze instead of
-- resetting the streak (locked product problem #8 — motivation loss).
-- Everyone starts with 2; hitting each 7-day milestone earns one back
-- (capped at 5, so they stay precious).

alter table public.user_stats
  add column if not exists streak_freezes int not null default 2;

create or replace function public.award_xp(p_amount int, p_kind text)
returns table (xp bigint, streak_days int) as $$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
  v_stats public.user_stats%rowtype;
  v_streak int;
  v_freezes int;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  insert into public.xp_events (user_id, amount, kind)
    values (v_user, p_amount, p_kind);

  select * into v_stats from public.user_stats s
    where s.user_id = v_user for update;

  if not found then
    insert into public.user_stats (user_id, xp, streak_days, longest_streak, last_activity_date, streak_freezes)
    values (v_user, p_amount, 1, 1, v_today, 2);
  else
    if v_stats.last_activity_date = v_today then
      v_streak := v_stats.streak_days;           -- already active today
      v_freezes := v_stats.streak_freezes;
    elsif v_stats.last_activity_date = v_today - 1 then
      v_streak := v_stats.streak_days + 1;       -- consecutive day
      v_freezes := v_stats.streak_freezes;
    elsif v_stats.last_activity_date = v_today - 2
      and v_stats.streak_freezes > 0 then
      v_streak := v_stats.streak_days + 1;       -- freeze covers the gap day
      v_freezes := v_stats.streak_freezes - 1;
    else
      v_streak := 1;                             -- longer gap: reset
      v_freezes := v_stats.streak_freezes;
    end if;

    -- Weekly milestone: earn a freeze back (only on the day the milestone
    -- is crossed, never for repeat activity on the same day).
    if v_stats.last_activity_date is distinct from v_today
      and v_streak % 7 = 0 then
      v_freezes := least(v_freezes + 1, 5);
    end if;

    update public.user_stats s set
      xp = s.xp + p_amount,
      streak_days = v_streak,
      longest_streak = greatest(s.longest_streak, v_streak),
      last_activity_date = v_today,
      streak_freezes = v_freezes,
      updated_at = now()
    where s.user_id = v_user;
  end if;

  return query
    select s.xp, s.streak_days from public.user_stats s where s.user_id = v_user;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.award_xp(int, text) to authenticated;
