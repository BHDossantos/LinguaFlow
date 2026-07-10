-- Weekly leaderboard. RLS keeps xp_events and user_stats private per-user,
-- so ranking others requires a security-definer aggregate that exposes ONLY
-- what a leaderboard needs: display name, weekly XP, streak. No ids beyond
-- whether a row is "you", no per-event data.
create or replace function public.get_weekly_leaderboard(p_limit int default 20)
returns table (
  rank bigint,
  display_name text,
  weekly_xp bigint,
  streak_days int,
  is_me boolean
) as $$
  select
    row_number() over (order by w.weekly_xp desc, p.display_name) as rank,
    coalesce(p.display_name, 'Learner') as display_name,
    w.weekly_xp,
    coalesce(s.streak_days, 0) as streak_days,
    (w.user_id = auth.uid()) as is_me
  from (
    select user_id, sum(amount)::bigint as weekly_xp
    from public.xp_events
    where created_at >= now() - interval '7 days'
    group by user_id
  ) w
  join public.profiles p on p.id = w.user_id
  left join public.user_stats s on s.user_id = w.user_id
  order by w.weekly_xp desc, p.display_name
  limit least(greatest(p_limit, 1), 100);
$$ language sql security definer set search_path = public;

grant execute on function public.get_weekly_leaderboard(int) to authenticated;
