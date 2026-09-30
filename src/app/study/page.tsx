import { requireOnboardedUser } from "@/lib/auth";
import Link from "next/link";
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

      <Link
        href="/feedback"
        className="card flex items-center justify-between gap-3 border-brand-500/30 bg-gradient-to-br from-brand-50 to-white transition hover:ring-1 hover:ring-brand-500/40 dark:from-white/[0.06] dark:to-transparent"
      >
        <div>
          <p className="text-sm font-semibold">📝 Get instant feedback on your work</p>
          <p className="text-xs text-ink-500">
            Paste an essay, answer, or code and get detailed, real-time feedback — strengths, precise fixes, and your next step.
          </p>
        </div>
        <span className="shrink-0 text-brand-500">→</span>
      </Link>

      <StudyToolsClient />
    </div>
  );
}

