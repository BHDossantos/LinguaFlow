"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { LANGUAGE_CODES } from "@/lib/languages";

const Input = z.object({
  languages: z
    .array(
      z.object({
        language: z.enum(LANGUAGE_CODES as unknown as [string, ...string[]]),
        dialect: z.string().nullish(),
      }),
    )
    .min(1)
    .max(LANGUAGE_CODES.length),
  cefr: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  goals: z.array(z.string()).max(6),
  adultMode: z.boolean(),
  nativeLanguage: z.string().min(2).max(8),
});

export async function saveOnboarding(raw: unknown) {
  const data = Input.parse(raw);
  const supabase = await supabaseServer();
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

  // One row per selected language; only the first (primary) is active —
  // getPrimaryTargetLanguage() relies on a single active row.
  const seen = new Set<string>();
  const rows = data.languages
    .filter((l) => (seen.has(l.language) ? false : seen.add(l.language)))
    .map((l, i) => ({
      user_id: user.id,
      language: l.language,
      dialect: l.dialect ?? null,
      cefr_level: data.cefr,
      active: i === 0,
    }));

  await supabase
    .from("target_languages")
    .upsert(rows, { onConflict: "user_id,language" });

  redirect(`/learn?lang=${rows[0].language}`);
}
