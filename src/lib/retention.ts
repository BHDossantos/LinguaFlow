import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { recordMasteryEvent } from "@/lib/mastery";

// Delayed retention checks (spec §7/§27) — the mechanism behind the product's
// one rule: mastery only counts if it lasts. A skill that reached `mastered`
// becomes DUE for a re-check 14 days after its last evidence; `last_event_at`
// doubles as the next-check gate, so passing a check resets the clock and the
// skill won't resurface for another 14 days.

export const RETENTION_DELAY_DAYS = 14;
export const RETENTION_PASS = 0.8; // fraction correct to keep the skill mastered

export type RetentionQuestion = {
  id: number;
  lessonId: string;
  lessonTitle: string;
  courseId: string | null;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string | null;
};

// Skills the signed-in learner has mastered and not re-checked in 14+ days, that
// still have questions in the item bank. Returns up to `maxQuestions` items
// (at most `perLesson` per skill), newest-mastered first.
export async function getDueRetention(
  maxQuestions = 8,
  perLesson = 2,
): Promise<RetentionQuestion[]> {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const cutoff = new Date(Date.now() - RETENTION_DELAY_DAYS * 86_400_000).toISOString();
    const { data: due } = await supabase
      .from("skill_states")
      .select("skill_id,last_event_at")
      .eq("user_id", user.id)
      .eq("skill_kind", "lesson")
      .eq("status", "mastered")
      .lte("last_event_at", cutoff)
      .order("last_event_at", { ascending: false })
      .limit(40);

    const lessonIds = (due ?? []).map((d) => d.skill_id);
    if (lessonIds.length === 0) return [];

    const [{ data: questions }, { data: lessons }] = await Promise.all([
      supabase
        .from("questions")
        .select("id,lesson_id,course_id,prompt,options,answer,explanation")
        .in("lesson_id", lessonIds),
      supabase.from("lessons").select("id,title").in("id", lessonIds),
    ]);

    const titleById = new Map((lessons ?? []).map((l: any) => [l.id, l.title]));
    // Preserve due order (most-recently-mastered first), cap per lesson + total.
    const perLessonCount = new Map<string, number>();
    const byLesson = new Map<string, any[]>();
    for (const q of questions ?? []) {
      if (!byLesson.has(q.lesson_id)) byLesson.set(q.lesson_id, []);
      byLesson.get(q.lesson_id)!.push(q);
    }

    const out: RetentionQuestion[] = [];
    for (const lessonId of lessonIds) {
      const qs = byLesson.get(lessonId);
      if (!qs) continue;
      for (const q of qs) {
        const n = perLessonCount.get(lessonId) ?? 0;
        if (n >= perLesson) break;
        const opts = Array.isArray(q.options) ? q.options : [];
        if (opts.length === 0 || typeof q.answer !== "number") continue;
        out.push({
          id: q.id,
          lessonId,
          lessonTitle: titleById.get(lessonId) ?? "Mastered skill",
          courseId: q.course_id ?? null,
          prompt: q.prompt,
          options: opts,
          answer: q.answer,
          explanation: q.explanation ?? null,
        });
        perLessonCount.set(lessonId, n + 1);
        if (out.length >= maxQuestions) return out;
      }
    }
    return out;
  } catch {
    return [];
  }
}

// Count how many skills are due right now (for badges/nudges), cheaply.
export async function countDueRetention(): Promise<number> {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;
    const cutoff = new Date(Date.now() - RETENTION_DELAY_DAYS * 86_400_000).toISOString();
    const { count } = await supabase
      .from("skill_states")
      .select("skill_id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("skill_kind", "lesson")
      .eq("status", "mastered")
      .lte("last_event_at", cutoff);
    return count ?? 0;
  } catch {
    return 0;
  }
}

// Record one skill's retention result. A passing score keeps the skill mastered
// and resets its 14-day clock; a weak one drops it to remediation (via the
// mastery engine's conservative rule). One mastery_event per skill, tagged
// 'retention' so the north-star can count skills that lasted.
export async function recordRetentionResult(lessonId: string, score: number): Promise<void> {
  await recordMasteryEvent({
    skillId: lessonId,
    skillKind: "lesson",
    eventType: "retention",
    score,
  });
}
