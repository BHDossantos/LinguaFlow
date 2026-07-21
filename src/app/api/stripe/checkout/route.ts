import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { resolvePriceId, type Currency, type Interval, type TierId } from "@/lib/pricing";

export const runtime = "nodejs";

const VALID_TIERS: TierId[] = ["bronze", "silver", "gold", "platinum"];
const VALID_INTERVALS: Interval[] = ["monthly", "annual"];
const VALID_CURRENCIES: Currency[] = ["usd", "eur"];

// Creates a Stripe Checkout session for a subscription tier.
// Body: { tier?: "bronze"|"silver"|"gold"|"platinum", interval?: "monthly"|"annual" }
// Defaults to silver/monthly (back-compat with the old single-price button).
// Self-disables (503 + offline flag) until STRIPE_SECRET_KEY and the matching
// per-tier price ID are configured.
export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const tier = (VALID_TIERS.includes(body.tier as TierId) ? body.tier : "silver") as TierId;
  const interval = (VALID_INTERVALS.includes(body.interval as Interval)
    ? body.interval
    : "monthly") as Interval;
  const currency = (VALID_CURRENCIES.includes(body.currency as Currency)
    ? body.currency
    : "usd") as Currency;

  const priceId = resolvePriceId(tier, interval, currency);
  if (!process.env.STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.json({ offline: true }, { status: 503 });
  }

  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    subscription_data: { metadata: { user_id: user.id, tier } },
    success_url: `${origin}/pricing?upgraded=1&tier=${tier}`,
    cancel_url: `${origin}/pricing`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
