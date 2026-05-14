import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ParentStudentPage({
  params,
}: {
  params: { studentId: string };
}) {
  const user = await requireUser();
  const supabase = supabaseServer();

  // Confirm the link exists (RLS also enforces this on every query below).
  const { data: link } = await supabase
    .from("guardians")
    .select("student_id")
    .eq("guardian_id", user.id)
    .eq("student_id", params.studentId)
    .maybeSingle();
  if (!link) notFound();

  const [{ data: student }, { data: enrollments }, { data: recentLessons }, { data: graded }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name,cefr_level,goals")
        .eq("id", params.studentId)
        .single(),
      supabase
        .from("enrollments")
        .select("course:courses(id,title,kind,subject)")
        .eq("user_id", params.studentId),
      supabase
        .from("lesson_progress")
        .select("lesson_id,score,completed_at,lesson:lessons(title)")
        .eq("user_id", params.studentId)
        .order("completed_at", { ascending: false })
        .limit(8),
      supabase
        .from("submissions")
        .select(`
          id,status,submitted_at,
          assignment:assignments(title,max_score),
          teacher_reviews(final_score),
          ai_grades(score)
        `)
        .eq("student_id", params.studentId)
        .order("submitted_at", { ascending: false })
        .limit(10),
    ]);

  return (
    <div className="space-y-5">
      <Link href="/family" className="text-sm text-brand-500">← Family</Link>
      <header>
        <h1 className="text-2xl font-bold">{student?.display_name ?? "Student"}</h1>
        <p className="text-sm text-ink-500">
          {student?.cefr_level ? `CEFR ${student.cefr_level}` : ""}
          {student?.goals?.length ? ` · goals: ${student.goals.join(", ")}` : ""}
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Enrolled courses ({enrollments?.length ?? 0})
        </h2>
        {(enrollments ?? []).length === 0 ? (
          <p className="card text-sm text-ink-500">No courses yet.</p>
        ) : (
          <ul className="space-y-1">
            {(enrollments ?? []).map((e: any, i: number) => (
              <li key={i} className="card flex items-center justify-between py-2">
                <span className="text-sm">{e.course?.title}</span>
                <span className="text-xs capitalize text-ink-500">
                  {e.course?.subject ?? e.course?.kind}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Recent grades
        </h2>
        {(graded ?? []).length === 0 ? (
          <p className="card text-sm text-ink-500">No submissions yet.</p>
        ) : (
          <ul className="space-y-2">
            {(graded ?? []).map((s: any) => {
              const final = s.teacher_reviews?.[0]?.final_score;
              const ai = s.ai_grades?.[0]?.score;
              const max = s.assignment?.max_score ?? 100;
              return (
                <li key={s.id} className="card flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{s.assignment?.title}</p>
                    <p className="text-xs text-ink-500">
                      {new Date(s.submitted_at).toLocaleDateString()} · {s.status}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {final != null
                      ? `${final}/${max}`
                      : ai != null
                      ? `${ai}/${max} (AI)`
                      : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Recent lessons
        </h2>
        {(recentLessons ?? []).length === 0 ? (
          <p className="card text-sm text-ink-500">No lessons completed yet.</p>
        ) : (
          <ul className="space-y-1">
            {(recentLessons ?? []).map((l: any) => (
              <li key={l.lesson_id} className="card flex items-center justify-between py-2">
                <span className="text-sm">{l.lesson?.title ?? "Lesson"}</span>
                <span className="text-xs text-ink-500">
                  {l.completed_at ? new Date(l.completed_at).toLocaleDateString() : "in progress"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
