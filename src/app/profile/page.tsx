import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { levelProgress } from "@/lib/gamification";
import { computeAchievements } from "@/lib/achievements";
import { LANGUAGES } from "@/lib/languages";

export const dynamic = "force-dynamic";

// Personal dashboard: level, streak, activity heatmap, strengths and weak
// words — the "this is me" screen.
export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await supabaseServer();

  const since12w = new Date(Date.now() - 84 * 86_400_000).toISOString();

  const [
    { data: profile },
    { data: stats },
    { data: targets },
    { count: wordsLearned },
    { count: lessonsDone },
    { data: xpEvents },
    { data: weakCards },
    { count: reviewCount },
    { count: perfectPron },
  ] = await Promise.all([
    supabase.from("profiles").select("display_name,cefr_level").eq("id", user.id).single(),
    supabase.from("user_stats").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("target_languages").select("language,dialect,cefr_level").eq("user_id", user.id),
    supabase.from("srs_cards").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("lesson_progress").select("lesson_id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("xp_events").select("amount,created_at").eq("user_id", user.id).gte("created_at", since12w),
    supabase
      .from("srs_cards")
      .select("ease,repetitions,vocab:vocab_items(term,translation)")
      .eq("user_id", user.id)
      .gt("repetitions", 0)
      .order("ease", { ascending: true })
      .limit(5),
    supabase
      .from("xp_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", "card_review"),
    supabase
      .from("pronunciation_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("score", 100),
  ]);

  const xp = Number(stats?.xp ?? 0);
  const lp = levelProgress(xp);
  const streak = stats?.streak_days ?? 0;
  const longest = stats?.longest_streak ?? 0;

  const achievements = computeAchievements({
    xp,
    longestStreak: longest,
    lessonsDone: lessonsDone ?? 0,
    wordsLearning: wordsLearned ?? 0,
    reviewCount: reviewCount ?? 0,
    perfectPronunciations: perfectPron ?? 0,
  });
  const earnedCount = achievements.filter((a) => a.earned).length;

  // Build a 12-week activity heatmap (weeks × 7 days) from XP events.
  const byDay = new Map<string, number>();
  for (const e of xpEvents ?? []) {
    const d = new Date(e.created_at).toISOString().slice(0, 10);
    byDay.set(d, (byDay.get(d) ?? 0) + e.amount);
  }
  const today = new Date();
  const cells: { date: string; amount: number }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    cells.push({ date: d, amount: byDay.get(d) ?? 0 });
  }
  const heat = (n: number) =>
    n === 0 ? "bg-black/5 dark:bg-white/10"
    : n < 10 ? "bg-brand-100"
    : n < 30 ? "bg-brand-500/60"
    : "bg-brand-600";

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile?.display_name ?? "Learner"}</h1>
          <p className="text-sm text-ink-500">
            {(targets ?? [])
              .map((t) => `${(LANGUAGES as any)[t.language]?.flag ?? ""} ${t.cefr_level ?? ""}`)
              .join(" · ") || "No languages yet"}
          </p>
        </div>
        <Link href="/settings" className="btn-ghost text-sm" aria-label="Settings">⚙️ Settings</Link>
      </header>

      {/* Level card */}
      <section className="card space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-lg font-bold">Level {lp.level}</p>
          <p className="text-sm text-ink-500">{xp.toLocaleString()} XP</p>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-700"
            style={{ width: `${lp.pct}%` }}
          />
        </div>
        <p className="text-xs text-ink-500">
          {lp.into.toLocaleString()} / {lp.needed.toLocaleString()} XP to level {lp.level + 1}
        </p>
      </section>

      {/* Streak + counts */}
      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="card py-3">
          <p className="text-2xl font-extrabold">🔥 {streak}</p>
          <p className="text-[11px] text-ink-500">day streak (best {longest})</p>
        </div>
        <div className="card py-3">
          <p className="text-2xl font-extrabold">{wordsLearned ?? 0}</p>
          <p className="text-[11px] text-ink-500">words learning</p>
        </div>
        <div className="card py-3">
          <p className="text-2xl font-extrabold">{lessonsDone ?? 0}</p>
          <p className="text-[11px] text-ink-500">lessons done</p>
        </div>
      </section>

      {/* Heatmap */}
      <section className="card">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
          Last 12 weeks
        </p>
        <div className="grid grid-flow-col grid-rows-7 gap-1" data-testid="heatmap">
          {cells.map((c) => (
            <span
              key={c.date}
              title={`${c.date}: ${c.amount} XP`}
              className={`h-3 w-3 rounded-[3px] ${heat(c.amount)}`}
            />
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="card">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            Achievements
          </p>
          <p className="text-xs text-ink-500">{earnedCount} / {achievements.length}</p>
        </div>
        <div className="grid grid-cols-5 gap-2" data-testid="achievements">
          {achievements.map((a) => (
            <div
              key={a.key}
              title={`${a.title} — ${a.description}`}
              className={
                "flex flex-col items-center gap-0.5 rounded-xl p-2 text-center " +
                (a.earned
                  ? "bg-amber-50 dark:bg-amber-500/15"
                  : "opacity-35 grayscale")
              }
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-[9px] font-medium leading-tight">{a.title}</span>
            </div>
          ))}
        </div>
      </section>

      <Link href="/leaderboard" className="card flex items-center justify-between hover:border-brand-500/30">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-xl dark:bg-amber-500/20">🏆</span>
          <div>
            <p className="font-semibold">Weekly leaderboard</p>
            <p className="text-xs text-ink-500">See where you rank this week</p>
          </div>
        </div>
        <span className="text-ink-500">›</span>
      </Link>

      {/* Weak words */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Focus words
        </h2>
        {(weakCards ?? []).length === 0 ? (
          <p className="card text-sm text-ink-500">
            Nothing yet — complete a lesson and your tricky words will show here.
          </p>
        ) : (
          <ul className="space-y-1">
            {(weakCards ?? []).map((c: any, i) => (
              <li key={i} className="card flex items-center justify-between py-2.5">
                <span className="font-medium">{c.vocab?.term}</span>
                <span className="text-sm text-ink-500">{c.vocab?.translation}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/review" className="btn-primary block w-full text-center">
          Review now
        </Link>
      </section>
    </div>
  );
}
