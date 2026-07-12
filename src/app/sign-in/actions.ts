"use server";
import { z } from "zod";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";
import { takeRateLimit } from "@/lib/rate-limit";

const Input = z.object({ email: z.string().email().max(254) });

// Magic-link requests go through the server so we can rate limit them —
// the public form was previously an open relay for spamming anyone's inbox.
// Limits: 3 links per email per 15 min, 10 requests per IP per 15 min.
export async function requestMagicLink(
  input: z.input<typeof Input>,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a valid email address" };
  const email = parsed.data.email.toLowerCase();

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";

  const [emailOk, ipOk] = await Promise.all([
    takeRateLimit(`magic:email:${email}`, 3, 900),
    takeRateLimit(`magic:ip:${ip}`, 10, 900),
  ]);
  if (!emailOk || !ipOk) {
    return {
      ok: false,
      error: "Too many sign-in requests — try again in a few minutes.",
    };
  }

  // The email link must land on /auth/callback (which exchanges the code for
  // a session) — without emailRedirectTo it lands on the Site URL root, where
  // nothing processes the code and the user never gets signed in.
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? (host ? `${proto}://${host}` : "");

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: origin ? { emailRedirectTo: `${origin}/auth/callback` } : undefined,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
