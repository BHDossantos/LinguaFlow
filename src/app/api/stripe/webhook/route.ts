import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

// Service-role client: subscriptions has no user write policies on purpose —
// Stripe (via this webhook) is the only writer.
function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "missing signature/secret" }, { status: 400 });
  }
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (e: any) {
    return NextResponse.json({ error: `bad signature: ${e?.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (session.mode === "subscription" && userId) {
        await admin().from("subscriptions").upsert({
          user_id: userId,
          status: "active",
          stripe_customer_id: String(session.customer ?? ""),
          stripe_subscription_id: String(session.subscription ?? ""),
          updated_at: new Date().toISOString(),
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      const status =
        event.type === "customer.subscription.deleted" ? "canceled"
        : sub.status === "active" ? "active"
        : sub.status === "trialing" ? "trialing"
        : sub.status === "past_due" ? "past_due"
        : "inactive";
      const periodEnd = (sub as any).current_period_end
        ? new Date((sub as any).current_period_end * 1000).toISOString()
        : null;
      // Which package this is — set in subscription metadata at checkout.
      const validTiers = ["bronze", "silver", "gold", "platinum"];
      const tier = validTiers.includes(sub.metadata?.tier ?? "") ? sub.metadata!.tier : null;
      const db = admin();
      if (userId) {
        await db.from("subscriptions").upsert({
          user_id: userId,
          status,
          tier,
          stripe_customer_id: String(sub.customer ?? ""),
          stripe_subscription_id: sub.id,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        });
      } else {
        // Older subscriptions without metadata: match by subscription id.
        const patch: Record<string, unknown> = { status, current_period_end: periodEnd, updated_at: new Date().toISOString() };
        if (tier) patch.tier = tier;
        await db.from("subscriptions").update(patch).eq("stripe_subscription_id", sub.id);
      }
      break;
    }
    // Tutor-session PaymentIntents are recorded at capture time by
    // /api/tutor-sessions/end; nothing to reconcile here yet.
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
