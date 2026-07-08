import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { EnrollButton } from "@/components/EnrollButton";

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

export default async function CoursePage(props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();
  const [{ data: course }, { data: lessons }, { data: enrollment }] = await Promise.all([
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
  ]);

  if (!course) return <p>Course not found.</p>;
  const enrolled = !!enrollment;

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <Link href="/learn" className="text-sm text-brand-500">← All courses</Link>
          <h1 className="mt-2 text-2xl font-bold">{course.title}</h1>
          <p className="text-sm text-ink-500">{course.description}</p>
        </div>
        <EnrollButton courseId={course.id} enrolled={enrolled} />
      </header>

      <ol className="space-y-2">
        {(lessons ?? []).map((l) => (
          <li key={l.id}>
            <Link
              href={`/learn/${course.id}/${l.id}`}
              className="card flex items-center gap-3"
            >
              <span className="text-2xl">{KIND_ICON[l.kind] ?? "📘"}</span>
              <div className="flex-1">
                <div className="font-medium">{l.position}. {l.title}</div>
                <div className="text-xs text-ink-500 capitalize">
                  {l.kind} · ~{l.estimated_minutes} min
                </div>
              </div>
              <span className="text-ink-500">›</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
