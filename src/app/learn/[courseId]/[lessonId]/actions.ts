"use server";
import { rateCardForUser, type RateInput } from "@/lib/srs-server";
import { supabaseServer } from "@/lib/supabase/server";

export async function rateCardAction(input: RateInput) {
  return rateCardForUser(input);
}

export async function completeLessonAction(lessonId: string, score: number) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: lesson } = await supabase
    .from("lessons").select("course_id").eq("id", lessonId).single();

  await supabase
    .from("lesson_progress")
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
      score,
    });

  if (lesson?.course_id) {
    await supabase
      .from("enrollments")
      .upsert(
        { user_id: user.id, course_id: lesson.course_id, role: "student" },
        { onConflict: "user_id,course_id", ignoreDuplicates: true },
      );
  }
}
