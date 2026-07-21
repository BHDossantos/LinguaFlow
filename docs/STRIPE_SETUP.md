# Turning on paid plans — Stripe setup (copy-paste)

The pricing page (`/pricing`) already works. Each tier shows **"Coming soon"**
until its Stripe price ID is set, then it becomes a real checkout button —
automatically, no code change. Do this whenever you're ready to charge.

Time: ~15 minutes. Do **Test mode** first, confirm a test purchase, then repeat
the same steps in **Live mode**.

---

## 1. Create the products & prices (one command)

You need a Stripe account and your **Secret key** (Stripe Dashboard →
Developers → API keys → "Secret key", starts with `sk_test_…` in test mode).

From the repo root:

```bash
STRIPE_SECRET_KEY=sk_test_xxx node scripts/stripe/setup-prices.mjs
```

It creates all 8 prices (Bronze/Silver/Gold/Platinum × monthly/annual) and prints
the env vars, e.g.:

```
STRIPE_BRONZE_MONTHLY_PRICE_ID=price_...
STRIPE_BRONZE_ANNUAL_PRICE_ID=price_...
STRIPE_SILVER_MONTHLY_PRICE_ID=price_...
STRIPE_SILVER_ANNUAL_PRICE_ID=price_...
STRIPE_GOLD_MONTHLY_PRICE_ID=price_...
STRIPE_GOLD_ANNUAL_PRICE_ID=price_...
STRIPE_PLATINUM_MONTHLY_PRICE_ID=price_...
STRIPE_PLATINUM_ANNUAL_PRICE_ID=price_...
```

Run it **once** per environment (running again makes duplicate products).

> Prefer the dashboard? Create one Product per tier with two recurring Prices
> (monthly + annual) at the amounts in `docs/PRICING.md`, and copy each price ID
> into the matching env var above.

---

## 2. Set the environment variables in Vercel

Vercel → your project → **Settings → Environment Variables → Production** (and
Preview if you want checkout on previews). Add:

- All 8 `STRIPE_*_PRICE_ID` lines from step 1
- `STRIPE_SECRET_KEY` = the same key you used
- `STRIPE_WEBHOOK_SECRET` = from step 3
- (already set) `NEXT_PUBLIC_SITE_URL=https://learnnoelia.com`

You don't have to set all tiers — any tier whose price IDs are present goes live;
the rest keep showing "Coming soon". (The old `STRIPE_PREMIUM_PRICE_ID`, if set,
still powers Silver-monthly for backward compatibility.)

After saving, **redeploy** so the new env vars take effect.

---

## 3. Point Stripe's webhook at the app

The webhook is what actually flips a user to their plan after payment.

Stripe Dashboard → Developers → **Webhooks → Add endpoint**:

- **Endpoint URL:** `https://learnnoelia.com/api/stripe/webhook`
- **Events to send:** `checkout.session.completed`,
  `customer.subscription.updated`, `customer.subscription.deleted`
- Create it, then copy the **Signing secret** (`whsec_…`) into
  `STRIPE_WEBHOOK_SECRET` in Vercel.

Local testing (optional): `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

---

## 4. Add the tier column in Supabase

Run this once in the Supabase SQL editor (also in
`supabase/migrations/0029_subscription_tier.sql`):

```sql
alter table public.subscriptions
  add column if not exists tier text
    check (tier in ('bronze','silver','gold','platinum'));
```

This lets the app show a signed-in user's current plan and correctly mark lower
tiers as "included in your plan."

---

## 5. Test it

1. Redeploy after setting env vars.
2. On `/pricing`, the tiers you configured now show **"Choose <tier>"**.
3. Click one → Stripe Checkout. Pay with the test card **4242 4242 4242 4242**,
   any future expiry, any CVC/ZIP.
4. You're returned to `/pricing?upgraded=1`; within a few seconds the webhook
   marks you active and the card shows **"Your plan"**.
5. Confirm the row in Supabase `subscriptions` has `status='active'` and the
   right `tier`.

When test mode looks right, repeat steps 1–3 with your **live** secret key and a
live webhook endpoint. That's it — you're charging.

---

## What's already wired (no work needed)

- Checkout session creation — `src/app/api/stripe/checkout/route.ts` (per-tier)
- Fulfillment webhook — `src/app/api/stripe/webhook/route.ts` (writes status + tier)
- Plan gating on the page — `src/lib/pricing.ts` + `/pricing`
- Live tutoring is billed separately at session end (already built).
