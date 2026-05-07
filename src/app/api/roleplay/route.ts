import { NextResponse } from "next/server";
import { z } from "zod";
import { anthropic, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

const Body = z.object({
  language: z.string(),
  dialect: z.string().optional(),
  scenario: z.string().min(1),
  persona: z.string().default("friendly native speaker"),
  cefr: z.string().default("A1"),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).default([]),
  userMessage: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { language, dialect, scenario, persona, cefr, history, userMessage } = parsed.data;

  const system = `You are a ${persona} role-playing in ${language}${dialect ? ` (${dialect} dialect)` : ""}.
Scenario: ${scenario}
The learner is at CEFR ${cefr}. Stay strictly in character and in ${language}.
Adjust speed and vocabulary to ${cefr}. Use natural, real-world phrasing — not textbook.

After your in-character reply, append a JSON block on a new line in this exact format:
<<META>>{"corrections":[{"wrong":"…","right":"…","why":"…"}],"newWords":[{"term":"…","translation":"…"}],"confidence":0-10}
"corrections": fix the learner's last message (max 3, only meaningful errors).
"newWords": up to 3 words/phrases you used that are likely new for this CEFR level.
"confidence": your estimate of how natural the learner sounded.`;

  const messages = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user" as const, content: userMessage },
  ];

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    system,
    messages,
  });

  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const split = raw.split("<<META>>");
  const reply = split[0]?.trim() ?? "";
  let meta: any = { corrections: [], newWords: [], confidence: null };
  if (split[1]) {
    try { meta = JSON.parse(split[1].trim()); } catch { /* ignore */ }
  }

  return NextResponse.json({ reply, meta });
}
