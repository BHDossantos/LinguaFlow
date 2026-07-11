import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search" };

const KIND_META: Record<string, { icon: string; label: string }> = {
  course: { icon: "📚", label: "Course" },
  lesson: { icon: "📘", label: "Lesson" },
};

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await props.searchParams;
  await requireUser();
  const supabase = await supabaseServer();

  const query = (q ?? "").trim();
  const { data: results } = query
    ? await supabase.rpc("search_content", { p_query: query, p_limit: 30 })
    : { data: null };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-sm text-ink-500">Courses and lessons, one box.</p>
      </header>

      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Try: café, greetings, biology…"
          autoFocus
          className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 dark:bg-white/5"
        />
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {query && (
        <section className="space-y-2" data-testid="search-results">
          {(results ?? []).length === 0 ? (
            <p className="card text-sm text-ink-500">
              Nothing found for “{query}”. Try a different word — or ask the{" "}
              <Link href="/coach" className="text-brand-500">Coach</Link>.
            </p>
          ) : (
            (results ?? []).map((r: any) => {
              const meta = KIND_META[r.kind] ?? { icon: "🔎", label: r.kind };
              const href = r.kind === "course" ? `/learn/${r.id}` : `/learn/${r.course_id}/${r.id}`;
              return (
                <Link key={`${r.kind}-${r.id}`} href={href} className="card flex items-center gap-3">
                  <span className="text-2xl">{meta.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.title}</p>
                    <p className="truncate text-xs text-ink-500">{meta.label}{r.snippet ? ` · ${r.snippet}` : ""}</p>
                  </div>
                  <span className="text-ink-500">›</span>
                </Link>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}
