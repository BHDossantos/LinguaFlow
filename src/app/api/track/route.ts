import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { takeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Body = z.object({
  name: z.enum(["page_view", "tryit_scored", "signup_started"]),
  path: z.string().max(300).optional(),
});

// Fire-and-forget product beacon. Public (page views matter most pre-signup),
// rate-limited per IP, inserts via service role because analytics_events has
// no RLS policies — browsers can't write or read it directly.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await takeRateLimit(`track:${ip}`, 120, 600))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: true });

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
  await admin.from("analytics_events").insert({
    user_id: user?.id ?? null,
    name: parsed.data.name,
    path: parsed.data.path ?? null,
  });
  return NextResponse.json({ ok: true });
}
