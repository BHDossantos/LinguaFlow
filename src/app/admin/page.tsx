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

  const Metric = ({ label, value }: { label: string; value: string | number }) => (
    <div className="card py-3 text-center">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-[11px] text-ink-500">{label}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Admin — metrics</h1>
        <p className="text-sm text-ink-500">Live from the database. Last 7 days unless noted.</p>
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

      <p className="text-xs text-ink-500">
        Conversion metrics appear here once Stripe is wired. Activation = users
        with ≥1 completed lesson.
      </p>
    </div>
  );
}
