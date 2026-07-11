-- Product analytics events (page views + funnel beacons). RLS is enabled
-- with NO policies on purpose: only the service-role client (used by
-- /api/track and the admin dashboard) can read or write. Nothing a browser
-- can forge or enumerate.
create table public.analytics_events (
  id bigserial primary key,
  user_id uuid,
  name text not null check (char_length(name) between 1 and 60),
  path text check (char_length(path) <= 300),
  created_at timestamptz not null default now()
);

create index analytics_events_created_idx on public.analytics_events (created_at desc);
create index analytics_events_name_idx on public.analytics_events (name, created_at desc);

alter table public.analytics_events enable row level security;
