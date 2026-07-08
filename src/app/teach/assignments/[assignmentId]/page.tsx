import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TeacherAssignmentPage(
  props: {
    params: Promise<{ assignmentId: string }>;
  }
) {
  const params = await props.params;
  const user = await requireUser();
  const supabase = await supabaseServer();

  const { data: a } = await supabase
    .from("assignments")
    .select("id,course_id,teacher_id,title,instructions_md,max_score,kind,due_at")
    .eq("id", params.assignmentId)
    .single();
  if (!a) notFound();
  if (a.teacher_id !== user.id) redirect("/teach");

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id,student_id,submitted_at,status")
    .eq("assignment_id", a.id)
    .order("submitted_at", { ascending: false });

  return (
    <div className="space-y-4">
      <Link href={`/teach/courses/${a.course_id}`} className="text-sm text-brand-500">← Course</Link>
      <h1 className="text-2xl font-bold">{a.title}</h1>
      <p className="text-xs text-ink-500 capitalize">
        {a.kind} · /{a.max_score}{a.due_at ? ` · due ${new Date(a.due_at).toLocaleString()}` : ""}
      </p>

      <details className="card">
        <summary className="cursor-pointer text-sm font-medium">Instructions</summary>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">{a.instructions_md}</p>
      </details>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Submissions ({submissions?.length ?? 0})
        </h2>
        {(submissions ?? []).length === 0 ? (
          <p className="card text-sm text-ink-500">No submissions yet.</p>
        ) : (
          <ul className="space-y-2">
            {(submissions ?? []).map((s) => (
              <li key={s.id}>
                <Link href={`/teach/submissions/${s.id}`} className="card flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Student {s.student_id.slice(0, 8)}</p>
                    <p className="text-xs text-ink-500">
                      {new Date(s.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs ${
                    s.status === "returned" ? "text-green-600" :
                    s.status === "graded" ? "text-amber-600" : "text-ink-500"
                  }`}>
                    {s.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
