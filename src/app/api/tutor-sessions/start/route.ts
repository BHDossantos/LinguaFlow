import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Stub for starting a billed tutor session.
// Real implementation will:
// 1. Create a Stripe PaymentIntent with manual capture, holding the user's max budget.
// 2. Create a WebRTC room (LiveKit/Daily) and return join token.
// 3. Start a per-minute meter that captures incrementally and updates `tutor_sessions.minutes_billed`.

const Body = z.object({
  tutorId: z.string().uuid(),
  maxMinutes: z.number().int().min(5).max(120).default(30),
  shareLearnerSnapshot: z.boolean().default(true),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { tutorId, maxMinutes, shareLearnerSnapshot } = parsed.data;

  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let snapshot: unknown = null;
  if (shareLearnerSnapshot) {
    const { data } = await supabase
      .from("error_log")
      .select("category,detail,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    snapshot = { recentErrors: data ?? [] };
  }

  const { data: session, error } = await supabase
    .from("tutor_sessions")
    .insert({
      student_id: user.id,
      tutor_id: tutorId,
      status: "pending",
      shared_learner_snapshot: snapshot,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    sessionId: session.id,
    maxMinutes,
    // TODO: stripeClientSecret, livekitToken, roomName
  });
}
