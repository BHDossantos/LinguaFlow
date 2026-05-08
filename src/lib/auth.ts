import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireOnboardedUser() {
  const user = await requireUser();
  const supabase = supabaseServer();
  const { count } = await supabase
    .from("target_languages")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (!count || count === 0) redirect("/onboarding");
  return user;
}

export async function getPrimaryTargetLanguage(): Promise<{ language: string; dialect: string | null } | null> {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("target_languages")
    .select("language,dialect,active")
    .eq("user_id", user.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  return data ? { language: data.language, dialect: data.dialect } : null;
}
