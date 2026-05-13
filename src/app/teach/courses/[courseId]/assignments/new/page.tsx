import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { createAssignment } from "@/app/teach/actions";

export const dynamic = "force-dynamic";

export default async function NewAssignmentPage({
  params,
}: {
  params: { courseId: string };
}) {
  const user = await requireUser();
  const supabase = supabaseServer();
  const { data: course } = await supabase
    .from("courses").select("id,title,teacher_id").eq("id", params.courseId).single();
  if (!course) notFound();
  if (course.teacher_id !== user.id) redirect("/teach");

  return (
    <div className="space-y-4">
      <Link href={`/teach/courses/${course.id}`} className="text-sm text-brand-500">← {course.title}</Link>
      <h1 className="text-2xl font-bold">New assignment</h1>

      <form action={createAssignment} className="space-y-3">
        <input type="hidden" name="courseId" value={course.id} />

        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input name="title" required minLength={2} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Instructions (Markdown)</span>
          <textarea name="instructions" rows={6} required minLength={5}
            placeholder="Write a 300-word essay about..." className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Rubric</span>
          <textarea
            name="rubric"
            rows={4}
            placeholder={"One criterion per line:\nname | weight | description\nTask | 0.3 | Did the student address the prompt?\nClarity | 0.3 | Structure and flow\nLanguage | 0.25 | Grammar and mechanics\nDepth | 0.15 | Insight and evidence"}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
          />
          <span className="text-xs text-ink-500">Leave blank to use a default essay rubric.</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          <label className="block">
            <span className="text-sm font-medium">Kind</span>
            <select name="kind" required className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2">
              <option value="essay">Essay</option>
              <option value="short_answer">Short answer</option>
              <option value="math">Math</option>
              <option value="speaking">Speaking</option>
              <option value="project">Project</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Max score</span>
            <input name="maxScore" type="number" min={1} max={1000} defaultValue={100} required className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Due date</span>
            <input name="dueAt" type="datetime-local" className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2" />
          </label>
        </div>

        <button type="submit" className="btn-primary w-full">Publish assignment</button>
      </form>
    </div>
  );
}
