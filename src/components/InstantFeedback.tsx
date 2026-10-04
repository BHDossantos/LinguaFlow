"use client";
import { useRef, useState } from "react";
import { FEEDBACK_KINDS, KIND_LABEL, type FeedbackKind } from "@/lib/grading";

// Real-time feedback: the student pastes their work, and the coach's detailed,
// rubric-based feedback streams in live. It coaches — it does not rewrite the work.
// Can be seeded with a task + kind when embedded in a lesson or project.
export function InstantFeedback({
  initialTask = "",
  initialKind = "essay",
  taskLabel = "The task (optional)",
}: {
  initialTask?: string;
  initialKind?: FeedbackKind;
  taskLabel?: string;
} = {}) {
  const [kind, setKind] = useState<FeedbackKind>(initialKind);
  const [task, setTask] = useState(initialTask);
  const [work, setWork] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<null | "offline" | "error" | "rate">(null);
  const [errorMsg, setErrorMsg] = useState("");
  const outRef = useRef<HTMLDivElement | null>(null);

  async function run() {
    if (busy || !work.trim()) return;
    setBusy(true);
    setOutput("");
    setStatus(null);
    setErrorMsg("");
    try {
      const res = await fetch("/api/grade/instant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          work,
          task: task.trim() || undefined,
          kind,
        }),
      });

      if (res.status === 503) { setStatus("offline"); return; }
      if (res.status === 429) {
        const d = await res.json().catch(() => ({}));
        setStatus("rate"); setErrorMsg(d?.error ?? "Please wait a moment."); return;
      }
      if (!res.ok || !res.body) {
        const d = await res.json().catch(() => ({}));
        setStatus("error"); setErrorMsg(d?.error ? JSON.stringify(d.error) : "Something went wrong."); return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
        outRef.current?.scrollTo({ top: outRef.current.scrollHeight });
      }
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message ?? "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">Type of work</label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as FeedbackKind)}
          className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm"
        >
          {FEEDBACK_KINDS.map((k) => (
            <option key={k} value={k}>{KIND_LABEL[k]}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">
          {taskLabel}
        </label>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          rows={2}
          placeholder="What were you asked to do? e.g. 'Write a 200-word argument for…' Leave blank and I'll infer it."
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">Your work</label>
        <textarea
          value={work}
          onChange={(e) => setWork(e.target.value)}
          rows={10}
          placeholder="Paste or write your essay, answer, code, or solution here…"
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={run} disabled={busy || !work.trim()} className="btn-primary px-5 py-2 text-sm">
          {busy ? "Reviewing…" : "Get feedback"}
        </button>
        <span className="text-xs text-ink-500">Detailed, real-time feedback — you keep the writing.</span>
      </div>

      {status === "offline" && (
        <div className="card border border-amber-200 bg-amber-50 text-sm text-amber-800">
          Real-time feedback isn&apos;t switched on yet — it activates when the coach goes live. Your work is safe; try again then.
        </div>
      )}
      {status === "rate" && (
        <div className="card border border-amber-200 bg-amber-50 text-sm text-amber-800">{errorMsg}</div>
      )}
      {status === "error" && (
        <div className="card border border-red-200 bg-red-50 text-sm text-red-700">{errorMsg}</div>
      )}

      {(output || busy) && (
        <div ref={outRef} className="card max-h-[60vh] overflow-y-auto">
          <FeedbackView text={output} />
          {busy && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-brand-500 align-middle" aria-hidden />}
        </div>
      )}
    </div>
  );
}

// Lightweight Markdown renderer for the streamed feedback (headings, bullets,
// **bold**) — no dependency, safe for partial/streaming text.
function FeedbackView({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-ink-700">
      {lines.map((line, i) => {
        const h = line.match(/^##\s+(.*)/);
        if (h) return <h3 key={i} className="pt-2 text-xs font-bold uppercase tracking-wider text-brand-600">{h[1]}</h3>;
        if (line.trim() === "") return <div key={i} className="h-1" />;
        const bullet = line.match(/^[-*]\s+(.*)/);
        const content = bullet ? bullet[1] : line;
        return (
          <p key={i} className={bullet ? "flex gap-2" : ""}>
            {bullet && <span className="text-brand-500">•</span>}
            <span>{renderInline(content)}</span>
          </p>
        );
      })}
    </div>
  );
}

// Render **bold** segments inline.
function renderInline(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    /^\*\*[^*]+\*\*$/.test(p) ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
  );
}
