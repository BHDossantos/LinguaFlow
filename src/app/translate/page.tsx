import { requireOnboardedUser, getPrimaryTargetLanguage } from "@/lib/auth";
import { TranslateClient } from "./TranslateClient";
import type { LanguageCode } from "@/lib/languages";

export const dynamic = "force-dynamic";

export default async function TranslatePage() {
  await requireOnboardedUser();
  const primary = await getPrimaryTargetLanguage();
  return <TranslateClient defaultTarget={(primary?.language ?? "es") as LanguageCode} />;
}
