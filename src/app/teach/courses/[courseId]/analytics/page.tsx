import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CriterionAgg = { total: number; max: number; n: number };

export default async function CourseAnalyticsPage(
  props: {
    params: Promise<{ courseId: string }>;
  }
) {
  const params = await props.params;
  const user = await requireUser();
  const supabase = await supabaseServer();

  const { data: course } = await supabase
    .from("courses").select("id,title,teacher_id").eq("id", params.courseId).single();
  if (!course) notFound();
  if (course.teacher_id !== user.id) redirect("/teach");

  const [{ data: assignments }, { count: rosterCountRaw }] = await Promise.all([
    supabase
      .from("assignments")
      .select(`
        id,title,max_score,
        submissions(
          id,status,student_id,
          ai_grades(score,max_score,criteria),
          teacher_reviews(final_score)
        )
      `)
      .eq("course_id", params.courseId)
      .order("created_at", { ascending: false }),
    supabase
      .from("enrollments")
      .select("user_id", { count: "exact", head: true })
      .eq("course_id", params.courseId),
  ]);

  const rosterCount = rosterCountRaw ?? 0;

  const criterionAgg: Record<string, CriterionAgg> = {};
  const studentsWhoSubmitted = new Set<string>();

  const perAssignment = (assignments ?? []).map((a: any) => {
    const subs: any[] = a.submissions ?? [];
    let scoreSum = 0;
    let scoreN = 0;
    let returned = 0;
    for (const s of subs) {
      studentsWhoSubmitted.add(s.student_id);
      if (s.status === "returned") returned++;
      const final = s.teacher_reviews?.[0]?.final_score;
      const ai = s.ai_grades?.[0]?.score;
      const val = final != null ? final : ai;
      if (val != null) { scoreSum += val; scoreN++; }
      const criteria = s.ai_grades?.[0]?.criteria;
      if (Array.isArray(criteria)) {
        for (const c of criteria) {
          if (!c?.name) continue;
          const agg = (criterionAgg[c.name] ??= { total: 0, max: 0, n: 0 });
          agg.total += Number(c.score) || 0;
          agg.max += Number(c.max) || 0;
          agg.n += 1;
        }
      }
    }
    return {
      id: a.id,
      title: a.title,
      maxScore: a.max_score,
      count: subs.length,
      returned,
      avg: scoreN > 0 ? scoreSum / scoreN : null,
    };
  });

  const weakSpots = Object.entries(criterionAgg)
    .map(([name, agg]) => ({
      name,
      pct: agg.max > 0 ? (agg.total / agg.max) * 100 : null,
      n: agg.n,
    }))
    .filter((c) => c.pct != null)
    .sort((a, b) => (a.pct! - b.pct!));

  return (
    <div className="space-y-5">
      <Link href={`/teach/courses/${course.id}`} className="text-sm text-brand-500">
        ← {course.title}
      </Link>
      <h1 className="text-2xl font-bold">Analytics</h1>

      <section className="grid grid-cols-2 gap-2">
        <div className="card">
          <p className="text-2xl font-bold">{rosterCount}</p>
          <p className="text-xs text-ink-500">students enrolled</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold">{studentsWhoSubmitted.size}</p>
          <p className="text-xs text-ink-500">have submitted work</p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Per assignment
        </h2>
        {perAssignment.length === 0 ? (
          <p className="card text-sm text-ink-500">No assignments yet.</p>
        ) : (
          <ul className="space-y-2">
            {perAssignment.map((a) => (
              <li key={a.id}>
                <Link href={`/teach/assignments/${a.id}`} className="card block">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{a.title}</p>
                    <span className="text-sm font-semibold">
                      {a.avg != null ? `${a.avg.toFixed(1)}/${a.maxScore}` : "—"}
                    </span>
                  </div>
                  <p className="text-xs text-ink-500">
                    {a.count} submitted · {a.returned} returned
                  </p>
                  {a.avg != null && (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                      <div
                        className="h-full bg-brand-500"
                        style={{ width: `${Math.min(100, (a.avg / a.maxScore) * 100)}%` }}
                      />
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Where students struggle (lowest-scoring criteria)
        </h2>
        {weakSpots.length === 0 ? (
          <p className="card text-sm text-ink-500">
            No AI-graded criteria yet — grade some submissions to see patterns.
          </p>
        ) : (
          <ul className="space-y-2">
            {weakSpots.map((c) => (
              <li key={c.name} className="card">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-sm">{c.pct!.toFixed(0)}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                  <div
                    className={`h-full ${c.pct! < 60 ? "bg-red-500" : c.pct! < 80 ? "bg-amber-500" : "bg-green-500"}`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <p className="text-xs text-ink-500">across {c.n} graded submissions</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
