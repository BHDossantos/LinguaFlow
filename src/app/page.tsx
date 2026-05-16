import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { LANGUAGES } from "@/lib/languages";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = supabaseServer();
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
  const supabase = supabaseServer();
  const nowIso = new Date().toISOString();
  const since14 = new Date(Date.now() - 14 * 86_400_000).toISOString();

  // 1. Due SRS reviews.
  const { count: dueReviews } = await supabase
    .from("srs_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .lte("due_at", nowIso);

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
        <p className="text-sm text-ink-500">Welcome back</p>
        <h1 className="text-2xl font-bold">
          {langInfo ? `${langInfo.flag} ${langInfo.label}` : "Today"}
        </h1>
      </header>

      <section className="grid grid-cols-2 gap-2">
        <Link href="/review" className="card flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{dueReviews ?? 0}</p>
            <p className="text-xs text-ink-500">Reviews due</p>
          </div>
          <span className="text-2xl">🔁</span>
        </Link>
        <Link href="/assignments" className="card flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{openRows.length}</p>
            <p className="text-xs text-ink-500">Open assignments</p>
          </div>
          <span className="text-2xl">📝</span>
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
          <span>💬</span><span className="text-sm font-medium">AI roleplay</span>
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
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-ink-500">Bienvenido / Bem-vindo / Bienvenue</p>
        <h1 className="text-3xl font-bold tracking-tight">Speak. Don't just tap.</h1>
        <p className="text-ink-500">
          Adaptive lessons, AI roleplay, and live instructors — one app.
        </p>
      </header>

      <Link href="/sign-in" className="btn-primary block w-full text-center">
        Get started
      </Link>

      <section className="grid grid-cols-2 gap-3">
        <div className="card">
          <span className="text-2xl">📚</span>
          <p className="mt-1 font-semibold">Self-study</p>
          <p className="text-xs text-ink-500">Adaptive lessons + spaced repetition.</p>
        </div>
        <div className="card">
          <span className="text-2xl">🧑‍🏫</span>
          <p className="mt-1 font-semibold">Live instructor</p>
          <p className="text-xs text-ink-500">Per-minute, instant connect.</p>
        </div>
        <div className="card">
          <span className="text-2xl">💬</span>
          <p className="mt-1 font-semibold">AI roleplay</p>
          <p className="text-xs text-ink-500">Real conversations, no judgment.</p>
        </div>
        <div className="card">
          <span className="text-2xl">🌐</span>
          <p className="mt-1 font-semibold">Real-time translate</p>
          <p className="text-xs text-ink-500">Voice, text, and on the go.</p>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-500">
          Languages
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(LANGUAGES).map(([code, l]) => (
            <span key={code} className="card flex items-center gap-2 px-3 py-2">
              <span aria-hidden>{l.flag}</span>
              <span className="text-sm">{l.label}</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
