// One-time setup: creates the Stripe Products + recurring Prices for every
// Noelia tier and interval, then prints the env vars to paste into Vercel.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe/setup-prices.mjs
//
// Run it ONCE per environment (test, then live). Re-running creates duplicate
// products — if you need to redo it, archive the old ones in the dashboard first.
// Amounts mirror src/lib/pricing.ts (keep them in sync).

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY first, e.g.\n  STRIPE_SECRET_KEY=sk_test_... node scripts/stripe/setup-prices.mjs");
  process.exit(1);
}
const stripe = new Stripe(key);

// unit_amount is in cents.
const TIERS = [
  { id: "bronze",   name: "Noelia Bronze — Self-Study",  monthly:  899, annual:  7900 },
  { id: "silver",   name: "Noelia Silver — Coached",     monthly: 1699, annual: 14900 },
  { id: "gold",     name: "Noelia Gold — Accelerate",    monthly: 3499, annual: 29900 },
  { id: "platinum", name: "Noelia Platinum — Mastery",   monthly: 7999, annual: 69900 },
];

const envLines = [];
for (const t of TIERS) {
  const product = await stripe.products.create({
    name: t.name,
    metadata: { tier: t.id },
  });
  console.error(`✓ product ${t.id}: ${product.id}`);
  for (const { interval, amount, tag } of [
    { interval: "month", amount: t.monthly, tag: "MONTHLY" },
    { interval: "year", amount: t.annual, tag: "ANNUAL" },
  ]) {
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency: "usd",
      recurring: { interval },
      metadata: { tier: t.id },
    });
    console.error(`  ✓ ${tag}: ${price.id}`);
    envLines.push(`STRIPE_${t.id.toUpperCase()}_${tag}_PRICE_ID=${price.id}`);
  }
}

console.log("\n# ── Paste these into Vercel → Settings → Environment Variables (Production) ──");
console.log(envLines.join("\n"));
console.log("\n# Also make sure these are set:");
console.log("# STRIPE_SECRET_KEY=<same key you ran this with>");
console.log("# STRIPE_WEBHOOK_SECRET=<from the webhook step — see docs/STRIPE_SETUP.md>");
