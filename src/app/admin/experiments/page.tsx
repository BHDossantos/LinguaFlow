import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Experiments" };

// A-B experiment results (spec §28). Same owner gate as /admin. For each
// experiment we read every exposure and, using the service role, roll the
// mastery + lesson-completion tables up per variant — so the north-star (skills
// mastered per exposed learner) can be compared head to head.
export default async function ExperimentsPage() {
  const user = await requireUser();
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!admins.includes((user.email ?? "").toLowerCase())) notFound();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) notFound();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const [
    { data: experiments },
    { data: exposures },
    { data: mastered },
    { data: completed },
  ] = await Promise.all([
    admin.from("experiments").select("*").order("created_at"),
    admin.from("experiment_exposures").select("user_id,experiment_key,variant"),
    admin.from("skill_states").select("user_id").eq("status", "mastered"),
    admin.from("lesson_progress").select("user_id").not("completed_at", "is", null),
  ]);

  // Per-user tallies, computed once and reused across experiments.
  const masteredByUser = new Map<string, number>();
  for (const r of mastered ?? []) masteredByUser.set(r.user_id, (masteredByUser.get(r.user_id) ?? 0) + 1);
  const completedByUser = new Map<string, number>();
  for (const r of completed ?? []) completedByUser.set(r.user_id, (completedByUser.get(r.user_id) ?? 0) + 1);

  type Row = {
    variant: string;
    learners: number;
    masteredTotal: number;
    completedTotal: number;
    masteredPer: number;   // north-star
    completedPer: number;
    activated: number;     // exposed learners with >=1 completed lesson
  };

  const byExperiment = new Map<string, Map<string, string[]>>();
  for (const e of exposures ?? []) {
    if (!byExperiment.has(e.experiment_key)) byExperiment.set(e.experiment_key, new Map());
    const vm = byExperiment.get(e.experiment_key)!;
    if (!vm.has(e.variant)) vm.set(e.variant, []);
    vm.get(e.variant)!.push(e.user_id);
  }

  function rowsFor(key: string, variants: string[]): Row[] {
    const vm = byExperiment.get(key) ?? new Map<string, string[]>();
    // Include configured variants even with zero exposures, in config order.
    const names = Array.from(new Set([...variants, ...vm.keys()]));
    return names.map((variant) => {
      const users = vm.get(variant) ?? [];
      const learners = users.length;
      const masteredTotal = users.reduce((a, u) => a + (masteredByUser.get(u) ?? 0), 0);
      const completedTotal = users.reduce((a, u) => a + (completedByUser.get(u) ?? 0), 0);
      const activated = users.filter((u) => (completedByUser.get(u) ?? 0) > 0).length;
      return {
        variant,
        learners,
        masteredTotal,
        completedTotal,
        activated,
        masteredPer: learners ? Math.round((masteredTotal / learners) * 100) / 100 : 0,
        completedPer: learners ? Math.round((completedTotal / learners) * 100) / 100 : 0,
      };
    });
  }

  // Lift of the best non-control variant vs control on the north-star.
  function lift(rows: Row[]): { variant: string; pct: number } | null {
    const control = rows.find((r) => r.variant === "control");
    if (!control || control.masteredPer <= 0) return null;
    const challengers = rows.filter((r) => r.variant !== "control" && r.learners > 0);
    if (challengers.length === 0) return null;
    const best = challengers.reduce((a, b) => (b.masteredPer > a.masteredPer ? b : a));
    return { variant: best.variant, pct: Math.round(((best.masteredPer - control.masteredPer) / control.masteredPer) * 100) };
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Experiments</h1>
          <p className="text-sm text-ink-500">
            North-star per variant: <strong>skills mastered per exposed learner</strong>.
          </p>
        </div>
        <Link href="/admin" className="text-sm text-brand-500 hover:underline">← Metrics</Link>
      </header>

      {(!experiments || experiments.length === 0) && (
        <p className="card text-sm text-ink-500">
          No experiments yet. Add one with an <code>insert into public.experiments</code> row.
        </p>
      )}

      {(experiments ?? []).map((exp: any) => {
        const rows = rowsFor(exp.key, Array.isArray(exp.variants) ? exp.variants : []);
        const totalExposed = rows.reduce((a, r) => a + r.learners, 0);
        const l = lift(rows);
        return (
          <section key={exp.key} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {exp.name}{" "}
                  <span className="font-mono text-xs text-ink-500">{exp.key}</span>
                </p>
                {exp.description && <p className="mt-0.5 text-sm text-ink-500">{exp.description}</p>}
              </div>
              <span
                className={
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold " +
                  (exp.enabled ? "bg-green-100 text-green-700" : "bg-black/5 text-ink-500")
                }
              >
                {exp.enabled ? "live" : "off"}
              </span>
            </div>

            {totalExposed === 0 ? (
              <p className="text-sm text-ink-500">No exposures recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500">
                      <th className="py-1 pr-3 font-semibold">Variant</th>
                      <th className="py-1 pr-3 font-semibold">Learners</th>
                      <th className="py-1 pr-3 font-semibold">Activated</th>
                      <th className="py-1 pr-3 font-semibold">Mastered / learner</th>
                      <th className="py-1 pr-3 font-semibold">Lessons / learner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const isBest = l && r.variant === l.variant && l.pct > 0;
                      return (
                        <tr key={r.variant} className="border-t border-black/5">
                          <td className="py-1.5 pr-3 font-medium">
                            {r.variant}
                            {r.variant === "control" && <span className="ml-1 text-[10px] text-ink-500">(baseline)</span>}
                          </td>
                          <td className="py-1.5 pr-3">{r.learners}</td>
                          <td className="py-1.5 pr-3">
                            {r.activated}
                            <span className="text-ink-500"> ({r.learners ? Math.round((r.activated / r.learners) * 100) : 0}%)</span>
                          </td>
                          <td className={"py-1.5 pr-3 font-semibold " + (isBest ? "text-green-600" : "")}>
                            {r.masteredPer}
                          </td>
                          <td className="py-1.5 pr-3">{r.completedPer}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {l && (
              <p className="text-xs text-ink-500">
                {l.pct > 0
                  ? `“${l.variant}” is up ${l.pct}% vs control on the north-star.`
                  : l.pct < 0
                    ? `Best challenger is ${l.pct}% vs control — control is winning so far.`
                    : "No difference vs control yet."}{" "}
                Read directionally until each arm has enough learners.
              </p>
            )}
          </section>
        );
      })}

      <p className="text-xs text-ink-500">
        Assignment is deterministic and logged on first exposure. Outcomes are
        intention-to-treat: every exposed learner counts, whether or not they
        finished.
      </p>
    </div>
  );
}
