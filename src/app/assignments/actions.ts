"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";

const SubmitInput = z.object({
  assignmentId: z.string().uuid(),
  text: z.string().min(1).max(20000),
});

export async function submitAssignment(formData: FormData) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const data = SubmitInput.parse({
    assignmentId: formData.get("assignmentId"),
    text: formData.get("text"),
  });

  const { data: submission, error } = await supabase
    .from("submissions")
    .upsert(
      {
        assignment_id: data.assignmentId,
        student_id: user.id,
        text: data.text,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "assignment_id,student_id" },
    )
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  // Kick off AI grading in the background. We don't await it here — the
  // student lands on /result which will poll for the grade row.
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  if (host) {
    fetch(`${proto}://${host}/api/grade`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: h.get("cookie") ?? "",
      },
      body: JSON.stringify({ submissionId: submission.id }),
    }).catch(() => {});
  }

  revalidatePath(`/assignments/${data.assignmentId}`);
  redirect(`/assignments/${data.assignmentId}/result`);
}
