import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Body = z.object({
  source: z.string().min(40).max(16000),
  output: z.enum(["flashcards", "quiz", "summary"]),
});

const SHAPES: Record<string, string> = {
  flashcards:
    `Return STRICT JSON: {"flashcards":[{"front":"...","back":"..."}]} with 8-15 cards. ` +
    `Front = a question or term; back = a concise answer/definition.`,
  quiz:
    `Return STRICT JSON: {"questions":[{"prompt":"...","options":["a","b","c","d"],"answer":0,"explanation":"..."}]} ` +
    `with 6-10 questions. Exactly 4 options each; "answer" is the 0-based index; explanation is one sentence.`,
  summary:
    `Return STRICT JSON: {"summary":"2-4 sentence overview","keyPoints":["...","..."],"glossary":[{"term":"...","definition":"..."}]} ` +
    `with 4-8 key points and 3-6 glossary terms.`,
};

function parseJson(text: string): any | null {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const s = cleaned.indexOf("{");
  const e = cleaned.lastIndexOf("}");
  if (s >= 0 && e > s) { try { return JSON.parse(cleaned.slice(s, e + 1)); } catch {} }
  return null;
}

// Study-tools generator (spec §13): turns the learner's OWN pasted material into
// flashcards, a quiz, or a summary — strictly grounded in that material.
// Requires ANTHROPIC_API_KEY; 503 + offline flag until configured.
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
  if (!(await takeRateLimit(`study:${user.id}`, 20, 3600))) {
    return NextResponse.json({ error: "Give it a moment — try again shortly." }, { status: 429 });
  }

  const { source, output } = parsed.data;
  const { anthropic, MODEL } = await import("@/lib/anthropic");
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system:
      `You turn a student's own study material into study aids. Use ONLY the ` +
      `information in the provided material — never add facts that aren't there, ` +
      `so everything is traceable to their notes. Match the material's language. ` +
      SHAPES[output] + ` Output JSON only, no prose, no code fences.`,
    messages: [{ role: "user", content: `Material:\n"""\n${source}\n"""` }],
  });

  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const data = parseJson(text);
  if (!data) return NextResponse.json({ error: "Could not generate — try again." }, { status: 502 });

  return NextResponse.json({ output, data });
}
