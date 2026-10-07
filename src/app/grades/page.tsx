import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import {
  computeFinalGrade,
  itemResults,
  letterFor,
  type GradeCategory,
  type GradeItem,
  type SchemeBand,
} from "@/lib/gradebook";

export const dynamic = "force-dynamic";
export const metadata = { title: "My grades" };

// Student-facing grades, Brightspace-style: for each classroom the student is in,
// the running final grade plus each published grade item with their score,
// percentage, and feedback. RLS guarantees they only see their own entries.
export default async function GradesPage() {
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();

  const { data: memberships } = await supabase
    .from("classroom_members")
    .select("classroom_id, classrooms(id, name)")
    .eq("user_id", user.id)
    .eq("role", "student");

  const classes = (memberships ?? [])
    .map((m: any) => ({ id: m.classrooms?.id as string, name: (m.classrooms?.name as string) ?? "Class" }))
    .filter((c) => c.id);

  if (classes.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">My grades</h1>
        <p className="card text-sm text-ink-500">
          You're not in a class with a gradebook yet. Grades your teacher posts will appear here.
          Your course progress lives under <Link href="/learn" className="text-brand-600 underline">Learn</Link>.
        </p>
      </div>
    );
  }

  const classIds = classes.map((c) => c.id);
  const [{ data: settingsRows }, { data: cats }, { data: items }] = await Promise.all([
    supabase.from("gradebook_settings").select("*").in("classroom_id", classIds),
    supabase.from("grade_categories").select("*").in("classroom_id", classIds).order("position"),
    supabase.from("grade_items").select("*").eq("published", true).in("classroom_id", classIds).order("position"),
  ]);

  const itemIds = (items ?? []).map((i: any) => i.id);
  const { data: myEntries } = itemIds.length
    ? await supabase.from("grade_entries").select("grade_item_id,points,exempt,feedback_md").eq("student_id", user.id).in("grade_item_id", itemIds)
    : { data: [] as any[] };

  const entryByItem = new Map((myEntries ?? []).map((e: any) => [e.grade_item_id, e]));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">My grades</h1>
        <p className="text-sm text-ink-500">Your grades and feedback for each class.</p>
      </header>

      {classes.map((cls) => {
        const settings = (settingsRows ?? []).find((s: any) => s.classroom_id === cls.id);
        const mode = (settings?.mode ?? "points") as "points" | "weighted";
        const scheme = (settings?.scheme ?? undefined) as SchemeBand[] | undefined;
        const categories = ((cats ?? []).filter((c: any) => c.classroom_id === cls.id)) as GradeCategory[];
        const clsItems = ((items ?? []).filter((i: any) => i.classroom_id === cls.id)) as GradeItem[];
        const entries = clsItems.map((it) => {
          const e = entryByItem.get(it.id);
          return { grade_item_id: it.id, points: e?.points ?? null, exempt: e?.exempt };
        });
        const final = computeFinalGrade({ mode, categories, items: clsItems, entries, scheme });
        const results = itemResults(clsItems, entries);
        const catName = new Map(categories.map((c) => [c.id, c.name]));

        return (
          <section key={cls.id} className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{cls.name}</h2>
              <div className="text-right">
                {final.percent == null ? (
                  <span className="text-sm text-ink-400">No grades yet</span>
                ) : (
                  <>
                    <p className="text-2xl font-extrabold text-brand-600">
                      {final.letter} <span className="text-base font-bold text-ink-700">{final.percent}%</span>
                    </p>
                    <p className="text-[11px] text-ink-500">running grade</p>
                  </>
                )}
              </div>
            </div>

            {clsItems.length === 0 ? (
              <p className="text-sm text-ink-500">No grade items posted yet.</p>
            ) : (
              <ul className="divide-y divide-black/5">
                {results.map((r) => {
                  const e = entryByItem.get(r.item.id);
                  const l = r.percent != null ? letterFor(r.percent, scheme) : null;
                  return (
                    <li key={r.item.id} className="py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium">{r.item.name}</p>
                          <p className="text-[11px] text-ink-500">
                            {(r.item as any).category_id ? catName.get((r.item as any).category_id) ?? "" : "Uncategorized"}
                            {(r.item as any).due_at ? ` · due ${new Date((r.item as any).due_at).toLocaleDateString()}` : ""}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          {r.exempt ? (
                            <span className="text-xs text-ink-400">Exempt</span>
                          ) : r.graded ? (
                            <>
                              <p className="font-semibold">{r.points}<span className="text-ink-400">/{r.item.max_points}</span></p>
                              <p className="text-[11px] text-ink-500">{r.percent}%{l ? ` · ${l.symbol}` : ""}</p>
                            </>
                          ) : (
                            <span className="text-xs text-ink-400">Not graded</span>
                          )}
                        </div>
                      </div>
                      {e?.feedback_md && (
                        <p className="mt-1 rounded-lg bg-black/5 px-2 py-1 text-xs text-ink-600">{e.feedback_md}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
