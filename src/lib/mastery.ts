// Mastery engine (Learning-OS phase 1). Records evidence and derives an
// evidence-based skill state, so the product can ask "can they recall, explain,
// and apply this?" instead of only "did they finish?". See docs/LEARNING_OS.md.
import { supabaseServer } from "@/lib/supabase/server";

export type SkillStatus =
  | "not_introduced" | "introduced" | "developing" | "proficient"
  | "mastered" | "fragile" | "decaying" | "needs_remediation";

export type MasteryEvent = {
  skillId: string;
  skillKind?: "lesson" | "concept" | "skill";
  eventType: "lesson_complete" | "quiz" | "review" | "diagnostic" | "transfer" | "retention";
  score?: number;          // 0..1
  correct?: boolean;
  attempts?: number;
  hintsUsed?: number;
  confidence?: number;     // 1..5
  responseMs?: number;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Derive the next skill status from accumulated strength (an EMA of scores) and
 * the latest score. Deliberately conservative: mastery requires sustained high
 * performance, and one weak attempt drops a skill to remediation — the whole
 * point of a mastery model (spec §6).
 */
export function computeStatus(prev: SkillStatus, strength: number, lastScore: number): SkillStatus {
  if (lastScore < 0.6) return "needs_remediation";
  if (strength >= 0.9 && (prev === "proficient" || prev === "mastered" || prev === "fragile")) {
    return "mastered";
  }
  if (strength >= 0.8) return "proficient";
  if (strength >= 0.5) return "developing";
  return "introduced";
}

/**
 * Record one graded interaction and update the learner's skill state.
 * Best-effort: never throws into the learning flow (a mastery write must not
 * break completing a lesson). Silently no-ops when the tables aren't migrated
 * yet or the user is signed out.
 */
export async function recordMasteryEvent(ev: MasteryEvent): Promise<void> {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const kind = ev.skillKind ?? "lesson";
    const score = ev.score != null ? clamp01(ev.score) : (ev.correct ? 1 : 0);

    // Log the evidence.
    await supabase.from("mastery_events").insert({
      user_id: user.id,
      skill_id: ev.skillId,
      skill_kind: kind,
      event_type: ev.eventType,
      score,
      correct: ev.correct ?? null,
      attempts: ev.attempts ?? null,
      hints_used: ev.hintsUsed ?? null,
      confidence: ev.confidence ?? null,
      response_ms: ev.responseMs ?? null,
    });

    // Recompute the rolling state.
    const { data: existing } = await supabase
      .from("skill_states")
      .select("status,strength,attempts,best_score")
      .eq("user_id", user.id)
      .eq("skill_id", ev.skillId)
      .maybeSingle();

    const prevStatus = (existing?.status as SkillStatus) ?? "not_introduced";
    const prevStrength = existing?.strength ?? 0;
    const attempts = (existing?.attempts ?? 0) + 1;
    // EMA: weight history but let recent evidence move the needle.
    const strength = existing ? clamp01(prevStrength * 0.6 + score * 0.4) : score;
    const bestScore = Math.max(existing?.best_score ?? 0, score);
    const status = computeStatus(prevStatus, strength, score);

    await supabase.from("skill_states").upsert({
      user_id: user.id,
      skill_id: ev.skillId,
      skill_kind: kind,
      status,
      strength,
      attempts,
      best_score: bestScore,
      last_score: score,
      last_event_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Never surface a mastery-tracking failure to the learner.
  }
}
