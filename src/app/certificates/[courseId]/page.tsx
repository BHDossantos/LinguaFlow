import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { LANGUAGES } from "@/lib/languages";
import { PrintTrigger } from "./PrintTrigger";

export const dynamic = "force-dynamic";
export const metadata = { title: "Certificate" };

// Certificate of completion. Server-validated: renders only when the signed-in
// learner has completed every lesson in the course — the URL can't be used to
// fake one. The reference code is deterministic (user+course) so a certificate
// can be re-opened and matches what was shown before.
export default async function CertificatePage(props: {
  params: Promise<{ courseId: string }>;
}) {
  const params = await props.params;
  const user = await requireUser();
  const supabase = await supabaseServer();

  const [{ data: course }, { data: lessons }, { data: progress }, { data: profile }] =
    await Promise.all([
      supabase.from("courses").select("id,title,language,cefr_level").eq("id", params.courseId).single(),
      supabase.from("lessons").select("id").eq("course_id", params.courseId),
      supabase
        .from("lesson_progress")
        .select("lesson_id,completed_at")
        .eq("user_id", user.id)
        .not("completed_at", "is", null),
      supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    ]);

  if (!course || !lessons || lessons.length === 0) notFound();
  const doneIds = new Set((progress ?? []).map((p) => p.lesson_id));
  const allDone = lessons.every((l) => doneIds.has(l.id));
  if (!allDone) notFound();

  const completions = (progress ?? [])
    .filter((p) => doneIds.has(p.lesson_id))
    .map((p) => new Date(p.completed_at as string).getTime());
  const completedOn = new Date(Math.max(...completions));
  const ref = `NOE-${user.id.slice(0, 8)}-${course.id.slice(0, 8)}`.toUpperCase();
  const lang = (LANGUAGES as any)[course.language];

  return (
    <div className="space-y-4">
      <Link href="/profile" className="text-sm text-brand-500 print:hidden">← Profile</Link>

      <div
        data-testid="certificate"
        className="rounded-3xl border-4 border-double border-brand-500/40 bg-white p-8 text-center shadow-xl dark:bg-white/[0.04] print:border-black/30 print:shadow-none"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 text-3xl font-extrabold text-white">
          N
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-ink-500">
          Certificate of completion
        </p>
        <h1 className="mt-4 text-3xl font-extrabold">{profile?.display_name ?? "Learner"}</h1>
        <p className="mt-2 text-sm text-ink-500">has completed every lesson of</p>
        <p className="mt-1 text-xl font-bold">
          {lang?.flag} {course.title}
          {course.cefr_level ? <span className="ml-2 text-base text-brand-600">{course.cefr_level}</span> : null}
        </p>
        <p className="mt-4 text-sm text-ink-500">
          {completedOn.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>
        <p className="mt-6 text-[10px] tracking-widest text-ink-500">
          Noelia · learnnoelia.com · ref {ref}
        </p>
      </div>

      <PrintTrigger />
    </div>
  );
}
