import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { EnrollButton } from "@/components/EnrollButton";
import { postDiscussion, deleteDiscussion } from "@/app/learn/[courseId]/discussion-actions";

export const dynamic = "force-dynamic";

const KIND_ICON: Record<string, string> = {
  vocab: "🧠",
  grammar: "📝",
  listening: "👂",
  reading: "📖",
  speaking: "🎙️",
  roleplay: "🎭",
  writing: "✍️",
};

// Learning path: a vertical journey with completed / next / upcoming states,
// so the learner always knows exactly where they are.
export default async function CoursePage(props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();
  const [{ data: course }, { data: lessons }, { data: enrollment }, { data: progress }, { data: posts }] =
    await Promise.all([
      supabase.from("courses").select("*").eq("id", params.courseId).single(),
      supabase
        .from("lessons")
        .select("id,position,title,kind,estimated_minutes")
        .eq("course_id", params.courseId)
        .order("position"),
      supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id)
        .eq("course_id", params.courseId)
        .maybeSingle(),
      supabase
        .from("lesson_progress")
        .select("lesson_id,score,completed_at")
        .eq("user_id", user.id)
        .not("completed_at", "is", null),
      supabase
        .from("discussions")
        .select("id,user_id,parent_id,body,created_at,author:profiles(display_name)")
        .eq("course_id", params.courseId)
        .order("created_at", { ascending: true })
        .limit(100),
    ]);

  if (!course) return <p>Course not found.</p>;
  const enrolled = !!enrollment;

  const doneIds = new Set((progress ?? []).map((p) => p.lesson_id));
  const scoreById = new Map((progress ?? []).map((p) => [p.lesson_id, p.score as number | null]));
  const list = lessons ?? [];
  const doneCount = list.filter((l) => doneIds.has(l.id)).length;
  const pct = list.length ? Math.round((doneCount / list.length) * 100) : 0;
  // The "next" lesson is the first incomplete one.
  const nextId = list.find((l) => !doneIds.has(l.id))?.id ?? null;

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <Link href="/learn" className="text-sm text-brand-500">← All courses</Link>
          <h1 className="mt-2 text-2xl font-bold">{course.title}</h1>
          <p className="text-sm text-ink-500">{course.description}</p>
        </div>
        <EnrollButton courseId={course.id} enrolled={enrolled} />
      </header>

      {/* Course progress */}
      <div className="card space-y-1.5" data-testid="course-progress">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            Your path
          </p>
          <p className="text-xs text-ink-500">{doneCount} / {list.length} · {pct}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Learning path */}
      <ol className="relative space-y-0" data-testid="learning-path">
        {list.map((l, i) => {
          const done = doneIds.has(l.id);
          const isNext = l.id === nextId;
          const score = scoreById.get(l.id);
          return (
            <li key={l.id} className="relative pl-10 pb-2">
              {/* connector line */}
              {i < list.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute left-[15px] top-8 h-full w-0.5 ${
                    done ? "bg-brand-500/50" : "bg-black/10 dark:bg-white/10"
                  }`}
                />
              )}
              {/* node */}
              <span
                aria-hidden
                className={`absolute left-0 top-3 grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                  done
                    ? "bg-brand-500 text-white"
                    : isNext
                      ? "bg-white text-brand-600 ring-2 ring-brand-500 dark:bg-white/10"
                      : "bg-black/5 text-ink-500 dark:bg-white/10"
                }`}
              >
                {done ? "✓" : isNext ? "▶" : i + 1}
              </span>
              <Link
                href={`/learn/${course.id}/${l.id}`}
                className={`card flex items-center gap-3 ${
                  isNext ? "border-brand-500/40 shadow-md" : done ? "opacity-90" : ""
                }`}
              >
                <span className="text-2xl">{KIND_ICON[l.kind] ?? "📘"}</span>
                <div className="flex-1">
                  <div className="font-medium">{l.title}</div>
                  <div className="text-xs capitalize text-ink-500">
                    {l.kind} · ~{l.estimated_minutes} min
                    {done && typeof score === "number" ? ` · scored ${Math.round(score)}` : ""}
                  </div>
                </div>
                {isNext ? (
                  <span className="btn-primary px-4 py-1.5 text-xs">Start</span>
                ) : (
                  <span className="text-ink-500">›</span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Discussion */}
      <section className="space-y-2" data-testid="discussion">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Discussion ({(posts ?? []).length})
        </h2>
        {(posts ?? []).filter((p: any) => !p.parent_id).map((p: any) => (
          <div key={p.id} className="card space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold">{p.author?.display_name ?? "Learner"}</p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm">{p.body}</p>
              </div>
              {p.user_id === user.id && (
                <form action={deleteDiscussion}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="courseId" value={course.id} />
                  <button type="submit" className="text-xs text-ink-500 hover:text-red-600">✕</button>
                </form>
              )}
            </div>
            {(posts ?? []).filter((r: any) => r.parent_id === p.id).map((r: any) => (
              <div key={r.id} className="ml-4 border-l-2 border-black/5 pl-3 dark:border-white/10">
                <p className="text-xs font-semibold">{r.author?.display_name ?? "Learner"}</p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm">{r.body}</p>
              </div>
            ))}
            <form action={postDiscussion} className="flex gap-2">
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="parentId" value={p.id} />
              <input
                name="body"
                required
                minLength={2}
                placeholder="Reply…"
                className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm dark:bg-white/5"
              />
              <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">Reply</button>
            </form>
          </div>
        ))}
        <form action={postDiscussion} className="card flex gap-2">
          <input type="hidden" name="courseId" value={course.id} />
          <input
            name="body"
            required
            minLength={2}
            placeholder="Ask a question or start a discussion…"
            data-testid="discussion-input"
            className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:bg-white/5"
          />
          <button type="submit" className="btn-primary text-sm">Post</button>
        </form>
      </section>

      {list.length > 0 && doneCount === list.length && (
        <div className="card border-green-300 bg-green-50 text-center dark:border-green-500/30 dark:bg-green-500/10">
          <p className="text-lg font-bold">Course complete 🎓</p>
          <p className="text-sm text-ink-500">Every lesson done — keep it fresh in Review.</p>
          <Link href="/review" className="btn-primary mt-2 inline-block">Review now</Link>
        </div>
      )}
    </div>
  );
}
