import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Calendar: everything with a date in one place — upcoming live classes from
// the user's classrooms, plus assignment deadlines from enrolled courses.
export default async function CalendarPage() {
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();
  const nowIso = new Date().toISOString();

  // Classrooms I'm a member of → upcoming meetings.
  const { data: classroomLinks } = await supabase
    .from("classroom_members")
    .select("classroom_id,classroom:classrooms(id,name,org_id)")
    .eq("user_id", user.id);
  const classroomIds = (classroomLinks ?? []).map((c: any) => c.classroom_id);
  const classroomById = new Map(
    (classroomLinks ?? []).map((c: any) => [c.classroom_id, c.classroom]),
  );

  // Courses I'm enrolled in → upcoming assignment deadlines.
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", user.id);
  const courseIds = (enrollments ?? []).map((e) => e.course_id);

  const [{ data: meetings }, { data: assignments }] = await Promise.all([
    classroomIds.length === 0
      ? Promise.resolve({ data: [] as any[] })
      : supabase
          .from("class_meetings")
          .select("id,title,scheduled_at,duration_minutes,classroom_id")
          .in("classroom_id", classroomIds)
          .gte("scheduled_at", nowIso)
          .order("scheduled_at", { ascending: true })
          .limit(20),
    courseIds.length === 0
      ? Promise.resolve({ data: [] as any[] })
      : supabase
          .from("assignments")
          .select("id,title,kind,due_at,course:courses(title)")
          .in("course_id", courseIds)
          .eq("published", true)
          .gt("due_at", nowIso)
          .order("due_at", { ascending: true })
          .limit(20),
  ]);

  const upcomingMeetings = meetings ?? [];
  const deadlines = assignments ?? [];

  const daysLeft = (iso: string) => {
    const ms = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86_400_000));
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-ink-500">
          Live classes and deadlines, so nothing sneaks up on you.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Upcoming live classes
        </h2>
        {upcomingMeetings.length === 0 ? (
          <div className="card text-sm text-ink-500">
            No live classes on the horizon. When a teacher schedules one for a
            classroom you&apos;re in, it lands here.
            <Link href="/school" className="mt-2 block text-brand-600">Go to School →</Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {upcomingMeetings.map((m: any) => {
              const c = classroomById.get(m.classroom_id);
              return (
                <li key={m.id}>
                  <Link
                    href={`/school/${c?.org_id}/classrooms/${m.classroom_id}/meetings/${m.id}`}
                    className="card flex items-center justify-between hover:border-brand-500/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{m.title ?? c?.name ?? "Class"}</p>
                      <p className="text-xs text-ink-500">
                        {c?.name ?? "Classroom"} ·{" "}
                        {m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : "TBA"}
                        {m.duration_minutes ? ` · ${m.duration_minutes} min` : ""}
                      </p>
                    </div>
                    <span className="text-ink-500">›</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Assignment deadlines
        </h2>
        {deadlines.length === 0 ? (
          <div className="card text-sm text-ink-500">
            Nothing due — no upcoming deadlines in your enrolled courses.
            <Link href="/assignments" className="mt-2 block text-brand-600">
              All assignments →
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {deadlines.map((a: any) => {
              const left = a.due_at ? daysLeft(a.due_at) : null;
              return (
                <li key={a.id}>
                  <Link
                    href={`/assignments/${a.id}`}
                    className="card flex items-center justify-between hover:border-brand-500/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.title}</p>
                      <p className="text-xs text-ink-500">
                        {a.course?.title ?? "—"} · {a.kind}
                        {a.due_at ? ` · due ${new Date(a.due_at).toLocaleString()}` : ""}
                      </p>
                    </div>
                    {left != null && (
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          left <= 1
                            ? "bg-red-50 text-red-600"
                            : left <= 3
                              ? "bg-amber-50 text-amber-600"
                              : "bg-brand-50 text-brand-600"
                        }`}
                      >
                        {left === 0 ? "Due today" : left === 1 ? "1 day left" : `${left} days left`}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
