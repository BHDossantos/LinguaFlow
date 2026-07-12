import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { UpgradeButton } from "./UpgradeButton";

export const metadata = { title: "Pricing" };
export const dynamic = "force-dynamic";

// Pricing: Premium sells itself once Stripe is configured; until then it's
// listed honestly as "coming soon", never sold.
export default async function PricingPage(props: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const { upgraded } = await props.searchParams;
  const checkoutLive = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PREMIUM_PRICE_ID);

  let isPremium = false;
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await supabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();
        isPremium = sub?.status === "active" || sub?.status === "trialing";
      }
    }
  } catch {
    // Signed-out or table not migrated yet — show the default page.
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-6 pt-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="mt-1 text-ink-500">Start free. Upgrade when you&apos;re hooked.</p>
      </header>

      {upgraded && (
        <p className="card border-green-200 bg-green-50 text-center text-sm text-green-700">
          🎉 Welcome to Premium! Your subscription is being activated — it can take a few seconds to show.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card space-y-3 border-brand-500/30">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Free</p>
          <p className="text-3xl font-extrabold">$0</p>
          <ul className="space-y-1.5 text-sm">
            <li>✓ All languages and courses</li>
            <li>✓ Word-by-word pronunciation scoring</li>
            <li>✓ Three-mode practice + spaced repetition</li>
            <li>✓ Streaks, XP, achievements, leaderboard</li>
            <li>✓ Classrooms, assignments & family view</li>
          </ul>
          <Link href="/sign-in" className="btn-primary block w-full text-center">
            Start learning free
          </Link>
        </div>

        <div className={`card space-y-3 ${checkoutLive || isPremium ? "" : "opacity-80"}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-ink-500">
            Premium
            {!checkoutLive && !isPremium && (
              <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">coming soon</span>
            )}
          </p>
          <p className="text-3xl font-extrabold">
            {checkoutLive || isPremium ? <>$9.99<span className="text-sm font-medium text-ink-500">/mo</span></> : "—"}
          </p>
          <ul className="space-y-1.5 text-sm text-ink-500">
            <li>Unlimited coach conversations</li>
            <li>Voice roleplay scenarios</li>
            <li>Live instructor minutes</li>
            <li>Certificates</li>
          </ul>
          {isPremium ? (
            <span className="btn-ghost block w-full cursor-default text-center">✓ You&apos;re Premium</span>
          ) : checkoutLive ? (
            <UpgradeButton />
          ) : (
            <span className="btn-ghost block w-full cursor-default text-center">Not available yet</span>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-ink-500">
        Schools and classrooms are free during beta — <Link href="/school" className="underline">create your organization</Link>.
      </p>
    </div>
  );
}
