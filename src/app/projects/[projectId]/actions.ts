"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function submitProjectAction(projectId: string, url: string, notes: string) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };
  if (!url.trim() && !notes.trim()) return { error: "Add a link or some notes about your work." };

  const { error } = await supabase.from("project_submissions").insert({
    project_id: projectId,
    user_id: user.id,
    url: url.trim() || null,
    notes: notes.trim() || null,
    status: "submitted",
  });
  if (error) return { error: "Could not submit — try again." };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/portfolio");
  return { ok: true };
}
