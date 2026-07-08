import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { scorePronunciation } from "@/lib/pronunciation";

export const runtime = "nodejs";

// Pronunciation assessment.
// Always returns a real score from the local algorithm. If ANTHROPIC_API_KEY
// is configured we additionally ask Claude for a short coaching tip; the
// local result is the source of truth so the feature works without any key.
const Body = z.object({
  language: z.string(),
  reference: z.string().min(1),
  transcript: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { language, reference, transcript } = parsed.data;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = scorePronunciation(reference, transcript);

  // Optional AI coaching — never throws into the user response.
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { anthropic, MODEL } = await import("@/lib/anthropic");
      const msg = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 200,
        system:
          `You are a friendly ${language} pronunciation coach. ` +
          `Given a target phrase and the learner's transcript, write ONE short coaching tip (≤25 words). ` +
          `No JSON. No greetings. Focus on the most impactful correction.`,
        messages: [{
          role: "user",
          content: `Target: ${reference}\nLearner heard: ${transcript}\nLocal score: ${result.score}`,
        }],
      });
      const tip = msg.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .trim();
      if (tip) result.overallTip = tip;
    } catch {
      // Silently keep the local tip.
    }
  }

  await supabase.from("pronunciation_attempts").insert({
    user_id: user.id,
    language,
    reference_text: reference,
    score: result.score,
    phoneme_feedback: result.wordFeedback,
  });

  return NextResponse.json(result);
}
