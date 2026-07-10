import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { moveLesson } from "@/app/teach/actions";

export const dynamic = "force-dynamic";

export default async function TeacherCoursePage(
  props: {
    params: Promise<{ courseId: string }>;
  }
) {
  const params = await props.params;
  const user = await requireUser();
  const supabase = await supabaseServer();

  const { data: course } = await supabase
    .from("courses")
    .select("id,title,description,subject,kind,language,cefr_level,teacher_id")
    .eq("id", params.courseId)
    .single();
  if (!course) notFound();
  if (course.teacher_id !== user.id) redirect("/teach");

  const [{ data: lessons }, { data: assignments }, { data: roster }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id,title,kind,position,estimated_minutes")
      .eq("course_id", params.courseId)
      .order("position", { ascending: true }),
    supabase
      .from("assignments")
      .select("id,title,kind,due_at,published,max_score")
      .eq("course_id", params.courseId)
      .order("created_at", { ascending: false }),
    supabase
      .from("enrollments")
      .select("user_id,enrolled_at,profile:profiles(display_name,cefr_level)")
      .eq("course_id", params.courseId)
      .order("enrolled_at", { ascending: false }),
  ]);

  const KIND_ICON: Record<string, string> = {
    vocab: "🧠", roleplay: "🎭", reading: "📖",
    grammar: "✍️", listening: "🎧", writing: "📝", speaking: "🗣️",
  };

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
        <Link href={`/teach/courses/${course.id}/lessons/new`} className="btn-primary flex-1 text-center">
          + Lesson
        </Link>
        <Link href={`/teach/courses/${course.id}/assignments/new`} className="btn-primary flex-1 text-center">
          + Assignment
        </Link>
        <Link href={`/teach/courses/${course.id}/analytics`} className="btn-ghost flex-1 text-center">
          Analytics
        </Link>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Lessons ({lessons?.length ?? 0})
        </h2>
        {(lessons ?? []).length === 0 ? (
          <p className="card text-sm text-ink-500">
            No lessons yet.{" "}
            <Link href={`/teach/courses/${course.id}/lessons/new`} className="text-brand-500">
              Add your first lesson →
            </Link>
          </p>
        ) : (
          <ul className="space-y-2" data-testid="teacher-lessons">
            {(lessons ?? []).map((l, idx) => (
              <li key={l.id} className="card flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-2xl" aria-hidden>{KIND_ICON[l.kind] ?? "📚"}</span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{l.position}. {l.title}</p>
                    <p className="text-xs capitalize text-ink-500">
                      {l.kind} · ~{l.estimated_minutes ?? 8} min
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <form action={moveLesson}>
                    <input type="hidden" name="lessonId" value={l.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={idx === 0}
                      aria-label="Move up"
                      className="rounded-lg px-1.5 py-1 text-sm text-ink-500 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10"
                    >↑</button>
                  </form>
                  <form action={moveLesson}>
                    <input type="hidden" name="lessonId" value={l.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={idx === (lessons ?? []).length - 1}
                      aria-label="Move down"
                      className="rounded-lg px-1.5 py-1 text-sm text-ink-500 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10"
                    >↓</button>
                  </form>
                  <Link
                    href={`/teach/courses/${course.id}/lessons/${l.id}/edit`}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-white/10"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/learn/${course.id}/${l.id}`}
                    className="rounded-lg px-2 py-1 text-xs text-ink-500 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    Preview
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Students ({roster?.length ?? 0})
        </h2>
        {(roster ?? []).length === 0 ? (
          <p className="card text-sm text-ink-500">No students enrolled yet.</p>
        ) : (
          <ul className="space-y-1">
            {(roster ?? []).map((r: any) => (
              <li key={r.user_id} className="card flex items-center justify-between py-2">
                <span className="text-sm">{r.profile?.display_name ?? r.user_id.slice(0,8)}</span>
                <span className="text-xs text-ink-500">{r.profile?.cefr_level ?? ""}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

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
