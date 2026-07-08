import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { SubmitForm } from "@/components/SubmitForm";

export const dynamic = "force-dynamic";

export default async function AssignmentPage(
  props: {
    params: Promise<{ assignmentId: string }>;
  }
) {
  const params = await props.params;
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();

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

      <SubmitForm
        assignmentId={a.id}
        kind={a.kind}
        defaultText={mine?.text ?? null}
        hasExisting={!!mine}
      />
    </div>
  );
}
