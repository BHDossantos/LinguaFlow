import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { NotesClient } from "./NotesClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Notes" };

// Personal notebook — stored locally on this device (localStorage), no DB.
export default async function NotesPage() {
  await requireOnboardedUser();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Notes</h1>
        <p className="text-sm text-ink-500">
          Quick personal notes — saved automatically on this device.
        </p>
      </header>
      <Link href="/study" className="card card-hover flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-xl dark:bg-violet-500/20">🃏</span>
          <div>
            <p className="font-semibold">Turn notes into study tools</p>
            <p className="text-xs text-ink-500">Flashcards, a quiz, or a summary from your own material</p>
          </div>
        </div>
        <span className="text-ink-500">›</span>
      </Link>
      <NotesClient />
    </div>
  );
}
