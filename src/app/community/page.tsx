import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { LANGUAGES } from "@/lib/languages";

export const dynamic = "force-dynamic";

// Community: one place for everything social — recent course discussions,
// this week's leaderboard, and ways to practice with others.
export default async function CommunityPage() {
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();

  const [{ data: posts }, { data: board }] = await Promise.all([
    supabase
      .from("discussions")
      .select("id,body,created_at,course:courses(id,title,language)")
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .limit(15),
    supabase.rpc("get_weekly_leaderboard").limit(5),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Community</h1>
        <p className="text-sm text-ink-500">
          Learn out loud — questions, rivals, and conversation partners.
        </p>
      </header>

      {/* Do-something-now row */}
      <section className="grid grid-cols-2 gap-2">
        <Link href="/practice" className="card space-y-1 hover:border-brand-500/30">
          <span className="text-xl">💬</span>
          <p className="text-sm font-semibold">Practice speaking</p>
          <p className="text-[11px] text-ink-500">Roleplay real scenarios</p>
        </Link>
        <Link href="/tutors" className="card space-y-1 hover:border-brand-500/30">
          <span className="text-xl">🧑‍🏫</span>
          <p className="text-sm font-semibold">Live instructor</p>
          <p className="text-[11px] text-ink-500">Human help, per minute</p>
        </Link>
      </section>

      {/* Weekly leaderboard preview */}
      <section className="card">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            This week&apos;s leaderboard
          </p>
          <Link href="/leaderboard" className="text-xs text-brand-600">Full board →</Link>
        </div>
        {(board ?? []).length === 0 ? (
          <p className="text-sm text-ink-500">
            Quiet week so far — finish a lesson and claim the top spot.
          </p>
        ) : (
          <ol className="space-y-1.5 text-sm">
            {(board ?? []).map((row: any, i: number) => (
              <li key={row.user_id ?? i} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-5 text-center">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                  </span>
                  <span className={row.user_id === user.id ? "font-semibold text-brand-600" : ""}>
                    {row.display_name ?? "Learner"}
                    {row.user_id === user.id ? " (you)" : ""}
                  </span>
                </span>
                <span className="text-ink-500">{row.xp} XP</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Recent discussions across all courses */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Latest discussions
        </h2>
        {(posts ?? []).length === 0 ? (
          <div className="card text-sm text-ink-500">
            No posts yet. Every course page has a discussion thread — ask your
            first question there and it shows up here.
            <Link href="/learn" className="mt-2 block text-brand-600">Browse courses →</Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {(posts ?? []).map((p: any) => (
              <li key={p.id}>
                <Link href={`/learn/${p.course?.id}#discussion`} className="card block space-y-1 hover:border-brand-500/30">
                  <p className="line-clamp-2 text-sm">{p.body}</p>
                  <p className="text-[11px] text-ink-500">
                    {(LANGUAGES as any)[p.course?.language]?.flag} {p.course?.title} ·{" "}
                    {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
