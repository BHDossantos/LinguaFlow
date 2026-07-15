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
      <NotesClient />
    </div>
  );
}
