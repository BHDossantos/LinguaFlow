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
  await supabase
    .from("lesson_progress")
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
      score,
    });
}
