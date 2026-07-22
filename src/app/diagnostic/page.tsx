import { requireOnboardedUser } from "@/lib/auth";
import { DiagnosticClient } from "./DiagnosticClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Diagnostic" };

// Adaptive diagnostic (spec §1): find out what the learner already knows and
// build a personalized starting point, instead of assuming.
export default async function DiagnosticPage() {
  await requireOnboardedUser();
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Placement diagnostic</h1>
        <p className="text-sm text-ink-500">
          A short check-up finds what you already know and where the gaps are — so
          you start in the right place, not from zero.
        </p>
      </header>
      <DiagnosticClient />
    </div>
  );
}
