import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(30),
  mode: z.enum(["explain", "socratic", "practice", "review"]).default("explain"),
});

// Pedagogy per tutor mode. Socratic deliberately withholds answers and
// teaches through questions (Cambridge supervision style).
const MODE_PROMPTS: Record<string, string> = {
  explain:
    "Mode: EXPLAIN. Explain concepts clearly at the student's level with one concrete example, then one quick check-for-understanding question.",
  socratic:
    "Mode: SOCRATIC. Never state the answer directly, even if asked. Guide with 2-4 short questions that lead the student to discover it. Acknowledge each attempt, narrow the next question based on their reasoning, and only confirm once THEY have said the answer. If they are stuck after several genuine attempts, give a strong hint — still not the full answer.",
  practice:
    "Mode: PRACTICE. Generate practice problems matched to the student's level: one at a time, wait for their answer, then grade it with a one-line explanation and give the next (slightly adapted to their performance).",
  review:
    "Mode: REVIEW. Focus on the student's likely weak spots. Ask what they got wrong recently or pick common trouble areas for their level; re-teach briefly, then drill with 2-3 targeted questions.",
};

// The AI Coach: a learning tutor that knows the student's level and target
// language. Requires ANTHROPIC_API_KEY; returns 503 with a friendly flag
// when unconfigured so the UI can explain rather than error.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ offline: true }, { status: 503 });
  }

  const { takeRateLimit } = await import("@/lib/rate-limit");
  if (!(await takeRateLimit(`coach:${user.id}`, 30, 3600))) {
    return NextResponse.json(
      { error: "You're going fast! The coach needs a short break — try again in a bit." },
      { status: 429 },
    );
  }

  const [{ data: profile }, { data: target }] = await Promise.all([
    supabase.from("profiles").select("display_name,cefr_level").eq("id", user.id).single(),
    supabase
      .from("target_languages")
      .select("language,dialect,cefr_level")
      .eq("user_id", user.id)
      .eq("active", true)
      .limit(1)
      .maybeSingle(),
  ]);

  const { anthropic, MODEL } = await import("@/lib/anthropic");
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system:
      `You are Noelia's learning coach — a warm, expert tutor. ` +
      `Student: ${profile?.display_name ?? "learner"}, level ${target?.cefr_level ?? profile?.cefr_level ?? "A1"}, ` +
      `learning ${target?.language ?? "a new language"}${target?.dialect ? ` (${target.dialect})` : ""}. ` +
      `Answer anything they ask about learning: explain concepts simply, create practice problems, ` +
      `quiz them, give examples, translate, correct mistakes kindly. ` +
      `Match their level; prefer short, concrete answers with one clear next step. ` +
      MODE_PROMPTS[parsed.data.mode],
    messages: parsed.data.messages,
  });

  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
  return NextResponse.json({ reply: text });
}
