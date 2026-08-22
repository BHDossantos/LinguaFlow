import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Owner metrics dashboard. Gated by ADMIN_EMAILS (comma-separated env);
// everyone else gets a 404 so the route's existence isn't advertised.
// Queries run with the service role — these are cross-user aggregates that
// RLS rightly forbids for normal users.
export default async function AdminPage() {
  const user = await requireUser();
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!admins.includes((user.email ?? "").toLowerCase())) notFound();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) notFound();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const now = Date.now();
  const d7 = new Date(now - 7 * 86_400_000).toISOString();
  const d1 = new Date(now - 86_400_000).toISOString();

  const [
    { count: totalUsers },
    { count: newUsers7d },
    { data: activatedRows },
    { data: dauRows },
    { data: wauRows },
    { count: lessons7d },
    { count: reviews7d },
    { count: pron7d },
    { data: streaks },
    { count: pageViews7d },
    { data: topCourses },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", d7),
    admin.from("lesson_progress").select("user_id").not("completed_at", "is", null),
    admin.from("xp_events").select("user_id").gte("created_at", d1),
    admin.from("xp_events").select("user_id").gte("created_at", d7),
    admin.from("lesson_progress").select("lesson_id", { count: "exact", head: true }).gte("completed_at", d7),
    admin.from("xp_events").select("id", { count: "exact", head: true }).eq("kind", "card_review").gte("created_at", d7),
    admin.from("pronunciation_attempts").select("id", { count: "exact", head: true }).gte("created_at", d7),
    admin.from("user_stats").select("streak_days").gt("streak_days", 0),
    admin.from("analytics_events").select("id", { count: "exact", head: true }).eq("name", "page_view").gte("created_at", d7),
    admin
      .from("enrollments")
      .select("course_id, course:courses(title)")
      .limit(1000),
  ]);

  const activated = new Set((activatedRows ?? []).map((r) => r.user_id)).size;
  const dau = new Set((dauRows ?? []).map((r) => r.user_id)).size;
  const wau = new Set((wauRows ?? []).map((r) => r.user_id)).size;
  const activationRate = totalUsers ? Math.round((activated / totalUsers) * 100) : 0;
  const streakers = (streaks ?? []).length;
  const avgStreak = streakers
    ? Math.round((streaks ?? []).reduce((a, s) => a + s.streak_days, 0) / streakers)
    : 0;

  const courseCounts = new Map<string, { title: string; n: number }>();
  for (const e of topCourses ?? []) {
    const key = e.course_id;
    const cur = courseCounts.get(key) ?? { title: (e as any).course?.title ?? key, n: 0 };
    cur.n++;
    courseCounts.set(key, cur);
  }
  const top = [...courseCounts.values()].sort((a, b) => b.n - a.n).slice(0, 5);

  // North-star: verified skills mastered per active learner (spec §27). Proxy
  // until delayed-retention checks accumulate. Best-effort — hidden pre-migration.
  const d30 = new Date(now - 30 * 86_400_000).toISOString();
  let outcomes: {
    masteredTotal: number; learnersWithMastery: number; events30d: number; openMisc: number; perLearner: number;
    retainedTotal: number; learnersRetained: number; perLearnerRetained: number;
  } | null = null;
  try {
    const [{ data: mastered }, { count: events30d }, { count: openMisc }, { data: retainedEv }] = await Promise.all([
      admin.from("skill_states").select("user_id,skill_id").eq("status", "mastered"),
      admin.from("mastery_events").select("id", { count: "exact", head: true }).gte("created_at", d30),
      admin.from("misconceptions").select("id", { count: "exact", head: true }).eq("status", "open"),
      // Passing delayed retention checks — a skill that survived a 14-day gap.
      admin.from("mastery_events").select("user_id,skill_id").eq("event_type", "retention").gte("score", 0.8),
    ]);
    const masteredTotal = (mastered ?? []).length;
    const learnersWithMastery = new Set((mastered ?? []).map((m: any) => m.user_id)).size;

    // True north-star: mastered AND retained. A skill counts only if it is
    // currently mastered and has passed a delayed retention check.
    const masteredPairs = new Set((mastered ?? []).map((m: any) => `${m.user_id}:${m.skill_id}`));
    const retainedPairs = new Set<string>();
    for (const r of retainedEv ?? []) {
      const key = `${r.user_id}:${r.skill_id}`;
      if (masteredPairs.has(key)) retainedPairs.add(key);
    }
    const retainedTotal = retainedPairs.size;
    const learnersRetained = new Set([...retainedPairs].map((k) => k.split(":")[0])).size;

    outcomes = {
      masteredTotal,
      learnersWithMastery,
      events30d: events30d ?? 0,
      openMisc: openMisc ?? 0,
      perLearner: learnersWithMastery ? Math.round((masteredTotal / learnersWithMastery) * 10) / 10 : 0,
      retainedTotal,
      learnersRetained,
      perLearnerRetained: learnersRetained ? Math.round((retainedTotal / learnersRetained) * 10) / 10 : 0,
    };
  } catch {
    // mastery tables not migrated yet.
  }

  // Item analysis: the questions learners get wrong most (min exposures).
  let hardestQuestions: { prompt: string; rate: number; exposures: number }[] = [];
  try {
    const { data: qs } = await admin
      .from("question_stats").select("prompt,exposures,correct").gte("exposures", 5);
    hardestQuestions = (qs ?? [])
      .map((r: any) => ({ prompt: r.prompt ?? "(question)", exposures: r.exposures, rate: Math.round((r.correct / Math.max(1, r.exposures)) * 100) }))
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 8);
  } catch {
    // question_stats not migrated yet.
  }

  const Metric = ({ label, value }: { label: string; value: string | number }) => (
    <div className="card py-3 text-center">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-[11px] text-ink-500">{label}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin — metrics</h1>
          <p className="text-sm text-ink-500">Live from the database. Last 7 days unless noted.</p>
        </div>
        <Link href="/admin/experiments" className="shrink-0 text-sm text-brand-500 hover:underline">
          Experiments →
        </Link>
      </header>

      <section className="grid grid-cols-3 gap-2">
        <Metric label="total users" value={totalUsers ?? 0} />
        <Metric label="new users (7d)" value={newUsers7d ?? 0} />
        <Metric label="activation %" value={`${activationRate}%`} />
        <Metric label="DAU" value={dau} />
        <Metric label="WAU" value={wau} />
        <Metric label="page views (7d)" value={pageViews7d ?? 0} />
        <Metric label="lessons done (7d)" value={lessons7d ?? 0} />
        <Metric label="reviews (7d)" value={reviews7d ?? 0} />
        <Metric label="pronunciations (7d)" value={pron7d ?? 0} />
      </section>

      <section className="grid grid-cols-2 gap-2">
        <Metric label="active streaks" value={streakers} />
        <Metric label="avg streak length" value={`${avgStreak}d`} />
      </section>

      {outcomes && (
        <section className="space-y-2">
          <div className="card border-brand-500/20 bg-gradient-to-br from-brand-50 to-white text-center dark:from-white/[0.06] dark:to-transparent">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-500">
              North star · skills mastered <em>and retained</em> per learner
            </p>
            <p className="mt-1 text-4xl font-extrabold text-brand-600">{outcomes.perLearnerRetained}</p>
            <p className="text-xs text-ink-500">
              Retained = survived a delayed check ≥14 days after mastery. The real number — not minutes watched.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="skills retained" value={outcomes.retainedTotal} />
            <Metric label="mastered / learner" value={outcomes.perLearner} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="skills mastered" value={outcomes.masteredTotal} />
            <Metric label="mastery events (30d)" value={outcomes.events30d} />
            <Metric label="open misconceptions" value={outcomes.openMisc} />
          </div>
        </section>
      )}

      <section className="card">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
          Top courses by enrollment
        </p>
        {top.length === 0 ? (
          <p className="text-sm text-ink-500">No enrollments yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {top.map((c, i) => (
              <li key={i} className="flex justify-between">
                <span>{c.title}</span>
                <span className="font-semibold">{c.n}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {hardestQuestions.length > 0 && (
        <section className="card">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
            Hardest questions (item analysis)
          </p>
          <ul className="space-y-1.5 text-sm">
            {hardestQuestions.map((q, i) => (
              <li key={i} className="flex items-start justify-between gap-3">
                <span className="min-w-0 flex-1 truncate">{q.prompt}</span>
                <span className={`shrink-0 font-semibold ${q.rate < 50 ? "text-red-600" : "text-amber-600"}`}>
                  {q.rate}% <span className="font-normal text-ink-500">({q.exposures})</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-ink-500">Low correct-rate items are candidates to rewrite or re-teach.</p>
        </section>
      )}

      <p className="text-xs text-ink-500">
        Conversion metrics appear here once Stripe is wired. Activation = users
        with ≥1 completed lesson.
      </p>
    </div>
  );
}
