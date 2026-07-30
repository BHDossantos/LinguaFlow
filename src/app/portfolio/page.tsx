import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Portfolio" };

// Shareable portfolio (spec §9): projects, verified skills, certificates.
export default async function PortfolioPage() {
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();

  const [{ data: profile }, { data: subs }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    supabase
      .from("project_submissions")
      .select("id,url,notes,status,score,submitted_at,project:projects(title,school)")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false }),
  ]);

  // Verified skills = mastered skill_states (best-effort; empty pre-migration).
  let masteredSkills = 0;
  try {
    const { count } = await supabase
      .from("skill_states")
      .select("skill_id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "mastered");
    masteredSkills = count ?? 0;
  } catch {}

  const projects = (subs ?? []).filter(Boolean);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">{profile?.display_name ?? "My"} portfolio</h1>
        <p className="text-sm text-ink-500">Evidence of what you can actually do — projects, verified skills, and certificates.</p>
      </header>

      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="card">
          <p className="text-2xl font-bold text-green-600">{masteredSkills}</p>
          <p className="text-[11px] text-ink-500">skills mastered</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold">{projects.length}</p>
          <p className="text-[11px] text-ink-500">projects</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold">{projects.filter((p: any) => p.status === "reviewed").length}</p>
          <p className="text-[11px] text-ink-500">reviewed</p>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">Projects</h2>
          <Link href="/projects" className="text-xs font-semibold text-brand-600">Browse projects →</Link>
        </div>
        {projects.length === 0 ? (
          <p className="card text-sm text-ink-500">
            No projects yet. <Link href="/projects" className="text-brand-600 underline">Start one</Link> to build your portfolio.
          </p>
        ) : (
          <ul className="space-y-2">
            {projects.map((s: any) => (
              <li key={s.id} className="card">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{s.project?.title ?? "Project"}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.status === "reviewed" ? "bg-green-100 text-green-700" : "bg-brand-50 text-brand-700"}`}>
                    {s.status}{typeof s.score === "number" ? ` · ${s.score}/100` : ""}
                  </span>
                </div>
                {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 block truncate text-sm text-brand-600 hover:underline">{s.url}</a>}
                {s.notes && <p className="mt-1 line-clamp-2 text-xs text-ink-500">{s.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">Certificates</h2>
        <p className="card text-sm text-ink-500">
          Finish a course to earn a certificate. <Link href="/learn" className="text-brand-600 underline">Your courses →</Link>
        </p>
      </section>
    </div>
  );
}
