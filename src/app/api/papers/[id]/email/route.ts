import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { emailConfigured, sendEmail, buildFeedbackEmail } from "@/lib/email";

export const runtime = "nodejs";

const Body = z.object({
  to: z.string().email().optional(),
  audience: z.enum(["student", "guardian"]).default("student"),
  save: z.boolean().default(true), // remember this address on the profile
});

// Email a graded paper's feedback to the student or their parent/guardian.
// Uses Resend when configured; otherwise returns a mailto: link the teacher's
// own mail client opens. Only the student or a teacher who teaches them can send.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { to, audience, save } = parsed.data;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // RLS lets the student, their teachers, and their guardians read the paper.
  const { data: paper } = await supabase
    .from("paper_gradings")
    .select("id, student_id, title, subject, score, max_score, summary_md, feedback_md, focus_areas, plan_md")
    .eq("id", id)
    .single();
  if (!paper) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // Only the student or a teacher who teaches them may send.
  let allowed = paper.student_id === user.id;
  if (!allowed) {
    const { data: t } = await supabase.rpc("teaches_student", { student: paper.student_id });
    allowed = !!t;
  }
  if (!allowed) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

  const admin = supabaseAdmin();
  // Resolve the recipient: explicit `to`, else the saved contact on the profile.
  let recipient = to ?? null;
  let studentName = "Student";
  if (admin) {
    const { data: p } = await admin
      .from("profiles")
      .select("display_name, email, parent_email")
      .eq("id", paper.student_id)
      .single();
    studentName = p?.display_name ?? "Student";
    if (!recipient) recipient = audience === "guardian" ? p?.parent_email ?? null : p?.email ?? null;
  }
  if (!recipient) {
    return NextResponse.json({ needsEmail: true, audience });
  }

  // Remember the address for next time.
  if (save && to && admin) {
    await admin
      .from("profiles")
      .update(audience === "guardian" ? { parent_email: to } : { email: to })
      .eq("id", paper.student_id);
  }

  const mail = buildFeedbackEmail({
    studentName,
    title: paper.title ?? "Paper",
    subject: paper.subject,
    score: paper.score,
    maxScore: paper.max_score,
    summaryMd: paper.summary_md ?? null,
    feedbackMd: paper.feedback_md,
    focusAreas: (paper.focus_areas as string[] | null) ?? null,
    planMd: paper.plan_md,
    forGuardian: audience === "guardian",
  });

  // No provider configured -> hand back a mailto: the teacher's client can open.
  if (!emailConfigured()) {
    const mailto = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
      mail.subject,
    )}&body=${encodeURIComponent(mail.text)}`;
    // Still record intent.
    await supabase.from("paper_gradings").update({ emailed_to: recipient, emailed_at: new Date().toISOString() }).eq("id", id);
    return NextResponse.json({ fallback: true, mailto, to: recipient });
  }

  const sent = await sendEmail({ to: recipient, subject: mail.subject, html: mail.html, text: mail.text });
  if (!sent.ok) {
    return NextResponse.json({ error: `Email failed: ${sent.error}` }, { status: 502 });
  }
  await supabase.from("paper_gradings").update({ emailed_to: recipient, emailed_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json({ sent: true, to: recipient, id: sent.id });
}
