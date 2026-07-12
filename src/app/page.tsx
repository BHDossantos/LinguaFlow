import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { LANGUAGES } from "@/lib/languages";
import { TryIt } from "@/components/TryIt";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <LoggedOutLanding />;

  // First check onboarding — if no target language yet, push to /onboarding.
  const { data: target } = await supabase
    .from("target_languages")
    .select("language")
    .eq("user_id", user.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (!target) redirect("/onboarding");

  return <Dashboard userId={user.id} primaryLang={target.language} />;
}

async function Dashboard({ userId, primaryLang }: { userId: string; primaryLang: string }) {
  const supabase = await supabaseServer();
  const nowIso = new Date().toISOString();
  const since14 = new Date(Date.now() - 14 * 86_400_000).toISOString();

  // 1. Due SRS reviews + unread notifications + gamification + continue-learning.
  const [
    { count: dueReviews },
    { count: unreadNotifs },
    { data: profile },
    { data: stats },
    { data: lastProgress },
  ] = await Promise.all([
    supabase
      .from("srs_cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("due_at", nowIso),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null),
    supabase.from("profiles").select("display_name").eq("id", userId).single(),
    supabase.from("user_stats").select("streak_days,daily_goal_xp,xp,last_activity_date").eq("user_id", userId).maybeSingle(),
    supabase
      .from("lesson_progress")
      .select("completed_at,lesson:lessons(id,course_id,title)")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // Recommended: published courses in my language I'm not enrolled in yet.
  const { data: myEnrollments } = await supabase
    .from("enrollments").select("course_id").eq("user_id", userId);
  const enrolledSet = new Set((myEnrollments ?? []).map((e) => e.course_id));
  const { data: recPool } = await supabase
    .from("courses")
    .select("id,title,cefr_level,goal_tag")
    .eq("language", primaryLang)
    .eq("published", true)
    .order("position")
    .limit(12);
  const recommended = (recPool ?? []).filter((c) => !enrolledSet.has(c.id)).slice(0, 3);

  // Continue-learning card: latest course + its completion percentage.
  let resume: { courseId: string; title: string; pct: number; cefr: string | null } | null = null;
  const lastCourseId = (lastProgress as any)?.lesson?.course_id;
  if (lastCourseId) {
    const [{ data: course }, { data: courseLessons }, { data: doneRows }] = await Promise.all([
      supabase.from("courses").select("id,title,cefr_level").eq("id", lastCourseId).single(),
      supabase.from("lessons").select("id").eq("course_id", lastCourseId),
      supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .not("completed_at", "is", null),
    ]);
    if (course && courseLessons && courseLessons.length > 0) {
      const idsInCourse = new Set(courseLessons.map((l) => l.id));
      const doneInCourse = (doneRows ?? []).filter((r) => idsInCourse.has(r.lesson_id)).length;
      resume = {
        courseId: course.id,
        title: course.title,
        cefr: course.cefr_level,
        pct: Math.round((doneInCourse / courseLessons.length) * 100),
      };
    }
  }

  const firstName = (profile?.display_name ?? "there").split(" ")[0];
  const hour = new Date().getUTCHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const streak = stats?.streak_days ?? 0;
  const activeToday = stats?.last_activity_date === new Date().toISOString().slice(0, 10);
  const goalXp = stats?.daily_goal_xp ?? 50;

  // XP earned since UTC midnight — the daily goal is measured, not guessed.
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const { data: todayEvents } = await supabase
    .from("xp_events")
    .select("amount")
    .eq("user_id", userId)
    .gte("created_at", todayStart.toISOString());
  const todayXp = (todayEvents ?? []).reduce((a, e) => a + e.amount, 0);
  const goalPct = Math.min(100, Math.round((todayXp / Math.max(1, goalXp)) * 100));

  // 2. Classrooms I'm in → upcoming meetings + recent announcements.
  const { data: classroomLinks } = await supabase
    .from("classroom_members")
    .select("classroom_id,classroom:classrooms(id,name,org_id)")
    .eq("user_id", userId);
  const classroomIds = (classroomLinks ?? []).map((c: any) => c.classroom_id);
  const classroomById = new Map(
    (classroomLinks ?? []).map((c: any) => [c.classroom_id, c.classroom]),
  );

  const [{ data: upcoming }, { data: announcements }] = await Promise.all([
    classroomIds.length === 0
      ? Promise.resolve({ data: [] as any[] })
      : supabase
          .from("class_meetings")
          .select("id,title,scheduled_at,duration_minutes,classroom_id")
          .in("classroom_id", classroomIds)
          .gte("scheduled_at", nowIso)
          .order("scheduled_at", { ascending: true })
          .limit(3),
    classroomIds.length === 0
      ? Promise.resolve({ data: [] as any[] })
      : supabase
          .from("announcements")
          .select("id,body,pinned,created_at,classroom_id")
          .in("classroom_id", classroomIds)
          .order("created_at", { ascending: false })
          .limit(3),
  ]);

  // 3. Open assignments across enrolled courses.
  const { data: enrollments } = await supabase
    .from("enrollments").select("course_id").eq("user_id", userId);
  const enrolledIds = (enrollments ?? []).map((e) => e.course_id);

  const { data: openAssignments } = enrolledIds.length === 0
    ? { data: [] as any[] }
    : await supabase
        .from("assignments")
        .select(`
          id,title,due_at,
          course:courses(title),
          submissions!left(status,student_id)
        `)
        .in("course_id", enrolledIds)
        .eq("published", true)
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(30);
  const openRows = (openAssignments ?? [])
    .map((a: any) => {
      const mine = (a.submissions ?? []).find((s: any) => s.student_id === userId);
      return { ...a, status: mine?.status as string | undefined };
    })
    .filter((a) => a.status !== "returned")
    .slice(0, 4);

  // 4. Recent grades returned to me.
  const { data: returned } = await supabase
    .from("teacher_reviews")
    .select(`
      final_score,reviewed_at,
      submission:submissions!inner(
        student_id,
        assignment:assignments(title,max_score)
      )
    `)
    .eq("submission.student_id", userId)
    .gte("reviewed_at", since14)
    .order("reviewed_at", { ascending: false })
    .limit(3);

  const langInfo = (LANGUAGES as any)[primaryLang];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-sm text-ink-500">
          {langInfo ? `Learning ${langInfo.flag} ${langInfo.label}` : "Let's learn something today"}
        </p>
      </header>

      {/* Continue learning */}
      {resume ? (
        <Link
          href={`/learn/${resume.courseId}`}
          className="card block space-y-2 border-brand-500/20 bg-gradient-to-br from-brand-50 to-white dark:from-white/[0.08] dark:to-white/[0.02]"
          data-testid="continue-learning"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            Continue learning
          </p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">
              {langInfo?.flag} {resume.title}
              {resume.cefr ? <span className="ml-2 text-sm font-semibold text-brand-600">{resume.cefr}</span> : null}
            </p>
            <span className="btn-primary px-5 py-2 text-sm">Resume ▶</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-700"
              style={{ width: `${resume.pct}%` }}
            />
          </div>
          <p className="text-xs text-ink-500">{resume.pct}% complete</p>
        </Link>
      ) : (
        <Link href="/learn" className="card block text-center" data-testid="continue-learning">
          <p className="font-semibold">Pick your first course</p>
          <p className="text-xs text-ink-500">Ten minutes a day is all it takes.</p>
        </Link>
      )}

      {/* Today's goal + streak */}
      <section className="grid grid-cols-2 gap-2">
        <div className="card" data-testid="daily-goal">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Today's goal</p>
          <p className="mt-1 text-xl font-bold">
            {todayXp} <span className="text-sm font-medium text-ink-500">/ {goalXp} XP</span>
          </p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-700 ${goalPct >= 100 ? "bg-green-500" : "bg-brand-500"}`}
              style={{ width: `${goalPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-ink-500">
            {goalPct >= 100 ? "✓ goal met — great work" : `${goalPct}% there`}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Streak</p>
          <p className="mt-1 text-xl font-bold">🔥 {streak} day{streak === 1 ? "" : "s"}</p>
          <p className="text-xs text-ink-500">{activeToday ? "kept alive — nice" : "practice to keep it"}</p>
        </div>
      </section>

      {/* Weekly challenge */}
      <WeeklyChallenge userId={userId} />

      {/* Coach entry */}
      <Link
        href="/coach"
        className="card flex items-center justify-between hover:border-brand-500/30"
        data-testid="coach-entry"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-xl dark:bg-violet-500/20">🤖</span>
          <div>
            <p className="font-semibold">Coach</p>
            <p className="text-xs text-ink-500">Ask anything…</p>
          </div>
        </div>
        <span className="text-ink-500">›</span>
      </Link>

      {recommended.length > 0 && (
        <section className="space-y-2" data-testid="recommended">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Recommended for you
          </h2>
          <div className="grid gap-2">
            {recommended.map((c) => (
              <Link key={c.id} href={`/learn/${c.id}`} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-ink-500">
                    {c.cefr_level ?? ""}{c.goal_tag ? ` · ${c.goal_tag}` : ""}
                  </p>
                </div>
                <span className="text-xs font-medium text-brand-600">Explore →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-3 gap-2">
        <Link href="/review" className="card flex flex-col items-start">
          <p className="text-2xl font-bold">{dueReviews ?? 0}</p>
          <p className="text-xs text-ink-500">Reviews due</p>
        </Link>
        <Link href="/assignments" className="card flex flex-col items-start">
          <p className="text-2xl font-bold">{openRows.length}</p>
          <p className="text-xs text-ink-500">Open tasks</p>
        </Link>
        <Link href="/inbox" className="card flex flex-col items-start">
          <p className={"text-2xl font-bold " + ((unreadNotifs ?? 0) > 0 ? "text-brand-600" : "")}>
            {unreadNotifs ?? 0}
          </p>
          <p className="text-xs text-ink-500">Unread</p>
        </Link>
      </section>

      {openRows.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Up next
          </h2>
          <ul className="space-y-2">
            {openRows.map((a: any) => (
              <li key={a.id}>
                <Link
                  href={a.status ? `/assignments/${a.id}/result` : `/assignments/${a.id}`}
                  className="card flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-ink-500">
                      {a.course?.title}
                      {a.due_at ? ` · due ${new Date(a.due_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-ink-500">{a.status ?? "not started"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(upcoming ?? []).length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Upcoming classes
          </h2>
          <ul className="space-y-2">
            {(upcoming ?? []).map((m: any) => {
              const c = classroomById.get(m.classroom_id);
              return (
                <li key={m.id}>
                  <Link
                    href={`/school/${c?.org_id}/classrooms/${m.classroom_id}/meetings/${m.id}`}
                    className="card flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{m.title ?? c?.name ?? "Class"}</p>
                      <p className="text-xs text-ink-500">
                        {new Date(m.scheduled_at).toLocaleString()} · {m.duration_minutes} min
                      </p>
                    </div>
                    <span className="text-ink-500">›</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {(announcements ?? []).length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Announcements
          </h2>
          <ul className="space-y-2">
            {(announcements ?? []).map((a: any) => {
              const c = classroomById.get(a.classroom_id);
              return (
                <li key={a.id} className="card space-y-1">
                  <p className="text-xs text-ink-500">
                    {a.pinned && <span className="mr-1 text-brand-500">📌</span>}
                    {c?.name ?? "Classroom"} · {new Date(a.created_at).toLocaleDateString()}
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{a.body}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {(returned ?? []).length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Recently graded
          </h2>
          <ul className="space-y-2">
            {(returned ?? []).map((r: any, i: number) => (
              <li key={i} className="card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.submission?.assignment?.title}</p>
                  <p className="text-xs text-ink-500">
                    {new Date(r.reviewed_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {r.final_score}/{r.submission?.assignment?.max_score ?? 100}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-2 gap-2">
        <Link href="/learn" className="card flex items-center gap-2">
          <span>📚</span><span className="text-sm font-medium">Lessons</span>
        </Link>
        <Link href="/practice" className="card flex items-center gap-2">
          <span>💬</span><span className="text-sm font-medium">System roleplay</span>
        </Link>
        <Link href="/translate" className="card flex items-center gap-2">
          <span>🌐</span><span className="text-sm font-medium">Translate</span>
        </Link>
        <Link href="/tutors" className="card flex items-center gap-2">
          <span>🧑‍🏫</span><span className="text-sm font-medium">Live tutors</span>
        </Link>
      </section>
    </div>
  );
}

function LoggedOutLanding() {
  return (
    <div className="space-y-16 pb-8 pt-4 sm:space-y-24 sm:pt-8">
      {/* Hero: copy left, live demo right on desktop */}
      <header className="hero-bg relative -mx-4 overflow-hidden rounded-b-[2.5rem] px-4 py-12 sm:-mx-6 sm:rounded-[2.5rem] sm:px-10 sm:py-16 lg:px-14">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <p className="animate-fade-up inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-700 backdrop-blur dark:bg-white/10 dark:text-brand-100">
              🗣️ Speak from day one
            </p>
            <h1 className="animate-fade-up mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl [animation-delay:60ms]">
              Speak.
              <br />
              <span className="bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent">
                Don't just tap.
              </span>
            </h1>
            <p className="animate-fade-up mx-auto mt-5 max-w-md text-lg text-ink-500 dark:text-white/70 lg:mx-0 [animation-delay:120ms]">
              Say a phrase, get scored word-by-word, fix it on the spot.
              Lessons, roleplay, and live instructors — one app.
            </p>
            <div className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start [animation-delay:180ms]">
              <Link href="/sign-in" className="btn-primary w-full px-8 py-3.5 text-lg shadow-lg shadow-brand-500/25 sm:w-auto">
                Start learning free
              </Link>
              <a href="#how" className="btn-ghost w-full px-8 py-3.5 sm:w-auto">
                How it works
              </a>
            </div>
            <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start [animation-delay:240ms]">
              {Object.entries(LANGUAGES).map(([code, l]) => (
                <span
                  key={code}
                  className="rounded-full bg-white/70 px-3 py-1 text-sm backdrop-blur dark:bg-white/10"
                >
                  <span aria-hidden>{l.flag}</span> {l.label}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-fade-up mx-auto w-full max-w-md [animation-delay:300ms]">
            <TryIt />
          </div>
        </div>
      </header>

      {/* Honest proof points */}
      <section className="mx-auto grid max-w-3xl grid-cols-3 gap-3 text-center">
        <div className="card py-5">
          <p className="text-3xl font-extrabold text-brand-600">5</p>
          <p className="mt-1 text-xs text-ink-500">languages</p>
        </div>
        <div className="card py-5">
          <p className="text-3xl font-extrabold text-brand-600">3×</p>
          <p className="mt-1 text-xs text-ink-500">practice modes per word</p>
        </div>
        <div className="card py-5">
          <p className="text-3xl font-extrabold text-brand-600">0s</p>
          <p className="mt-1 text-xs text-ink-500">wait for feedback</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-5xl space-y-8">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">How Noelia works</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          <li className="card space-y-2 p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-lg font-extrabold text-brand-600 dark:bg-white/10">1</span>
            <p className="text-lg font-semibold">Learn it three ways</p>
            <p className="text-sm text-ink-500">
              Every word is drilled by recognizing, recalling, and listening —
              then scheduled for review right before you'd forget it.
            </p>
          </li>
          <li className="card space-y-2 p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-lg font-extrabold text-brand-600 dark:bg-white/10">2</span>
            <p className="text-lg font-semibold">Say it out loud</p>
            <p className="text-sm text-ink-500">
              Pronunciation is scored word-by-word in real time, and system
              roleplay puts you in real scenes — cafés, interviews, travel.
            </p>
          </li>
          <li className="card space-y-2 p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-lg font-extrabold text-brand-600 dark:bg-white/10">3</span>
            <p className="text-lg font-semibold">Level up with humans</p>
            <p className="text-sm text-ink-500">
              Connect to a live instructor per-minute, or learn inside a real
              classroom with teacher feedback and family visibility.
            </p>
          </li>
        </ol>
      </section>

      {/* Feature grid */}
      <section className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-2xl dark:bg-amber-500/20">📚</span>
          <p className="mt-3 font-semibold">Self-study</p>
          <p className="mt-1 text-sm text-ink-500">Adaptive lessons + spaced repetition.</p>
        </div>
        <div className="card p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-2xl dark:bg-violet-500/20">💬</span>
          <p className="mt-3 font-semibold">System roleplay</p>
          <p className="mt-1 text-sm text-ink-500">Real conversations, no judgment.</p>
        </div>
        <div className="card p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-2xl dark:bg-emerald-500/20">🧑‍🏫</span>
          <p className="mt-3 font-semibold">Live instructor</p>
          <p className="mt-1 text-sm text-ink-500">Per-minute, instant connect.</p>
        </div>
        <div className="card p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-2xl dark:bg-sky-500/20">🌐</span>
          <p className="mt-3 font-semibold">Real-time translate</p>
          <p className="mt-1 text-sm text-ink-500">Voice, text, and on the go.</p>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-5xl space-y-8">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Made for how you learn</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-6 text-center">
            <span className="text-4xl">🎧</span>
            <p className="mt-2 text-lg font-semibold">Self-learners</p>
            <p className="mt-1 text-sm text-ink-500">
              Ten minutes a day. Your queue always knows what's next.
            </p>
          </div>
          <div className="card p-6 text-center">
            <span className="text-4xl">🏫</span>
            <p className="mt-2 text-lg font-semibold">Classrooms</p>
            <p className="mt-1 text-sm text-ink-500">
              Teachers assign, the system grades in seconds, teachers review.
            </p>
          </div>
          <div className="card p-6 text-center">
            <span className="text-4xl">👨‍👩‍👧</span>
            <p className="mt-2 text-lg font-semibold">Families</p>
            <p className="mt-1 text-sm text-ink-500">
              Parents follow progress, grades, and attendance — no nagging.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="hero-bg -mx-4 rounded-t-[2.5rem] px-4 py-14 text-center sm:-mx-6 sm:rounded-[2.5rem]">
        <h2 className="text-3xl font-extrabold sm:text-4xl">
          Your first phrase is 30 seconds away.
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-ink-500 dark:text-white/70">
          Free to start. No credit card. Works on any phone.
        </p>
        <Link
          href="/sign-in"
          className="btn-primary mt-7 inline-block px-12 py-3.5 text-lg shadow-lg shadow-brand-500/25"
        >
          Start learning free
        </Link>
        <p className="mt-6 text-xs text-ink-500">
          <Link href="/pricing" className="underline underline-offset-2">Pricing</Link>
          {" · "}
          <Link href="/legal/privacy" className="underline underline-offset-2">Privacy</Link>
          {" · "}
          <Link href="/legal/terms" className="underline underline-offset-2">Terms</Link>
        </p>
      </section>
    </div>
  );
}

async function WeeklyChallenge({ userId }: { userId: string }) {
  const supabase = await supabaseServer();
  const TARGET = 300;
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data } = await supabase
    .from("xp_events")
    .select("amount")
    .eq("user_id", userId)
    .gte("created_at", since);
  const earned = (data ?? []).reduce((a, e) => a + e.amount, 0);
  const pct = Math.min(100, Math.round((earned / TARGET) * 100));
  return (
    <div className="card" data-testid="weekly-challenge">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
          Weekly challenge
        </p>
        <span className="text-xs text-ink-500">{earned} / {TARGET} XP</span>
      </div>
      <p className="mt-1 text-sm font-medium">
        {pct >= 100 ? "🏅 Challenge complete — legend." : `Earn ${TARGET} XP this week`}
      </p>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-amber-500" : "bg-violet-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
