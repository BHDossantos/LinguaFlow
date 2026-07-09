import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TeachHome() {
  const user = await requireUser();
  const supabase = await supabaseServer();

  const { data: courses } = await supabase
    .from("courses")
    .select("id,title,subject,kind,language,cefr_level")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  const { data: needsReview } = await supabase
    .from("submissions")
    .select("id,submitted_at,assignment:assignments!inner(title,teacher_id)")
    .eq("assignment.teacher_id", user.id)
    .eq("status", "graded")
    .order("submitted_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teach</h1>
        <Link href="/teach/courses/new" className="btn-primary text-sm">+ Course</Link>
      </header>

      {needsReview && needsReview.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Needs your review ({needsReview.length})
          </h2>
          <ul className="space-y-2">
            {needsReview.map((s: any) => (
              <li key={s.id}>
                <Link href={`/teach/submissions/${s.id}`} className="card flex items-center justify-between">
                  <span className="text-sm">{s.assignment.title}</span>
                  <span className="text-xs text-ink-500">System graded</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Your courses
        </h2>
        {(courses ?? []).length === 0 ? (
          <div className="card text-sm text-ink-500">
            No courses yet. <Link href="/teach/courses/new" className="text-brand-500">Create your first course →</Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {(courses ?? []).map((c) => (
              <li key={c.id}>
                <Link href={`/teach/courses/${c.id}`} className="card block">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{c.title}</p>
                    {c.cefr_level && (
                      <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                        {c.cefr_level}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-500 capitalize">
                    {c.kind} · {c.subject ?? c.language}
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
