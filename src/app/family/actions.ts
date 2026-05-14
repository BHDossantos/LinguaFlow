"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

function makeCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

export async function ensureInviteCode() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles").select("guardian_invite_code").eq("id", user.id).single();
  if (profile?.guardian_invite_code) return profile.guardian_invite_code;

  // Retry a few times in case of a unique collision.
  for (let i = 0; i < 5; i++) {
    const code = makeCode();
    const { error } = await supabase
      .from("profiles").update({ guardian_invite_code: code }).eq("id", user.id);
    if (!error) {
      revalidatePath("/family");
      return code;
    }
  }
  throw new Error("Could not generate invite code");
}

export async function linkStudent(input: { code: string }) {
  const code = z.string().trim().toUpperCase().length(6).parse(input.code);
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: student } = await supabase
    .from("profiles").select("id").eq("guardian_invite_code", code).maybeSingle();
  if (!student) throw new Error("No student found for that code");
  if (student.id === user.id) throw new Error("That's your own code");

  const { error } = await supabase
    .from("guardians")
    .upsert(
      { guardian_id: user.id, student_id: student.id },
      { onConflict: "guardian_id,student_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(error.message);

  revalidatePath("/family");
}

export async function unlinkStudent(input: { studentId: string }) {
  const studentId = z.string().uuid().parse(input.studentId);
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  await supabase
    .from("guardians")
    .delete()
    .eq("guardian_id", user.id)
    .eq("student_id", studentId);
  revalidatePath("/family");
}
