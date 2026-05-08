import { requireOnboardedUser, getPrimaryTargetLanguage } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { PracticeClient } from "./PracticeClient";
import type { LanguageCode } from "@/lib/languages";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const user = await requireOnboardedUser();
  const supabase = supabaseServer();
  const primary = await getPrimaryTargetLanguage();
  const { data: profile } = await supabase
    .from("profiles").select("cefr_level").eq("id", user.id).single();

  return (
    <PracticeClient
      defaultLanguage={(primary?.language ?? "es") as LanguageCode}
      defaultCefr={profile?.cefr_level ?? "A2"}
    />
  );
}
