import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { SubmitProject } from "./SubmitProject";

export const dynamic = "force-dynamic";

export default async function ProjectPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();

  const { data: project } = await supabase
    .from("projects")
    .select("id,school,title,brief,deliverables,rubric,difficulty,estimated_hours")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) notFound();

  const { data: submissions } = await supabase
    .from("project_submissions")
    .select("id,url,notes,status,score,feedback,submitted_at")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false });

  return (
    <div className="space-y-5">
      <Link href="/projects" className="text-sm text-brand-500">← Projects</Link>
      <header>
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <p className="text-sm text-ink-500 capitalize">
          {project.difficulty}{project.estimated_hours ? ` · ~${project.estimated_hours}h` : ""}
        </p>
      </header>

      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">The brief</p>
        <p className="mt-1 text-sm">{project.brief}</p>
      </div>

      {(project.deliverables ?? []).length > 0 && (
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Deliverables</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
            {project.deliverables.map((d: string, i: number) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}

      {(project.rubric ?? []).length > 0 && (
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">How it's assessed</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
            {project.rubric.map((r: string, i: number) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      {(submissions ?? []).length > 0 && (
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Your submissions</p>
          <ul className="mt-2 space-y-2">
            {(submissions ?? []).map((s: any) => (
              <li key={s.id} className="rounded-lg border border-black/5 p-2 text-sm dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-500">{new Date(s.submitted_at).toLocaleDateString()}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.status === "reviewed" ? "bg-green-100 text-green-700" : "bg-brand-50 text-brand-700"}`}>
                    {s.status}{typeof s.score === "number" ? ` · ${s.score}/100` : ""}
                  </span>
                </div>
                {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-brand-600 hover:underline">{s.url}</a>}
                {s.feedback && <p className="mt-1 text-xs text-ink-600">Feedback: {s.feedback}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <SubmitProject projectId={project.id} />
    </div>
  );
}
