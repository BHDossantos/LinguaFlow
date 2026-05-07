import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { LANGUAGES, type LanguageCode } from "@/lib/languages";

export const dynamic = "force-dynamic";

export default async function LearnPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const supabase = supabaseServer();
  const lang = (searchParams.lang ?? "es") as LanguageCode;

  const { data: courses } = await supabase
    .from("courses")
    .select("id,title,description,cefr_level,goal_tag,language,dialect")
    .eq("language", lang)
    .eq("published", true)
    .order("position");

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">
          Learn {LANGUAGES[lang]?.label ?? lang}
        </h1>
        <p className="text-sm text-ink-500">
          Pick a course aligned with your goal. CEFR levels show what you'll be able to do.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(LANGUAGES).map(([code, l]) => (
          <Link
            key={code}
            href={`/learn?lang=${code}`}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${
              code === lang
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-black/10 bg-white text-ink-700"
            }`}
          >
            <span className="mr-1">{l.flag}</span>
            {l.label}
          </Link>
        ))}
      </div>

      <ul className="space-y-3">
        {(courses ?? []).map((c) => (
          <li key={c.id}>
            <Link href={`/learn/${c.id}`} className="card block">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{c.title}</h2>
                <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  {c.cefr_level}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-500">{c.description}</p>
              {c.goal_tag && (
                <span className="mt-2 inline-block rounded-full bg-black/5 px-2 py-0.5 text-xs">
                  goal: {c.goal_tag}
                </span>
              )}
            </Link>
          </li>
        ))}
        {(!courses || courses.length === 0) && (
          <li className="card text-sm text-ink-500">
            No courses yet for this language. Apply <code>supabase/migrations/0001_init.sql</code> and seed.
          </li>
        )}
      </ul>
    </div>
  );
}
