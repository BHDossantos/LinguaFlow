import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

// Lightweight experimentation framework (spec §28).
//
// Assignment is DETERMINISTIC: a stable hash of (userId, experimentKey) buckets
// the learner into a variant, so the same person always sees the same variant
// without a database read — and, once recorded, the exposure row pins it even if
// the config's weights later change. Outcomes are measured by joining exposures
// to the mastery tables (see /admin/experiments).

// FNV-1a (32-bit). Small, fast, well-distributed — plenty for bucketing.
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Pure, testable assignment. Weighted by `weights` when provided and valid,
// otherwise an equal split. Buckets over 10000 for fine-grained weights.
export function pickVariant(
  userId: string,
  key: string,
  variants: string[],
  weights?: number[] | null,
): string {
  if (variants.length === 0) return "control";
  if (variants.length === 1) return variants[0];
  const bucket = fnv1a(`${userId}:${key}`) % 10000;
  const w =
    weights && weights.length === variants.length && weights.every((n) => n >= 0) && weights.some((n) => n > 0)
      ? weights
      : variants.map(() => 1);
  const total = w.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < variants.length; i++) {
    acc += (w[i] / total) * 10000;
    if (bucket < acc) return variants[i];
  }
  return variants[variants.length - 1];
}

// Server-side: return the current user's variant for `key`, recording an
// exposure the first time. Returns null when there is no user, the experiment
// is missing/disabled, or anything fails — callers should treat null as the
// control path. Never throws.
export async function assignVariant(key: string): Promise<string | null> {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: exp } = await supabase
      .from("experiments")
      .select("variants,weights,enabled")
      .eq("key", key)
      .maybeSingle();
    if (!exp || exp.enabled === false) return null;

    const variants: string[] =
      Array.isArray(exp.variants) && exp.variants.length ? exp.variants : ["control", "treatment"];

    // Reuse a prior assignment so the variant is stable for this learner even if
    // the config changes.
    const { data: prior } = await supabase
      .from("experiment_exposures")
      .select("variant")
      .eq("user_id", user.id)
      .eq("experiment_key", key)
      .maybeSingle();
    if (prior?.variant) return prior.variant;

    const variant = pickVariant(user.id, key, variants, exp.weights ?? null);
    // Best-effort record; a race (two tabs) just loses the duplicate insert.
    await supabase
      .from("experiment_exposures")
      .insert({ user_id: user.id, experiment_key: key, variant });
    return variant;
  } catch {
    return null;
  }
}
