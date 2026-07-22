import { requireOnboardedUser } from "@/lib/auth";
import { StudyToolsClient } from "./StudyToolsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Study tools" };

// Turn your own notes into flashcards, a quiz, or a summary (spec §13).
export default async function StudyPage() {
  await requireOnboardedUser();
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Study tools</h1>
        <p className="text-sm text-ink-500">
          Paste your notes, a lecture transcript, or a chapter — get flashcards, a
          practice quiz, or a summary, built only from your material.
        </p>
      </header>
      <StudyToolsClient />
    </div>
  );
}
