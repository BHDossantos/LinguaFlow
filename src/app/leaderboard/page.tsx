import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  await requireUser();
  const supabase = await supabaseServer();
  const { data: rows } = await supabase.rpc("get_weekly_leaderboard", { p_limit: 20 });

  return (
    <div className="space-y-4">
      <header>
        <Link href="/profile" className="text-sm text-brand-500">← Profile</Link>
        <h1 className="mt-1 text-2xl font-bold">This week's leaderboard</h1>
        <p className="text-sm text-ink-500">XP earned in the last 7 days.</p>
      </header>

      {(rows ?? []).length === 0 ? (
        <p className="card text-sm text-ink-500">
          Nobody has earned XP this week yet — be the first!
        </p>
      ) : (
        <ol className="space-y-2" data-testid="leaderboard">
          {(rows ?? []).map((r: any) => (
            <li
              key={r.rank}
              className={
                "card flex items-center justify-between py-3 " +
                (r.is_me ? "border-brand-500/40 bg-brand-50 dark:bg-white/[0.08]" : "")
              }
            >
              <div className="flex items-center gap-3">
                <span className="w-8 text-center text-lg font-bold">
                  {MEDALS[r.rank - 1] ?? r.rank}
                </span>
                <div>
                  <p className="font-medium">
                    {r.display_name}
                    {r.is_me && <span className="ml-2 text-xs font-semibold text-brand-600">you</span>}
                  </p>
                  <p className="text-xs text-ink-500">🔥 {r.streak_days} day streak</p>
                </div>
              </div>
              <span className="font-bold">{Number(r.weekly_xp).toLocaleString()} XP</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
