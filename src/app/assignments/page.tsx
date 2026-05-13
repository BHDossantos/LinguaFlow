import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const user = await requireOnboardedUser();
  const supabase = supabaseServer();

  const { data: assignments } = await supabase
    .from("assignments")
    .select(`
      id,title,kind,due_at,max_score,course_id,
      course:courses(title,language),
      submissions!left(id,status,student_id)
    `)
    .eq("published", true)
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(50);

  const rows = (assignments ?? []).map((a: any) => {
    const mine = (a.submissions ?? []).find((s: any) => s.student_id === user.id);
    return { ...a, mySubmission: mine };
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Assignments</h1>
        <p className="text-sm text-ink-500">
          Submit any time — AI grades in seconds, your teacher reviews and returns.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="card text-sm text-ink-500">
          No assignments yet. Teachers can create them in <Link href="/teach" className="text-brand-500">Teach</Link>.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((a) => {
            const status = a.mySubmission?.status as string | undefined;
            const statusLabel =
              status === "returned" ? "✓ Returned" :
              status === "graded" ? "Awaiting teacher" :
              status === "submitted" ? "Submitted" : "Not started";
            const linkTo = status ? `/assignments/${a.id}/result` : `/assignments/${a.id}`;
            return (
              <li key={a.id}>
                <Link href={linkTo} className="card flex items-center justify-between">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-ink-500">
                      {a.course?.title ?? "—"} · {a.kind} · /{a.max_score}
                      {a.due_at ? ` · due ${new Date(a.due_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <span className={`text-xs ${
                    status === "returned" ? "text-green-600" :
                    status === "graded" ? "text-amber-600" :
                    status ? "text-brand-500" : "text-ink-500"
                  }`}>
                    {statusLabel}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
