import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// Creates a Stripe Checkout session for the Premium subscription.
// Self-disables (503 + offline flag) until STRIPE_SECRET_KEY and
// STRIPE_PREMIUM_PRICE_ID are configured.
export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
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
    subscription_data: { metadata: { user_id: user.id } },
    success_url: `${origin}/pricing?upgraded=1`,
    cancel_url: `${origin}/pricing`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
