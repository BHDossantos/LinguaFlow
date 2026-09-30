// Shared grading logic for the instant-feedback grader (spec §5/§8). Pure and
// testable: no network, no secrets. The route in app/api/grade/instant builds
// its system prompt from here and streams the model's feedback back in real time.

export type RubricCriterion = { name: string; weight?: number; description?: string };

export type FeedbackKind = "essay" | "short_answer" | "code" | "math" | "language" | "general";

export const FEEDBACK_KINDS: FeedbackKind[] = [
  "essay",
  "short_answer",
  "code",
  "math",
  "language",
  "general",
];

export const KIND_LABEL: Record<FeedbackKind, string> = {
  essay: "Essay / writing",
  short_answer: "Short answer",
  code: "Code",
  math: "Math solution",
  language: "Language practice",
  general: "General",
};

// A sensible default rubric when the learner hasn't been given one.
export const DEFAULT_FEEDBACK_RUBRIC: RubricCriterion[] = [
  { name: "Task completion", description: "Does the work fully address what was asked?" },
  { name: "Clarity & structure", description: "Logical flow, organization, easy to follow." },
  { name: "Accuracy & mechanics", description: "Correctness — facts, grammar/spelling, or code that runs." },
  { name: "Depth & reasoning", description: "Evidence, insight, justification, originality." },
];

export function normalizeFeedbackKind(k: unknown): FeedbackKind {
  const s = String(k ?? "").toLowerCase();
  return (FEEDBACK_KINDS as string[]).includes(s) ? (s as FeedbackKind) : "general";
}

// Formative-feedback guardrails: coach, don't do the work; be specific and cite
// the learner's own words; be honest but kind; never invent facts.
const FEEDBACK_GUARDRAILS = [
  "You are a rigorous, encouraging teacher giving FORMATIVE feedback — not rewriting the work for the student.",
  "Be specific: quote the student's own words when praising or flagging something, so they can find it.",
  "Point to HOW to improve (a technique, a question to consider, an example pattern) without handing over a full rewrite or the finished answer.",
  "Be honest and calibrated — do not inflate. But lead with what works, and keep it motivating.",
  "Never invent facts, sources, or citations. If something can't be judged from the text, say so.",
  "Keep it age-appropriate and kind; refuse unsafe content gently.",
];

// Build the system prompt for a single real-time feedback pass. The output is
// human-readable Markdown (streamed), so the student sees feedback appear live.
export function buildInstantFeedbackSystem(opts: {
  task?: string | null;
  kind?: FeedbackKind;
  rubric?: RubricCriterion[];
  language?: string | null;
  maxScore?: number | null;
}): string {
  const kind = opts.kind ?? "general";
  const rubric = opts.rubric && opts.rubric.length ? opts.rubric : DEFAULT_FEEDBACK_RUBRIC;
  const rubricList = rubric
    .map((c) => `- ${c.name}${c.description ? ` — ${c.description}` : ""}`)
    .join("\n");

  const scoreLine = opts.maxScore
    ? `End with a score out of ${opts.maxScore} and one sentence justifying it.`
    : "End with an overall rating (Needs work / Developing / Strong / Excellent) and one sentence justifying it.";

  return [
    `You are Noelia's feedback coach, grading a student's ${kind.replace("_", " ")} submission and giving detailed, real-time feedback.`,
    opts.language ? `The work is in ${opts.language}; assess it as such.` : "",
    opts.task ? `\nThe task the student was given:\n"""\n${opts.task}\n"""` : "\nNo explicit task was provided — infer the intent from the work itself.",
    `\nAssess against this rubric:\n${rubricList}`,
    `\n${FEEDBACK_GUARDRAILS.join("\n")}`,
    `\nRespond in this Markdown structure, and nothing else:`,
    `## Overall`,
    `One or two encouraging, honest sentences.`,
    `## By criterion`,
    `For EACH rubric criterion: a line "**<name>** — <✅ strong | 🟡 developing | 🔴 needs work>: <one specific sentence quoting the work>".`,
    `## What's working`,
    `2–3 specific strengths, each quoting the student's own words.`,
    `## What to improve`,
    `2–4 prioritized, concrete fixes. For each: name the issue, point to where it appears, and say how to approach fixing it (not the finished fix).`,
    `## Your next step`,
    `The single most important thing to do next.`,
    `## Score`,
    scoreLine,
  ]
    .filter(Boolean)
    .join("\n");
}
