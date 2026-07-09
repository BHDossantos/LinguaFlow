import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ParentStudentPage(
  props: {
    params: Promise<{ studentId: string }>;
  }
) {
  const params = await props.params;
  const user = await requireUser();
  const supabase = await supabaseServer();

  // Confirm the link exists (RLS also enforces this on every query below).
  const { data: link } = await supabase
    .from("guardians")
    .select("student_id")
    .eq("guardian_id", user.id)
    .eq("student_id", params.studentId)
    .maybeSingle();
  if (!link) notFound();

  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [
    { data: student },
    { data: enrollments },
    { data: recentLessons },
    { data: graded },
    { data: attendance },
  ] = await Promise.all([
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
      supabase
        .from("attendance")
        .select("status,marked_at")
        .eq("user_id", params.studentId)
        .gte("marked_at", since30),
    ]);

  const attTotals = { present: 0, absent: 0, late: 0, excused: 0 } as Record<string, number>;
  for (const a of attendance ?? []) attTotals[(a as any).status] = (attTotals[(a as any).status] ?? 0) + 1;
  const attCount = (attendance ?? []).length;

  // Recent announcements across every classroom the student is in.
  const { data: classroomLinks } = await supabase
    .from("classroom_members")
    .select("classroom_id,classroom:classrooms(name)")
    .eq("user_id", params.studentId);
  const classroomIds = (classroomLinks ?? []).map((c: any) => c.classroom_id);
  const classroomNames = new Map(
    (classroomLinks ?? []).map((c: any) => [c.classroom_id, c.classroom?.name as string]),
  );
  const { data: announcements } = classroomIds.length === 0
    ? { data: [] as any[] }
    : await supabase
        .from("announcements")
        .select("id,body,pinned,created_at,classroom_id")
        .in("classroom_id", classroomIds)
        .order("created_at", { ascending: false })
        .limit(8);

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

      {(announcements ?? []).length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Announcements
          </h2>
          <ul className="space-y-2">
            {(announcements ?? []).map((a: any) => (
              <li key={a.id} className="card space-y-1">
                <p className="text-xs text-ink-500">
                  {a.pinned && <span className="mr-1 text-brand-500">📌</span>}
                  {classroomNames.get(a.classroom_id) ?? "Classroom"} ·{" "}
                  {new Date(a.created_at).toLocaleDateString()}
                </p>
                <p className="whitespace-pre-wrap text-sm">{a.body}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {attCount > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Attendance (last 30 days)
          </h2>
          <div className="card grid grid-cols-4 gap-2 text-center">
            {(["present", "absent", "late", "excused"] as const).map((s) => (
              <div key={s}>
                <p className={
                  "text-2xl font-bold " +
                  (s === "present" ? "text-green-600" :
                   s === "absent"  ? "text-red-600" :
                   s === "late"    ? "text-amber-600" : "text-brand-700")
                }>
                  {attTotals[s] ?? 0}
                </p>
                <p className="text-xs capitalize text-ink-500">{s}</p>
              </div>
            ))}
          </div>
        </section>
      )}

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
                      ? `${ai}/${max} (system)`
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
