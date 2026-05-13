import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { submitAssignment } from "@/app/assignments/actions";

export const dynamic = "force-dynamic";

export default async function AssignmentPage({
  params,
}: {
  params: { assignmentId: string };
}) {
  const user = await requireOnboardedUser();
  const supabase = supabaseServer();

  const { data: a } = await supabase
    .from("assignments")
    .select("id,title,instructions_md,max_score,kind,due_at,course:courses(title)")
    .eq("id", params.assignmentId)
    .eq("published", true)
    .single();
  if (!a) notFound();

  const { data: mine } = await supabase
    .from("submissions")
    .select("text,status")
    .eq("assignment_id", a.id)
    .eq("student_id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-4">
      <Link href="/assignments" className="text-sm text-brand-500">← Assignments</Link>
      <header>
        <h1 className="text-2xl font-bold">{a.title}</h1>
        <p className="text-xs text-ink-500 capitalize">
          {(a as any).course?.title ?? ""} · {a.kind} · /{a.max_score}
          {a.due_at ? ` · due ${new Date(a.due_at).toLocaleString()}` : ""}
        </p>
      </header>

      <div className="card">
        <p className="whitespace-pre-wrap text-sm">{a.instructions_md}</p>
      </div>

      <form action={submitAssignment} className="space-y-2">
        <input type="hidden" name="assignmentId" value={a.id} />
        <label className="block">
          <span className="text-sm font-medium">Your submission</span>
          <textarea
            name="text"
            rows={10}
            required
            minLength={1}
            defaultValue={mine?.text ?? ""}
            placeholder={
              a.kind === "math"
                ? "Show your work step by step…"
                : a.kind === "speaking"
                ? "Paste a transcript of what you said (audio upload coming soon)…"
                : "Write your response here…"
            }
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </label>
        <button type="submit" className="btn-primary w-full">
          {mine ? "Resubmit" : "Submit for AI grading"}
        </button>
      </form>
    </div>
  );
}
