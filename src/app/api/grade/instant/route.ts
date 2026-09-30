import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import {
  buildInstantFeedbackSystem,
  normalizeFeedbackKind,
  type RubricCriterion,
} from "@/lib/grading";

export const runtime = "nodejs";

const Body = z.object({
  work: z.string().min(1).max(20000),
  task: z.string().max(4000).optional(),
  kind: z.string().max(40).optional(),
  language: z.string().max(40).optional(),
  rubric: z
    .array(z.object({ name: z.string().min(1).max(80), description: z.string().max(300).optional() }))
    .max(8)
    .optional(),
  maxScore: z.number().int().min(1).max(1000).optional(),
});

// Instant, real-time feedback on a student's own work (spec §5/§8). Streams the
// model's Markdown feedback back token-by-token so it appears live. Requires
// ANTHROPIC_API_KEY; returns 503 {offline:true} when unconfigured so the UI can
// explain rather than error. Coaches the student — it does not rewrite the work.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ offline: true }, { status: 503 });
  }

  const { takeRateLimit } = await import("@/lib/rate-limit");
  if (!(await takeRateLimit(`grade:${user.id}`, 40, 3600))) {
    return NextResponse.json(
      { error: "You're going fast! Feedback needs a short break — try again in a bit." },
      { status: 429 },
    );
  }

  const { work, task, language, maxScore } = parsed.data;
  const kind = normalizeFeedbackKind(parsed.data.kind);
  const rubric = parsed.data.rubric as RubricCriterion[] | undefined;

  const system = buildInstantFeedbackSystem({ task, kind, rubric, language, maxScore });

  const { anthropic, MODEL } = await import("@/lib/anthropic");

  // Stream text deltas straight through to the client for a real-time feel.
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const run = anthropic.messages.stream({
          model: MODEL,
          max_tokens: 1600,
          system,
          messages: [{ role: "user", content: work }],
        });
        run.on("text", (delta: string) => controller.enqueue(encoder.encode(delta)));
        await run.finalMessage();
        controller.close();
      } catch (err: any) {
        // Surface a short error into the stream so the UI shows something useful.
        controller.enqueue(encoder.encode(`\n\n_Feedback was interrupted: ${err?.message ?? "error"}._`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-content-type-options": "nosniff",
    },
  });
}
