"use client";
import { useState } from "react";

// Email + print actions on a graded paper. The email endpoint enforces that only
// the student or a teacher who teaches them can send, and falls back to opening
// the teacher's mail client when no email provider is configured.
export function PaperActions({ paperId }: { paperId: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ask, setAsk] = useState<null | "student" | "guardian">(null);
  const [addr, setAddr] = useState("");

  async function email(audience: "student" | "guardian", to?: string) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/papers/${paperId}/email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ audience, ...(to ? { to } : {}) }),
      });
      const j = await res.json().catch(() => ({}));
      if (j.needsEmail) { setAsk(audience); return; }
      if (j.fallback && j.mailto) { window.location.href = j.mailto; setMsg(`Opening your mail app for ${j.to}`); setAsk(null); return; }
      if (j.sent) { setMsg(`Sent to ${j.to}`); setAsk(null); return; }
      setMsg(j.error ?? "Could not send.");
    } catch (e: any) {
      setMsg(e?.message ?? "Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Share</p>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => email("student")} disabled={busy} className="btn-ghost text-sm">✉️ Email student</button>
        <button onClick={() => email("guardian")} disabled={busy} className="btn-ghost text-sm">✉️ Email parent</button>
        <a href={`/papers/${paperId}/print`} target="_blank" rel="noreferrer" className="btn-ghost text-sm">🖨️ Print report</a>
        {busy && <span className="text-xs text-ink-500">Working…</span>}
        {msg && <span className="text-xs text-green-700">{msg}</span>}
      </div>
      {ask && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-500">
            No {ask === "guardian" ? "parent" : "student"} email on file. Enter one:
          </span>
          <input
            type="email"
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            placeholder="name@example.com"
            className="rounded-lg border border-black/10 bg-white px-2 py-1 text-sm dark:bg-white/5"
          />
          <button onClick={() => addr && email(ask, addr)} disabled={!addr || busy} className="btn-ghost text-xs">Send</button>
        </div>
      )}
    </div>
  );
}
