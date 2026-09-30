import { requireOnboardedUser } from "@/lib/auth";
import { InstantFeedback } from "@/components/InstantFeedback";

export const dynamic = "force-dynamic";
export const metadata = { title: "Instant feedback" };

// Real-time feedback on a student's own work (spec §5/§8): paste an essay,
// answer, code, or solution and get detailed, rubric-based feedback that streams
// in live. It coaches toward a better draft — it never rewrites the work for you.
export default async function FeedbackPage() {
  await requireOnboardedUser();
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Instant feedback</h1>
        <p className="text-sm text-ink-500">
          Paste your work and get detailed, rubric-based feedback in real time — strengths, precise
          fixes, and your next step. You keep the writing; this coaches you to improve it.
        </p>
      </header>
      <InstantFeedback />
    </div>
  );
}
