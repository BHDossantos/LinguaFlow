"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { LANGUAGE_CODES } from "@/lib/languages";

const Input = z.object({
  language: z.enum(LANGUAGE_CODES as unknown as [string, ...string[]]),
  dialect: z.string().nullish(),
  cefr: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  goals: z.array(z.string()).max(6),
  adultMode: z.boolean(),
  nativeLanguage: z.string().min(2).max(8),
});

export async function saveOnboarding(raw: unknown) {
  const data = Input.parse(raw);
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  await supabase
    .from("profiles")
    .update({
      cefr_level: data.cefr,
      goals: data.goals,
      adult_mode: data.adultMode,
      native_language: data.nativeLanguage,
    })
    .eq("id", user.id);

  await supabase.from("target_languages").upsert(
    {
      user_id: user.id,
      language: data.language,
      dialect: data.dialect ?? null,
      cefr_level: data.cefr,
      active: true,
    },
    { onConflict: "user_id,language" },
  );

  redirect(`/learn?lang=${data.language}`);
}
