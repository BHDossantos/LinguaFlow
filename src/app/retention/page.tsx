import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { getDueRetention } from "@/lib/retention";
import { RetentionCheck } from "./RetentionCheck";

export const dynamic = "force-dynamic";
export const metadata = { title: "Retention check" };

// Delayed retention checks (spec §7/§27): prove that mastered skills still stick
// 14+ days later. This is how the north-star — mastered AND retained — is earned.
export default async function RetentionPage() {
  await requireOnboardedUser();
  const questions = await getDueRetention();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Retention check</h1>
        <p className="text-sm text-ink-500">
          Skills you mastered a while ago — let&apos;s confirm they stuck.
        </p>
      </header>

      {questions.length === 0 ? (
        <div className="card space-y-2 text-sm">
          <p>🎯 Nothing due for a retention check.</p>
          <p className="text-ink-500">
            When a skill you&apos;ve mastered goes 14 days without a check, it shows up here so you can
            prove it still sticks. Keep mastering lessons and come back.
          </p>
          <div className="flex gap-2 pt-1">
            <Link href="/learn" className="btn-primary">Keep learning</Link>
            <Link href="/review" className="btn-ghost">Daily review</Link>
          </div>
        </div>
      ) : (
        <RetentionCheck questions={questions} />
      )}
    </div>
  );
}
