import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Daily plan" };

// Daily Plan (spec §23): the personalized "what to do next", assembled from the
// adaptive signals we already track — due reviews, skills needing remediation,
// the next lesson in progress, and an applied project.
export default async function PlanPage() {
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();
  const nowIso = new Date().toISOString();

  const [{ count: dueReviews }, { data: lastProgress }] = await Promise.all([
    supabase.from("srs_cards").select("id", { count: "exact", head: true }).eq("user_id", user.id).lte("due_at", nowIso),
    supabase.from("lesson_progress").select("completed_at,lesson:lessons(id,course_id,title)").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  // Skills that need remediation (best-effort; empty pre-migration).
  let remediation: { id: string; title: string }[] = [];
  try {
    const { data: weak } = await supabase
      .from("skill_states").select("skill_id").eq("user_id", user.id).in("status", ["needs_remediation", "decaying"]).limit(5);
    const ids = (weak ?? []).map((w: any) => w.skill_id);
    if (ids.length) {
      const { data: lessons } = await supabase.from("lessons").select("id,title,course_id").in("id", ids);
      remediation = (lessons ?? []).map((l: any) => ({ id: `${l.course_id}/${l.id}`, title: l.title }));
    }
  } catch {}

  // Next lesson to continue (the current course's first incomplete lesson).
  let next: { href: string; title: string; minutes: number } | null = null;
  const lastCourseId = (lastProgress as any)?.lesson?.course_id;
  if (lastCourseId) {
    const [{ data: courseLessons }, { data: done }] = await Promise.all([
      supabase.from("lessons").select("id,title,estimated_minutes").eq("course_id", lastCourseId).order("position"),
      supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).not("completed_at", "is", null),
    ]);
    const doneIds = new Set((done ?? []).map((d: any) => d.lesson_id));
    const nl = (courseLessons ?? []).find((l: any) => !doneIds.has(l.id));
    if (nl) next = { href: `/learn/${lastCourseId}/${nl.id}`, title: nl.title, minutes: nl.estimated_minutes ?? 10 };
  }

  // An applied project the learner hasn't submitted yet.
  let project: { id: string; title: string } | null = null;
  try {
    const [{ data: projects }, { data: subs }] = await Promise.all([
      supabase.from("projects").select("id,title").eq("published", true).limit(20),
      supabase.from("project_submissions").select("project_id").eq("user_id", user.id),
    ]);
    const submitted = new Set((subs ?? []).map((s: any) => s.project_id));
    const p = (projects ?? []).find((pr: any) => !submitted.has(pr.id));
    if (p) project = { id: p.id, title: p.title };
  } catch {}

  const steps: { icon: string; title: string; sub: string; href: string; est: string }[] = [];
  if ((dueReviews ?? 0) > 0) steps.push({ icon: "🔁", title: `Review ${dueReviews} due card${dueReviews === 1 ? "" : "s"}`, sub: "Lock in what you learned before it fades", href: "/review", est: `~${Math.max(2, Math.round((dueReviews ?? 0) * 0.5))} min` });
  if (remediation.length) steps.push({ icon: "🩹", title: `Shore up ${remediation.length} weak skill${remediation.length === 1 ? "" : "s"}`, sub: remediation.slice(0, 3).map((r) => r.title).join(" · "), href: `/learn/${remediation[0].id}`, est: "~10 min" });
  if (next) steps.push({ icon: "▶️", title: `Continue: ${next.title}`, sub: "Your next lesson in progress", href: next.href, est: `~${next.minutes} min` });
  if (project) steps.push({ icon: "🛠️", title: `Apply it: ${project.title}`, sub: "Build something real for your portfolio", href: `/projects/${project.id}`, est: "project" });
  if (steps.length === 0) steps.push({ icon: "🚀", title: "Pick a course to begin", sub: "Your plan fills in as you learn", href: "/learn", est: "" });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Today's plan</h1>
        <p className="text-sm text-ink-500">Do these in order — it's built from what you know, forget, and haven't tried yet.</p>
      </header>

      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li key={i}>
            <Link href={s.href} className="card card-hover flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 dark:bg-white/10">{i + 1}</span>
              <span className="text-xl">{s.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{s.title}</span>
                <span className="block truncate text-xs text-ink-500">{s.sub}</span>
              </span>
              {s.est && <span className="shrink-0 text-xs text-ink-500">{s.est}</span>}
            </Link>
          </li>
        ))}
      </ol>

      <p className="text-center text-xs text-ink-500">
        Consistency beats cramming — ten focused minutes a day compounds.
      </p>
    </div>
  );
}
