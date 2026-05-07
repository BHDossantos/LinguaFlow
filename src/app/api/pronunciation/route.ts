import { NextResponse } from "next/server";
import { z } from "zod";
import { anthropic, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

// Phase 1: text-only assessment (transcript captured client-side via Web Speech API).
// Phase 2: replace with audio upload + phoneme-level scoring (e.g. Whisper + g2p).
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

  const system = `You score a learner's pronunciation attempt in ${language}.
Compare the recognized transcript to the reference. Return STRICT JSON:
{"score": 0-100, "wordFeedback": [{"word":"…","ok":true|false,"hint":"…"}], "overallTip":"…"}
Penalize missing or substituted words; reward fluent ordering.`;

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 600,
    system,
    messages: [{
      role: "user",
      content: `Reference: ${reference}\nTranscript: ${transcript}`,
    }],
  });

  const out = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  try {
    return NextResponse.json(JSON.parse(out));
  } catch {
    return NextResponse.json({ score: null, wordFeedback: [], overallTip: out });
  }
}
