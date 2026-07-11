import Link from "next/link";

export const metadata = { title: "Pricing" };

// Honest pricing for the beta: everything free while we grow. The premium
// tier ships when payments are wired (Stripe) — listed as "coming soon",
// not sold.
export default function PricingPage() {
  return (
    <div className="space-y-6 pb-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="mt-1 text-ink-500">Start free. Stay free while we're in beta.</p>
      </header>

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

        <div className="card space-y-3 opacity-80">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-500">
            Premium <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">coming soon</span>
          </p>
          <p className="text-3xl font-extrabold">—</p>
          <ul className="space-y-1.5 text-sm text-ink-500">
            <li>Unlimited coach conversations</li>
            <li>Voice roleplay scenarios</li>
            <li>Live instructor minutes</li>
            <li>Certificates</li>
          </ul>
          <span className="btn-ghost block w-full cursor-default text-center">Not available yet</span>
        </div>
      </div>

      <p className="text-center text-xs text-ink-500">
        Schools and classrooms are free during beta — <Link href="/school" className="underline">create your organization</Link>.
      </p>
    </div>
  );
}
