-- Premium subscriptions, fulfilled exclusively by the Stripe webhook using
-- the service role. Deliberately NOT a profiles column: profiles are
-- user-updatable under RLS, and plan status must never be.

create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'inactive'
    check (status in ('active','trialing','past_due','canceled','inactive')),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Users may see their own subscription; nobody but the service role writes.
create policy "read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

create index if not exists subscriptions_stripe_sub_idx
  on public.subscriptions (stripe_subscription_id);
