import { Fragment } from "react";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { EnrollButton } from "@/components/EnrollButton";
import { postDiscussion, deleteDiscussion } from "@/app/learn/[courseId]/discussion-actions";

export const dynamic = "force-dynamic";

const KIND_ICON: Record<string, string> = {
  vocab: "🧠",
  grammar: "📝",
  listening: "👂",
  reading: "📖",
  speaking: "🎙️",
  roleplay: "🎭",
  writing: "✍️",
};

// Learning path: a vertical journey with completed / next / upcoming states,
// so the learner always knows exactly where they are.
export default async function CoursePage(props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();
  const [{ data: course }, { data: lessons }, { data: enrollment }, { data: progress }, { data: posts }] =
    await Promise.all([
      supabase.from("courses").select("*").eq("id", params.courseId).single(),
      supabase
        .from("lessons")
        .select("id,position,title,kind,estimated_minutes")
        .eq("course_id", params.courseId)
        .order("position"),
      supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id)
        .eq("course_id", params.courseId)
        .maybeSingle(),
      supabase
        .from("lesson_progress")
        .select("lesson_id,score,completed_at")
        .eq("user_id", user.id)
        .not("completed_at", "is", null),
      supabase
        .from("discussions")
        .select("id,user_id,parent_id,body,created_at,author:profiles(display_name)")
        .eq("course_id", params.courseId)
        .order("created_at", { ascending: true })
        .limit(100),
    ]);

  if (!course) return <p>Course not found.</p>;
  const enrolled = !!enrollment;

  const doneIds = new Set((progress ?? []).map((p) => p.lesson_id));
  const scoreById = new Map((progress ?? []).map((p) => [p.lesson_id, p.score as number | null]));
  const list = lessons ?? [];
  const doneCount = list.filter((l) => doneIds.has(l.id)).length;
  const pct = list.length ? Math.round((doneCount / list.length) * 100) : 0;
  // The "next" lesson is the first incomplete one.
  const nextId = list.find((l) => !doneIds.has(l.id))?.id ?? null;

  // Prerequisites (recommendation, not a hard lock): which are finished?
  const prereqIds: string[] = (course as any).prerequisite_ids ?? [];
  let prereqs: { id: string; title: string; done: boolean }[] = [];
  if (prereqIds.length > 0) {
    const [{ data: pcs }, { data: plessons }] = await Promise.all([
      supabase.from("courses").select("id,title").in("id", prereqIds),
      supabase.from("lessons").select("id,course_id").in("course_id", prereqIds),
    ]);
    const lessonsByCourse = new Map<string, string[]>();
    for (const l of plessons ?? []) {
      const arr = lessonsByCourse.get(l.course_id) ?? [];
      arr.push(l.id);
      lessonsByCourse.set(l.course_id, arr);
    }
    prereqs = (pcs ?? []).map((c) => {
      const ids = lessonsByCourse.get(c.id) ?? [];
      return { id: c.id, title: c.title, done: ids.length > 0 && ids.every((id) => doneIds.has(id)) };
    });
  }
  const missingPrereqs = prereqs.filter((p) => !p.done);

  const nextLesson = list.find((l) => l.id === nextId) ?? null;
  const minutesLeft = list
    .filter((l) => !doneIds.has(l.id))
    .reduce((s, l) => s + (l.estimated_minutes ?? 8), 0);

  // Module grouping: every quiz lesson is a checkpoint that ENDS a module.
  // A diagnostic quiz sitting at the very start of the course forms its own
  // "Diagnostic" module; remaining segments are numbered Module 1, 2, …
  type LessonRow = (typeof list)[number];
  const modules: { label: string; lessons: LessonRow[] }[] = [];
  {
    let current: LessonRow[] = [];
    let moduleNum = 0;
    for (const l of list) {
      current.push(l);
      if (l.kind === "quiz") {
        const isDiagnostic = modules.length === 0 && current.length === 1;
        modules.push({
          label: isDiagnostic ? "Diagnostic" : `Module ${++moduleNum}`,
          lessons: current,
        });
        current = [];
      }
    }
    if (current.length > 0) {
      modules.push({ label: `Module ${++moduleNum}`, lessons: current });
    }
  }
  // The last quiz in the whole path is the final checkpoint (trophy node).
  const finalQuizId = [...list].reverse().find((l) => l.kind === "quiz")?.id ?? null;

  // Khan-style mastery status per lesson, derived from the recorded score.
  const masteryOf = (id: string): { label: string; cls: string } | null => {
    if (!doneIds.has(id)) return null;
    const score = scoreById.get(id);
    if (score == null) return { label: "Completed", cls: "bg-brand-50 text-brand-700" };
    if (score >= 90) return { label: "Mastered", cls: "bg-green-100 text-green-700" };
    if (score >= 80) return { label: "Proficient", cls: "bg-green-50 text-green-700" };
    if (score >= 60) return { label: "Familiar", cls: "bg-amber-50 text-amber-700" };
    return { label: "Attempted", cls: "bg-black/5 text-ink-500" };
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="text-xs text-ink-500">
        <Link href="/learn" className="hover:text-brand-600">My Learning</Link>
        <span className="mx-1.5">›</span>
        <span className="text-ink-900">{course.title}</span>
      </nav>

      {/* Hero: thumbnail tile + title + enroll */}
      <header className="flex items-start gap-4">
        <div className="hidden h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 text-white sm:flex">
          <span className="text-xl font-extrabold leading-none">
            {course.cefr_level ?? "101"}
          </span>
          <span className="mt-1 px-1 text-center text-[10px] font-medium leading-tight opacity-90">
            {course.title.split("—")[0].trim().split(" ").slice(0, 2).join(" ")}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-sm text-ink-500">{course.description}</p>
        </div>
        <EnrollButton courseId={course.id} enrolled={enrolled} />
      </header>

      {/* Tabs (per the product design) */}
      <div className="flex gap-5 border-b border-black/5 text-sm">
        <span className="border-b-2 border-brand-500 pb-2 font-semibold text-brand-700">Overview</span>
        <a href="#curriculum" className="pb-2 text-ink-500 hover:text-ink-900">Curriculum</a>
        <Link href="/practice" className="pb-2 text-ink-500 hover:text-ink-900">Practice</Link>
        <Link href="/profile" className="pb-2 text-ink-500 hover:text-ink-900">Progress</Link>
        <Link href="/coach" className="pb-2 text-ink-500 hover:text-ink-900">Coach</Link>
      </div>

      {missingPrereqs.length > 0 && doneCount === 0 && (
        <div className="card border-amber-200 bg-amber-50 text-sm text-amber-800">
          <p className="font-medium">Recommended before this course:</p>
          <ul className="mt-1 space-y-0.5">
            {missingPrereqs.map((p) => (
              <li key={p.id}>
                <Link href={`/learn/${p.id}`} className="underline">→ {p.title}</Link>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs">
            You can still start here — or take the diagnostic in lesson 1 to check you&apos;re ready.
          </p>
        </div>
      )}

      {/* Course dashboard hero: progress + stats + continue */}
      <div className="card space-y-3" data-testid="course-progress">
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs font-semibold text-brand-600">{pct}% complete</p>
          {pct > 0 && pct < 100 && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
              On track
            </span>
          )}
          {pct === 100 && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              🎓 Complete
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl bg-black/[0.03] p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-ink-500">Level</p>
            <p className="text-sm font-semibold">{course.cefr_level ?? "Foundations"}</p>
          </div>
          <div className="rounded-xl bg-black/[0.03] p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-ink-500">Lessons</p>
            <p className="text-sm font-semibold">{doneCount} of {list.length}</p>
          </div>
          <div className="rounded-xl bg-black/[0.03] p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-ink-500">Time left</p>
            <p className="text-sm font-semibold">~{Math.max(1, Math.round(minutesLeft / 60 * 10) / 10)}h</p>
          </div>
          <div className="rounded-xl bg-black/[0.03] p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-ink-500">Next lesson</p>
            <p className="truncate text-sm font-semibold">{nextLesson?.title ?? "All done!"}</p>
          </div>
        </div>
        {nextLesson && (
          <Link href={`/learn/${course.id}/${nextLesson.id}`} className="btn-primary block w-full text-center">
            {doneCount === 0 ? "Start learning" : "Continue learning"}
          </Link>
        )}
        {pct === 100 && (
          <Link href={`/certificates/${course.id}`} className="btn-primary block w-full text-center">
            🎓 View your certificate
          </Link>
        )}
      </div>

      {/* Up next */}
      {nextLesson && (
        <Link
          href={`/learn/${course.id}/${nextLesson.id}`}
          className="card flex items-center gap-3 border-brand-500/30 hover:shadow-md"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-xl">
            {KIND_ICON[nextLesson.kind] ?? "📘"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">Up next</p>
            <p className="truncate font-semibold">{nextLesson.title}</p>
            <p className="text-xs text-ink-500">⏱ {nextLesson.estimated_minutes ?? 10} min</p>
          </div>
          <span className="btn-primary px-4 py-1.5 text-xs">Continue</span>
        </Link>
      )}

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-6">
      <div id="curriculum">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-500">Curriculum</h2>
      {/* Learning path */}
      <ol className="relative space-y-0" data-testid="learning-path">
        {modules.map((mod, mi) => {
          const modDone = mod.lessons.filter((l) => doneIds.has(l.id)).length;
          return (
            <Fragment key={mod.label}>
              {/* Module header row */}
              <li className={`pb-2 ${mi > 0 ? "pt-3" : ""}`}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  {mod.label === "Diagnostic"
                    ? "Diagnostic"
                    : `${mod.label} — ${modDone} of ${mod.lessons.length} done`}
                </p>
              </li>
              {mod.lessons.map((l, j) => {
          const i = list.findIndex((x) => x.id === l.id);
          const done = doneIds.has(l.id);
          const isNext = l.id === nextId;
          const score = scoreById.get(l.id);
          const isQuiz = l.kind === "quiz";
          return (
            <li key={l.id} className="relative pl-10 pb-2">
              {/* connector line — stops at the module boundary so each module reads as its own segment */}
              {j < mod.lessons.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute left-[15px] top-8 h-full w-0.5 ${
                    done ? "bg-brand-500/50" : "bg-black/10 dark:bg-white/10"
                  }`}
                />
              )}
              {/* node */}
              <span
                aria-hidden
                className={`absolute left-0 top-3 grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                  done
                    ? "bg-brand-500 text-white"
                    : isNext
                      ? "bg-white text-brand-600 ring-2 ring-brand-500 dark:bg-white/10"
                      : "bg-black/5 text-ink-500 dark:bg-white/10"
                }`}
              >
                {isQuiz
                  ? l.id === finalQuizId
                    ? "🏆"
                    : done
                      ? "★"
                      : "☆"
                  : done
                    ? "✓"
                    : isNext
                      ? "▶"
                      : i + 1}
              </span>
              <Link
                href={`/learn/${course.id}/${l.id}`}
                className={`card flex items-center gap-3 ${
                  isNext ? "border-brand-500/40 shadow-md" : done ? "opacity-90" : ""
                }`}
              >
                <span className="text-2xl">{KIND_ICON[l.kind] ?? "📘"}</span>
                <div className="flex-1">
                  <div className="font-medium">{l.title}</div>
                  <div className="text-xs capitalize text-ink-500">
                    {l.kind} · ~{l.estimated_minutes ?? 10} min
                    {done && typeof score === "number" ? ` · scored ${Math.round(score)}` : ""}
                  </div>
                </div>
                {done && (() => {
                  const m = masteryOf(l.id);
                  return m ? (
                    <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline ${m.cls}`}>
                      {m.label}
                    </span>
                  ) : null;
                })()}
                {isNext ? (
                  <span className="btn-primary px-4 py-1.5 text-xs">Start</span>
                ) : (
                  <span className="text-ink-500">›</span>
                )}
              </Link>
            </li>
          );
              })}
            </Fragment>
          );
        })}
        {/* Terminal node: the course certificate at the end of the path */}
        {list.length > 0 && (
          <li className="relative pl-10 pt-3">
            <span
              aria-hidden
              className={`absolute left-0 top-[22px] grid h-8 w-8 place-items-center rounded-full text-sm ${
                pct === 100 ? "bg-brand-500 text-white" : "bg-black/5 text-ink-500 grayscale"
              }`}
            >
              🎓
            </span>
            {pct === 100 ? (
              <Link
                href={`/certificates/${course.id}`}
                className="card flex items-center gap-3 border-brand-500/40 bg-brand-50"
              >
                <span className="text-2xl">🎓</span>
                <div className="flex-1">
                  <div className="font-medium">🎓 Certificate</div>
                  <div className="text-xs text-ink-500">Course complete — view your certificate</div>
                </div>
                <span className="text-ink-500">›</span>
              </Link>
            ) : (
              <div className="card flex items-center gap-3 opacity-60">
                <span className="text-2xl grayscale">🎓</span>
                <div className="flex-1">
                  <div className="font-medium text-ink-500">🎓 Certificate</div>
                  <div className="text-xs text-ink-500">Complete all lessons</div>
                </div>
              </div>
            )}
          </li>
        )}
      </ol>
      </div>

      {/* Desktop right rail: certificate + skills mastery */}
      <aside className="hidden space-y-4 lg:block">
        {/* Skill dimensions: progress per skill type, not one flat percent */}
        <div className="card">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">My progress</p>
          <ul className="space-y-2">
            {Object.entries(
              list.reduce<Record<string, { done: number; total: number; scoreSum: number; scored: number }>>((acc, l) => {
                const k = l.kind === "quiz" ? "checkpoints" : l.kind;
                acc[k] ??= { done: 0, total: 0, scoreSum: 0, scored: 0 };
                acc[k].total++;
                if (doneIds.has(l.id)) {
                  acc[k].done++;
                  const s = scoreById.get(l.id);
                  if (typeof s === "number") { acc[k].scoreSum += s; acc[k].scored++; }
                }
                return acc;
              }, {}),
            ).map(([kind, v]) => {
              const pctK = v.scored > 0
                ? Math.round((v.scoreSum / v.scored) * (v.done / v.total))
                : Math.round((v.done / v.total) * 100);
              return (
                <li key={kind}>
                  <div className="mb-0.5 flex justify-between text-[11px]">
                    <span className="capitalize">{kind}</span>
                    <span className="text-ink-500">{pctK}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${pctK}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="card space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Certificate</p>
          {pct === 100 ? (
            <Link href={`/certificates/${course.id}`} className="btn-primary block w-full text-center text-sm">
              🎓 View certificate
            </Link>
          ) : (
            <p className="text-sm text-ink-500">
              🎓 Finish all {list.length} lessons to earn the {course.title} certificate.
            </p>
          )}
        </div>
        <div className="card">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">Skills mastery</p>
          <ul className="space-y-1.5">
            {list.map((l) => {
              const m = masteryOf(l.id);
              return (
                <li key={l.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate">{l.title}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${m ? m.cls : "bg-black/5 text-ink-500"}`}>
                    {m?.label ?? "Not started"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
      </div>

      {/* Discussion */}
      <section className="space-y-2" data-testid="discussion">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Discussion ({(posts ?? []).length})
        </h2>
        {(posts ?? []).filter((p: any) => !p.parent_id).map((p: any) => (
          <div key={p.id} className="card space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold">{p.author?.display_name ?? "Learner"}</p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm">{p.body}</p>
              </div>
              {p.user_id === user.id && (
                <form action={deleteDiscussion}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="courseId" value={course.id} />
                  <button type="submit" className="text-xs text-ink-500 hover:text-red-600">✕</button>
                </form>
              )}
            </div>
            {(posts ?? []).filter((r: any) => r.parent_id === p.id).map((r: any) => (
              <div key={r.id} className="ml-4 border-l-2 border-black/5 pl-3 dark:border-white/10">
                <p className="text-xs font-semibold">{r.author?.display_name ?? "Learner"}</p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm">{r.body}</p>
              </div>
            ))}
            <form action={postDiscussion} className="flex gap-2">
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="parentId" value={p.id} />
              <input
                name="body"
                required
                minLength={2}
                placeholder="Reply…"
                className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm dark:bg-white/5"
              />
              <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">Reply</button>
            </form>
          </div>
        ))}
        <form action={postDiscussion} className="card flex gap-2">
          <input type="hidden" name="courseId" value={course.id} />
          <input
            name="body"
            required
            minLength={2}
            placeholder="Ask a question or start a discussion…"
            data-testid="discussion-input"
            className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:bg-white/5"
          />
          <button type="submit" className="btn-primary text-sm">Post</button>
        </form>
      </section>

      {list.length > 0 && doneCount === list.length && (
        <div className="card border-green-300 bg-green-50 text-center dark:border-green-500/30 dark:bg-green-500/10">
          <p className="text-lg font-bold">Course complete 🎓</p>
          <p className="text-sm text-ink-500">Every lesson done — keep it fresh in Review.</p>
          <div className="mt-2 flex justify-center gap-2">
            <Link href={`/certificates/${course.id}`} className="btn-primary">View certificate</Link>
            <Link href="/review" className="btn-ghost">Review now</Link>
          </div>
        </div>
      )}
    </div>
  );
}
