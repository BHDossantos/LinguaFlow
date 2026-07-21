"use client";
import { useState } from "react";
import Link from "next/link";
import { TIERS, type Interval, type TierId } from "@/lib/pricing";

export function PricingTiers({
  live,
  currentTier,
  signedIn,
}: {
  live: Record<TierId, { monthly: boolean; annual: boolean }>;
  currentTier: TierId | null;
  signedIn: boolean;
}) {
  const [interval, setInterval] = useState<Interval>("annual");
  const [busy, setBusy] = useState<TierId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(tier: TierId) {
    if (!signedIn) {
      window.location.href = "/sign-in?redirectTo=/pricing";
      return;
    }
    setBusy(tier);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier, interval }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = "/sign-in?redirectTo=/pricing";
        return;
      }
      if (!res.ok || !data.url) {
        setError(data.offline ? "Checkout isn't live yet — try again soon." : "Could not start checkout — try again.");
        return;
      }
      window.location.href = data.url;
    } finally {
      setBusy(null);
    }
  }

  const rank: TierId[] = ["bronze", "silver", "gold", "platinum"];

  return (
    <div className="space-y-6">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setInterval("monthly")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            interval === "monthly" ? "bg-brand-500 text-white" : "text-ink-500 hover:bg-black/5"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval("annual")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition ${
            interval === "annual" ? "bg-brand-500 text-white" : "text-ink-500 hover:bg-black/5"
          }`}
        >
          Annual
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            interval === "annual" ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
          }`}>
            2 months free
          </span>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {TIERS.map((t) => {
          const price = interval === "monthly" ? t.monthly : t.annual;
          const isLive = live[t.id][interval];
          const isCurrent = currentTier === t.id;
          const owned = currentTier ? rank.indexOf(t.id) <= rank.indexOf(currentTier) : false;
          return (
            <div
              key={t.id}
              className={`card flex flex-col ${
                t.highlighted ? "border-brand-500/50 shadow-lg ring-1 ring-brand-500/20" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-600">{t.name}</p>
                {t.badge && (
                  <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {t.badge}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-ink-500">{t.tagline}</p>
              <p className="mt-3">
                <span className="text-3xl font-extrabold">${price}</span>
                <span className="text-sm font-medium text-ink-500">
                  {interval === "monthly" ? "/mo" : "/yr"}
                </span>
              </p>
              {interval === "annual" && (
                <p className="text-[11px] text-green-600">
                  ${(t.monthly * 12 - t.annual).toFixed(0)} saved vs monthly
                </p>
              )}

              {t.inheritsFrom && (
                <p className="mt-3 text-xs font-semibold text-ink-500">
                  Everything in {t.inheritsFrom}, plus:
                </p>
              )}
              <ul className="mt-2 flex-1 space-y-1.5 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-1.5">
                    <span className="text-brand-500">✓</span>
                    <span className="text-ink-700 dark:text-white/80">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                {isCurrent ? (
                  <span className="btn-ghost block w-full cursor-default text-center text-sm">
                    ✓ Your plan
                  </span>
                ) : owned ? (
                  <span className="block w-full cursor-default text-center text-xs text-ink-500">
                    Included in your plan
                  </span>
                ) : isLive ? (
                  <button
                    onClick={() => subscribe(t.id)}
                    disabled={busy === t.id}
                    className={`block w-full text-center text-sm ${t.highlighted ? "btn-gradient" : "btn-primary"}`}
                  >
                    {busy === t.id ? "Opening checkout…" : `Choose ${t.name}`}
                  </button>
                ) : (
                  <span className="btn-ghost block w-full cursor-default text-center text-sm opacity-80">
                    Coming soon
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-center text-xs text-red-600">{error}</p>}
      <p className="text-center text-xs text-ink-500">
        7-day free trial on Silver and up · Students save 30% · Cancel anytime.
        {" "}
        <Link href="/sign-in" className="underline">Start free</Link> with the Explorer plan.
      </p>
    </div>
  );
}
