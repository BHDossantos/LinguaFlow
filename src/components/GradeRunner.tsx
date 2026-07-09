"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function GradeRunner({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "grading failed");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Grading failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={run} disabled={busy} className="btn-primary text-sm">
        {busy ? "Grading…" : "Run system grading"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
