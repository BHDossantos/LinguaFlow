"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

const ProfileInput = z.object({
  displayName: z.string().min(1).max(80),
  cefr: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  dailyGoalXp: z.coerce.number().int().min(10).max(1000),
});

export async function updateProfile(formData: FormData) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const data = ProfileInput.parse({
    displayName: formData.get("displayName"),
    cefr: formData.get("cefr"),
    dailyGoalXp: formData.get("dailyGoalXp"),
  });

  await supabase
    .from("profiles")
    .update({ display_name: data.displayName, cefr_level: data.cefr })
    .eq("id", user.id);

  await supabase
    .from("user_stats")
    .upsert(
      { user_id: user.id, daily_goal_xp: data.dailyGoalXp },
      { onConflict: "user_id" },
    );

  revalidatePath("/settings");
  revalidatePath("/profile");
  redirect("/settings?saved=1");
}

// Permanently delete the account: removes the auth user (profiles row and
// everything hanging off it goes with ON DELETE CASCADE). Requires the
// service-role key; without it we sign the user out and surface an error.
export async function deleteAccount() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Account deletion is not configured on this deployment");
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { persistSession: false } },
  );
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);

  await supabase.auth.signOut();
  redirect("/");
}
