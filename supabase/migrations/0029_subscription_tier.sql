-- Add a plan tier to subscriptions so the app knows which package a user has
-- (bronze/silver/gold/platinum). Written only by the Stripe webhook, like the
-- rest of this table. Nullable + no default so existing rows are unaffected;
-- a legacy active subscription with no tier is treated as "silver" in the app.

alter table public.subscriptions
  add column if not exists tier text
    check (tier in ('bronze','silver','gold','platinum'));
