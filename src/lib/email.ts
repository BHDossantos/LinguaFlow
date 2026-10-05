// Email delivery for graded-paper feedback. Uses Resend when RESEND_API_KEY is
// configured; otherwise the caller falls back to a mailto: link the teacher's own
// mail client opens. No SDK dependency — Resend has a simple JSON HTTP API.

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

// The From address. Set EMAIL_FROM to a verified sender on your Resend domain
// (e.g. "Noelia <feedback@learnnoelia.com>"). Falls back to Resend's shared
// onboarding sender so it works before a domain is verified.
function fromAddress(): string {
  return process.env.EMAIL_FROM || "Noelia <onboarding@resend.dev>";
}

export type SendResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "not_configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: fromAddress(),
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `resend_${res.status}: ${body.slice(0, 300)}` };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: json.id };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "send_failed" };
  }
}

// Build the feedback email body from a graded paper. Plain, printable HTML.
export function buildFeedbackEmail(opts: {
  studentName: string;
  title: string;
  subject?: string | null;
  score?: number | null;
  maxScore?: number | null;
  summaryMd?: string | null;
  feedbackMd?: string | null;
  focusAreas?: string[] | null;
  planMd?: string | null;
  forGuardian?: boolean;
}): { subject: string; html: string; text: string } {
  const scoreStr =
    opts.score != null ? `${opts.score}/${opts.maxScore ?? 100}` : "see feedback";
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const mdToHtml = (md?: string | null) =>
    md
      ? esc(md)
          .replace(/^### (.*)$/gm, "<h3>$1</h3>")
          .replace(/^## (.*)$/gm, "<h2>$1</h2>")
          .replace(/^[-*] (.*)$/gm, "<li>$1</li>")
          .replace(/\n{2,}/g, "<br/><br/>")
          .replace(/\n/g, "<br/>")
      : "";

  const greeting = opts.forGuardian
    ? `Here is the graded work for ${esc(opts.studentName)}.`
    : `Hi ${esc(opts.studentName)}, here is your graded work.`;

  const focus =
    opts.focusAreas && opts.focusAreas.length
      ? `<h3>Focus on next</h3><ul>${opts.focusAreas
          .map((f) => `<li>${esc(f)}</li>`)
          .join("")}</ul>`
      : "";

  const subjectLine = `${opts.title}${opts.subject ? ` (${opts.subject})` : ""} — ${scoreStr}`;

  const html = `<div style="font-family:system-ui,Arial,sans-serif;max-width:640px;margin:0 auto;color:#111">
    <p>${greeting}</p>
    <h2 style="margin:0 0 4px">${esc(opts.title)}</h2>
    <p style="font-size:20px;font-weight:700;margin:0 0 12px">Score: ${scoreStr}</p>
    ${opts.summaryMd ? `<p>${mdToHtml(opts.summaryMd)}</p>` : ""}
    ${opts.feedbackMd ? `<h3>Feedback</h3><div>${mdToHtml(opts.feedbackMd)}</div>` : ""}
    ${focus}
    ${opts.planMd ? `<h3>Study plan</h3><div>${mdToHtml(opts.planMd)}</div>` : ""}
    <hr style="margin:20px 0;border:none;border-top:1px solid #eee"/>
    <p style="color:#666;font-size:12px">Sent via Noelia.</p>
  </div>`;

  const text = [
    greeting,
    `${opts.title} — Score: ${scoreStr}`,
    opts.summaryMd || "",
    opts.feedbackMd || "",
    opts.focusAreas?.length ? `Focus on next:\n- ${opts.focusAreas.join("\n- ")}` : "",
    opts.planMd || "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { subject: subjectLine, html, text };
}
