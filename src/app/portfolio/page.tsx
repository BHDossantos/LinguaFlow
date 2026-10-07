import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Portfolio" };

// Shareable portfolio (spec §9): projects, verified skills, certificates.
export default async function PortfolioPage() {
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();

  const [{ data: profile }, { data: subs }, { data: certs }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    supabase
      .from("project_submissions")
      .select("id,url,notes,status,score,submitted_at,project:projects(title,school)")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("credentials")
      .select("code,course_title,cefr_level,skills_verified,mastery_pct,issued_at")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false }),
  ]);
  const certificates = certs ?? [];

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
          <p className="text-2xl font-bold text-brand-600">{certificates.length}</p>
          <p className="text-[11px] text-ink-500">certificates</p>
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
        {certificates.length === 0 ? (
          <p className="card text-sm text-ink-500">
            Finish a course to earn a certificate. <Link href="/learn" className="text-brand-600 underline">Your courses →</Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {certificates.map((c: any) => (
              <li key={c.code} className="card">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{c.course_title ?? "Course"}</p>
                    <p className="text-[11px] text-ink-500">
                      Issued {new Date(c.issued_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      {c.cefr_level ? ` · ${c.cefr_level}` : ""}
                      {typeof c.mastery_pct === "number" ? ` · ${c.mastery_pct}% mastery` : ""}
                    </p>
                  </div>
                  <Link href={`/verify/${c.code}`} className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    Verify ↗
                  </Link>
                </div>
                {Array.isArray(c.skills_verified) && c.skills_verified.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.skills_verified.slice(0, 8).map((s: string, i: number) => (
                      <span key={i} className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] text-ink-600">{s}</span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
