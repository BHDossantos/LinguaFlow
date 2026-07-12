"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Check = {
  ai_likelihood: number | null;
  ai_reasoning: string | null;
  similarity_max: number | null;
  similar_submission_id: string | null;
};

export function IntegrityPanel({
  submissionId, existing,
}: {
  submissionId: string;
  existing: Check | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/integrity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "check failed");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Check failed");
    } finally {
      setBusy(false);
    }
  }

  const aiPct = existing?.ai_likelihood != null ? Math.round(existing.ai_likelihood * 100) : null;
  const simPct = existing?.similarity_max != null ? Math.round(existing.similarity_max * 100) : null;

  return (
    <section className="card space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Academic integrity</h2>
        <button onClick={run} disabled={busy} className="btn-ghost text-sm">
          {busy ? "Checking…" : existing ? "Re-run" : "Run check"}
        </button>
      </div>

      {existing ? (
        <div className="space-y-2 text-sm">
          <div>
            <div className="flex justify-between">
              <span>Generated-text likelihood</span>
              <span className={
                aiPct! >= 70 ? "font-semibold text-red-600" :
                aiPct! >= 40 ? "font-semibold text-amber-600" : "text-green-600"
              }>{aiPct}%</span>
            </div>
            {existing.ai_reasoning && (
              <p className="text-xs text-ink-500">{existing.ai_reasoning}</p>
            )}
          </div>
          <div>
            <div className="flex justify-between">
              <span>Max similarity vs cohort</span>
              <span className={
                simPct != null && simPct >= 70 ? "font-semibold text-red-600" :
                simPct != null && simPct >= 40 ? "font-semibold text-amber-600" : "text-green-600"
              }>{simPct != null ? `${simPct}%` : "—"}</span>
            </div>
            {existing.similar_submission_id && (
              <a
                href={`/teach/submissions/${existing.similar_submission_id}`}
                className="text-xs text-brand-500"
              >
                View most similar submission →
              </a>
            )}
          </div>
          <p className="text-xs text-ink-500">
            Signals, not verdicts — use your judgment before acting.
          </p>
        </div>
      ) : (
        <p className="text-sm text-ink-500">
          Not checked yet. Runs a generated-text estimate and a similarity scan
          against other submissions on this assignment.
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </section>
  );
}
