import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { updateLesson, deleteLesson } from "@/app/teach/actions";

export const dynamic = "force-dynamic";

// Edit any lesson kind. The kind-specific body is edited as formatted JSON —
// pragmatic v1 that unblocks typo fixes and content updates for every kind
// without duplicating the composer's per-kind editors.
export default async function EditLessonPage(props: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const params = await props.params;
  const user = await requireUser();
  const supabase = await supabaseServer();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id,title,kind,body,grammar_notes_md,estimated_minutes,course:courses(id,teacher_id,title)")
    .eq("id", params.lessonId)
    .single();
  if (!lesson) notFound();
  if ((lesson as any).course?.teacher_id !== user.id) redirect("/teach");

  return (
    <div className="space-y-4">
      <Link href={`/teach/courses/${params.courseId}`} className="text-sm text-brand-500">
        ← {(lesson as any).course?.title ?? "Course"}
      </Link>
      <header>
        <h1 className="text-2xl font-bold">Edit lesson</h1>
        <p className="text-xs uppercase tracking-wider text-ink-500">{lesson.kind}</p>
      </header>

      <form action={updateLesson} className="space-y-3">
        <input type="hidden" name="lessonId" value={lesson.id} />
        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input
            name="title"
            required
            minLength={2}
            defaultValue={lesson.title}
            data-testid="edit-title"
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 dark:bg-white/5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Content (JSON)</span>
          <textarea
            name="bodyJson"
            required
            rows={14}
            defaultValue={JSON.stringify(lesson.body, null, 2)}
            data-testid="edit-body"
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 font-mono text-xs dark:bg-white/5"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-sm font-medium">Notes</span>
            <input
              name="notes"
              defaultValue={lesson.grammar_notes_md ?? ""}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 dark:bg-white/5"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Est. minutes</span>
            <input
              name="estimatedMinutes"
              type="number"
              min={1}
              max={180}
              defaultValue={lesson.estimated_minutes ?? 10}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 dark:bg-white/5"
            />
          </label>
        </div>
        <button type="submit" data-testid="edit-save" className="btn-primary w-full">
          Save changes
        </button>
      </form>

      <form action={deleteLesson}>
        <input type="hidden" name="lessonId" value={lesson.id} />
        <button
          type="submit"
          data-testid="edit-delete"
          className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
        >
          Delete lesson
        </button>
      </form>
    </div>
  );
}
