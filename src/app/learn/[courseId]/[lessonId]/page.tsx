import { supabaseServer } from "@/lib/supabase/server";
import { LessonPlayer } from "@/components/LessonPlayer";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const supabase = supabaseServer();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", params.lessonId)
    .single();

  if (!lesson) return <p>Lesson not found.</p>;

  return <LessonPlayer lesson={lesson} courseId={params.courseId} />;
}
