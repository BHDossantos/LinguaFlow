"use server";
import { rateCardForUser, type RateInput } from "@/lib/srs-server";
import { supabaseServer } from "@/lib/supabase/server";
import { XP } from "@/lib/gamification";

export async function rateCardAction(input: RateInput) {
  const result = await rateCardForUser(input);
  const supabase = await supabaseServer();
  // Best-effort XP — a failed award must never break the review itself.
  await supabase.rpc("award_xp", { p_amount: XP.cardReview, p_kind: "card_review" });
  return result;
}

export async function completeLessonAction(lessonId: string, score: number) {
  const supabase = await supabaseServer();
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

  const { data: award } = await supabase.rpc("award_xp", {
    p_amount: XP.lessonComplete,
    p_kind: "lesson_complete",
  });
  return award?.[0] ?? null;
}
