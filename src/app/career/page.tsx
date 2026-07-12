import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { LANGUAGES, languageLabel } from "@/lib/languages";
import { CAREER_TRACKS, levelReached } from "@/lib/career";

export const dynamic = "force-dynamic";

// Career: turns learning progress into something a student can put on a
// résumé — credentials earned, tracks unlocked by level, interview practice.
export default async function CareerPage() {
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();

  const [{ data: targets }, { data: done }, { data: allLessons }] = await Promise.all([
    supabase
      .from("target_languages")
      .select("language,cefr_level,active")
      .eq("user_id", user.id),
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .not("completed_at", "is", null),
    supabase.from("lessons").select("id,course_id,course:courses(id,title,language)"),
  ]);

  // Certificates = fully completed courses (same rule as the profile page).
  const doneIds = new Set((done ?? []).map((d) => d.lesson_id));
  const byCourse = new Map<string, { title: string; language: string; total: number; done: number }>();
  for (const l of allLessons ?? []) {
    const c: any = (l as any).course;
    if (!c) continue;
    const cur = byCourse.get(c.id) ?? { title: c.title, language: c.language, total: 0, done: 0 };
    cur.total++;
    if (doneIds.has(l.id)) cur.done++;
    byCourse.set(c.id, cur);
  }
  const certificates = [...byCourse.entries()].filter(([, v]) => v.total > 0 && v.done === v.total);

  const primary = (targets ?? []).find((t) => t.active) ?? (targets ?? [])[0];
  const bestLevel = primary?.cefr_level ?? "A1";

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Career</h1>
        <p className="text-sm text-ink-500">
          Languages are the most portable skill there is. Here&apos;s what yours unlock — and what to aim for next.
        </p>
      </header>

      {/* Credentials */}
      <section className="card space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Your credentials</p>
        <div className="flex flex-wrap gap-1.5">
          {(targets ?? []).map((t) => (
            <span key={t.language} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              {(LANGUAGES as any)[t.language]?.flag} {languageLabel(t.language)} · {t.cefr_level}
            </span>
          ))}
          {certificates.map(([id, v]) => (
            <Link key={id} href={`/certificates/${id}`} className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              🎓 {v.title}
            </Link>
          ))}
        </div>
        <div className="rounded-xl bg-black/[0.03] p-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-500">Résumé line — copy it</p>
          <p className="select-all font-mono text-xs leading-relaxed">
            {(targets ?? [])
              .map((t) => `${languageLabel(t.language)} (CEFR ${t.cefr_level})`)
              .join(", ")}
            {certificates.length > 0 ? ` — ${certificates.length} course certificate${certificates.length > 1 ? "s" : ""}, Noelia` : " — in training, Noelia"}
          </p>
        </div>
      </section>

      {/* Tracks */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">Career tracks</h2>
        {CAREER_TRACKS.map((track) => {
          const unlocked = levelReached(bestLevel, track.minLevel);
          return (
            <div key={track.id} className={`card space-y-2 ${unlocked ? "" : "opacity-70"}`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{track.icon} {track.title}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  unlocked ? "bg-green-50 text-green-700" : "bg-black/5 text-ink-500"
                }`}>
                  {unlocked ? "Unlocked" : `Reach ${track.minLevel}`}
                </span>
              </div>
              <p className="text-sm text-ink-500">{track.description}</p>
              <div className="flex flex-wrap gap-1">
                {track.skills.map((s) => (
                  <span key={s} className="rounded-full bg-black/5 px-2 py-0.5 text-[11px]">{s}</span>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Link
                  href={`/practice?scenario=${encodeURIComponent(track.interviewScenario)}`}
                  className="btn-primary flex-1 text-center text-sm"
                >
                  Practice the interview
                </Link>
                <Link href="/learn" className="btn-ghost flex-1 text-center text-sm">
                  Courses for this
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      <section className="card space-y-1.5">
        <p className="font-semibold">🧑‍🏫 Ready to earn on Noelia?</p>
        <p className="text-sm text-ink-500">
          Instructors on our marketplace set their own per-minute rate and teach from anywhere.
          B2 and above? Create your first course in the studio.
        </p>
        <Link href="/teach" className="btn-ghost w-full text-center text-sm">Open the teaching studio →</Link>
      </section>
    </div>
  );
}
