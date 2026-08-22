"use server";
import { recordRetentionResult } from "@/lib/retention";

// Persist a retention check. Each entry is one skill's fraction-correct (0..1);
// the mastery engine keeps it mastered on a pass and drops it to remediation on
// a fail. Best-effort per skill so one bad write can't lose the rest.
export async function submitRetentionAction(results: { lessonId: string; score: number }[]) {
  for (const r of results ?? []) {
    if (!r?.lessonId || typeof r.score !== "number") continue;
    try {
      await recordRetentionResult(r.lessonId, Math.max(0, Math.min(1, r.score)));
    } catch {
      // keep going — a single failed write must not sink the session
    }
  }
  return { ok: true };
}
