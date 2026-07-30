import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projects" };

const SCHOOL_EMOJI: Record<string, string> = {
  language: "🗣️", math: "➗", science: "🔬", technology: "💻", business: "📈",
};

// Project-based learning (spec §9): build/perform something real; it becomes
// portfolio evidence.
export default async function ProjectsPage() {
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();

  const [{ data: projects }, { data: mine }] = await Promise.all([
    supabase.from("projects").select("id,school,title,brief,difficulty,estimated_hours").eq("published", true).order("school"),
    supabase.from("project_submissions").select("project_id,status").eq("user_id", user.id),
  ]);
  const statusByProject = new Map((mine ?? []).map((m: any) => [m.project_id, m.status]));

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-ink-500">Prove it by building something real. Each finished project joins your portfolio.</p>
        </div>
        <Link href="/portfolio" className="btn-ghost px-4 py-2 text-sm">My portfolio →</Link>
      </header>

      {(projects ?? []).length === 0 ? (
        <p className="card text-sm text-ink-500">No projects yet — check back soon.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(projects ?? []).map((p: any) => {
            const st = statusByProject.get(p.id);
            return (
              <Link key={p.id} href={`/projects/${p.id}`} className="card card-hover flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{SCHOOL_EMOJI[p.school] ?? "🎓"}</span>
                  {st && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${st === "reviewed" ? "bg-green-100 text-green-700" : "bg-brand-50 text-brand-700"}`}>
                      {st === "reviewed" ? "Reviewed" : "Submitted"}
                    </span>
                  )}
                </div>
                <p className="mt-2 font-semibold">{p.title}</p>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-500">{p.brief}</p>
                <p className="mt-2 text-xs text-ink-500 capitalize">{p.difficulty}{p.estimated_hours ? ` · ~${p.estimated_hours}h` : ""}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
