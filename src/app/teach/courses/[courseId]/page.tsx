import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TeacherCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const user = await requireUser();
  const supabase = supabaseServer();

  const { data: course } = await supabase
    .from("courses")
    .select("id,title,description,subject,kind,language,cefr_level,teacher_id")
    .eq("id", params.courseId)
    .single();
  if (!course) notFound();
  if (course.teacher_id !== user.id) redirect("/teach");

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id,title,kind,due_at,published,max_score")
    .eq("course_id", params.courseId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <Link href="/teach" className="text-sm text-brand-500">← Teach</Link>

      <header>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-sm text-ink-500">{course.description}</p>
        <p className="text-xs text-ink-500 capitalize">
          {course.kind} · {course.subject ?? course.language} · {course.cefr_level ?? ""}
        </p>
      </header>

      <div className="flex gap-2">
        <Link href={`/teach/courses/${course.id}/assignments/new`} className="btn-primary flex-1 text-center">
          + Assignment
        </Link>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Assignments
        </h2>
        {(assignments ?? []).length === 0 ? (
          <p className="card text-sm text-ink-500">No assignments yet.</p>
        ) : (
          <ul className="space-y-2">
            {(assignments ?? []).map((a) => (
              <li key={a.id}>
                <Link href={`/teach/assignments/${a.id}`} className="card flex items-center justify-between">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-ink-500 capitalize">
                      {a.kind} · /{a.max_score}
                      {a.due_at ? ` · due ${new Date(a.due_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <span className={`text-xs ${a.published ? "text-green-600" : "text-ink-500"}`}>
                    {a.published ? "Published" : "Draft"}
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
