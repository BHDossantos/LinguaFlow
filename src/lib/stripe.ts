import Stripe from "stripe";

// Lazy singleton — constructing Stripe with an empty key throws, which would
// break `next build` page-data collection where env vars aren't present.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  // apiVersion intentionally omitted — the SDK pins its own supported version.
  _stripe = new Stripe(key);
  return _stripe;
}
