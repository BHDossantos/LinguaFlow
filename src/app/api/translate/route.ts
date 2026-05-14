import { NextResponse } from "next/server";
import { z } from "zod";
import { anthropic, MODEL } from "@/lib/anthropic";
import { LANGUAGE_CODES } from "@/lib/languages";

export const runtime = "nodejs";

const Body = z.object({
  text: z.string().min(1).max(4000),
  source: z
    .string()
    .refine((v) => v === "auto" || (LANGUAGE_CODES as string[]).includes(v), "bad source")
    .default("auto"),
  target: z
    .string()
    .refine((v) => (LANGUAGE_CODES as string[]).includes(v), "bad target"),
  formality: z.enum(["neutral", "formal", "casual"]).default("neutral"),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { text, source, target, formality } = parsed.data;

  const system = `You are a precise translator for a language-learning app.
Translate the user's text into "${target}". Source: ${source === "auto" ? "auto-detect" : source}.
Tone: ${formality}.
Return STRICT JSON only:
{"translation": string, "detectedSource": string, "alternatives": string[], "notes": string}
"alternatives": up to 3 alternative phrasings (different register or regional).
"notes": one-sentence learner tip (idioms, false friends, gender). Empty string if none.`;

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    system,
    messages: [{ role: "user", content: text }],
  });

  const out = msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");

  try {
    return NextResponse.json(JSON.parse(out));
  } catch {
    return NextResponse.json({
      translation: out,
      alternatives: [],
      notes: "",
      detectedSource: source,
    });
  }
}
