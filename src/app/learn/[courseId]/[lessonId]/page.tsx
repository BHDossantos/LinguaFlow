import { supabaseServer } from "@/lib/supabase/server";
import { LessonPlayer } from "@/components/LessonPlayer";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const supabase = supabaseServer();
  const [{ data: lesson }, { data: course }] = await Promise.all([
    supabase.from("lessons").select("*").eq("id", params.lessonId).single(),
    supabase
      .from("courses")
      .select("language,dialect")
      .eq("id", params.courseId)
      .single(),
  ]);

  if (!lesson || !course) return <p>Lesson not found.</p>;

  return (
    <LessonPlayer
      lesson={lesson}
      courseId={params.courseId}
      language={course.language}
      dialect={course.dialect}
    />
  );
}
