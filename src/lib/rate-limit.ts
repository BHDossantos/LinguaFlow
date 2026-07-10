import { supabaseServer } from "@/lib/supabase/server";

// DB-backed fixed-window limiter (works across serverless instances).
// Fails OPEN on infrastructure errors: a broken limiter should degrade to
// "no limit", never to "nobody can sign in".
export async function takeRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.rpc("take_rate_limit", {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) return true;
    return data !== false;
  } catch {
    return true;
  }
}
