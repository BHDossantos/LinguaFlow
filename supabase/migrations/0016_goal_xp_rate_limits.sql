-- 1) Daily goal becomes XP-based. We actually measure XP (xp_events); we
-- never measured minutes, so the minutes goal was decorative. Keep the old
-- column for back-compat but stop using it.
alter table public.user_stats
  add column if not exists daily_goal_xp int not null default 50;

-- 2) Fixed-window rate limiting, DB-backed so it works across serverless
-- instances. take_rate_limit returns true if the call is allowed and
-- consumes one unit; false if the window is exhausted.
create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count int not null default 0
);

-- No RLS policies on purpose: only reachable via the security-definer
-- function below (direct table access stays locked).
alter table public.rate_limits enable row level security;

create or replace function public.take_rate_limit(
  p_key text,
  p_max int,
  p_window_seconds int
) returns boolean as $$
declare
  v_now timestamptz := now();
  v_allowed boolean;
begin
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, v_now, 1)
  on conflict (key) do update set
    count = case
      when r.window_start < v_now - make_interval(secs => p_window_seconds) then 1
      else r.count + 1
    end,
    window_start = case
      when r.window_start < v_now - make_interval(secs => p_window_seconds) then v_now
      else r.window_start
    end
  returning count <= p_max into v_allowed;

  return v_allowed;
end;
$$ language plpgsql security definer set search_path = public;

-- Anonymous callers need it too (magic-link requests happen pre-auth).
grant execute on function public.take_rate_limit(text, int, int) to anon, authenticated, service_role;
