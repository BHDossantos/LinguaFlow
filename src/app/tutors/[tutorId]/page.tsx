import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { LANGUAGES } from "@/lib/languages";

export const dynamic = "force-dynamic";

// Tutor profile: everything a student wants to know before spending money —
// who they are, what they teach, what it costs, and whether they're online.
export default async function TutorProfilePage(props: {
  params: Promise<{ tutorId: string }>;
}) {
  const { tutorId } = await props.params;
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();

  const [{ data: tutor }, { count: sessionsTaught }, { data: mySessions }] =
    await Promise.all([
      supabase
        .from("tutors")
        .select("id,display_name,bio,languages,dialects,rate_cents_per_minute,rating,is_online")
        .eq("id", tutorId)
        .maybeSingle(),
      supabase
        .from("tutor_sessions")
        .select("id", { count: "exact", head: true })
        .eq("tutor_id", tutorId)
        .eq("status", "ended"),
      supabase
        .from("tutor_sessions")
        .select("id,started_at,minutes_billed,cents_charged,status")
        .eq("tutor_id", tutorId)
        .eq("student_id", user.id)
        .order("started_at", { ascending: false })
        .limit(5),
    ]);

  if (!tutor) notFound();

  return (
    <div className="space-y-4">
      <Link href="/tutors" className="text-sm text-brand-500">← All instructors</Link>

      <header className="card flex items-start gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-2xl font-bold text-white">
          {tutor.display_name?.[0] ?? "T"}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{tutor.display_name}</h1>
            <span className={`text-xs font-medium ${tutor.is_online ? "text-green-600" : "text-ink-500"}`}>
              {tutor.is_online ? "● Online now" : "Offline"}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-500">{tutor.bio || "No bio yet."}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(tutor.languages ?? []).map((code: string) => (
              <span key={code} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                {(LANGUAGES as any)[code]?.flag} {(LANGUAGES as any)[code]?.label ?? code}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="card py-3">
          <p className="text-xl font-extrabold">★ {tutor.rating ? tutor.rating.toFixed(1) : "New"}</p>
          <p className="text-[11px] text-ink-500">rating</p>
        </div>
        <div className="card py-3">
          <p className="text-xl font-extrabold">{sessionsTaught ?? 0}</p>
          <p className="text-[11px] text-ink-500">sessions taught</p>
        </div>
        <div className="card py-3">
          <p className="text-xl font-extrabold">${(tutor.rate_cents_per_minute / 100).toFixed(2)}</p>
          <p className="text-[11px] text-ink-500">per minute</p>
        </div>
      </section>

      {(tutor.dialects ?? []).length > 0 && (
        <section className="card">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500">Dialects</p>
          <p className="text-sm">{tutor.dialects.join(" · ")}</p>
        </section>
      )}

      <section className="card space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">How sessions work</p>
        <p className="text-sm text-ink-500">
          Live video, billed per minute with a budget cap you set up front. Your
          tutor sees your lesson history, weak grammar, and recent vocabulary —
          no time wasted re-explaining where you are.
        </p>
      </section>

      {(mySessions ?? []).length > 0 && (
        <section className="card">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
            Your past sessions with {tutor.display_name}
          </p>
          <ul className="space-y-1 text-sm">
            {(mySessions ?? []).map((s) => (
              <li key={s.id} className="flex justify-between">
                <span>{s.started_at ? new Date(s.started_at).toLocaleDateString() : "—"}</span>
                <span className="text-ink-500">
                  {s.minutes_billed} min · ${(s.cents_charged / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href={`/tutors/${tutor.id}/connect`}
        className={`btn-primary block w-full text-center ${tutor.is_online ? "" : "pointer-events-none opacity-50"}`}
      >
        {tutor.is_online ? "Connect now" : "Currently offline"}
      </Link>
    </div>
  );
}
