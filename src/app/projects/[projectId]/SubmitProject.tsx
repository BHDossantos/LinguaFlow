"use client";
import { useState } from "react";
import { submitProjectAction } from "./actions";

export function SubmitProject({ projectId }: { projectId: string }) {
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr(null); setMsg(null);
    const res = await submitProjectAction(projectId, url, notes);
    setBusy(false);
    if (res?.error) { setErr(res.error); return; }
    setMsg("Submitted! It's now in your portfolio.");
    setUrl(""); setNotes("");
  }

  return (
    <form onSubmit={submit} className="card space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Submit your work</p>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Link to your work (repo, doc, video, deploy URL)…"
        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:bg-white/5"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes: what you built, decisions you made, what you'd improve…"
        rows={3}
        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:bg-white/5"
      />
      {err && <p className="text-xs text-red-600">{err}</p>}
      {msg && <p className="text-xs text-green-600">{msg}</p>}
      <button type="submit" disabled={busy} className="btn-primary px-5 py-2 text-sm">
        {busy ? "Submitting…" : "Submit work"}
      </button>
    </form>
  );
}
