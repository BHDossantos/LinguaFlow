"use client";
import { useState } from "react";

type Output = "flashcards" | "quiz" | "summary";
type Flashcard = { front: string; back: string };
type Question = { prompt: string; options: string[]; answer: number; explanation: string };
type Summary = { summary: string; keyPoints: string[]; glossary: { term: string; definition: string }[] };

const OUTPUTS: { id: Output; label: string; hint: string }[] = [
  { id: "flashcards", label: "🃏 Flashcards", hint: "term/answer cards to drill" },
  { id: "quiz", label: "❓ Practice quiz", hint: "multiple-choice with explanations" },
  { id: "summary", label: "📝 Summary", hint: "overview, key points, glossary" },
];

export function StudyToolsClient() {
  const [source, setSource] = useState("");
  const [output, setOutput] = useState<Output>("flashcards");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ output: Output; data: any } | null>(null);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  async function generate() {
    if (source.trim().length < 40 || busy) return;
    setBusy(true); setError(null); setResult(null); setFlipped({});
    try {
      const r = await fetch("/api/study-tools", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source, output }),
      });
      if (r.status === 503) { setOffline(true); return; }
      const data = await r.json();
      if (!r.ok) { setError(data.error ? "Could not generate — try again." : "Something went wrong."); return; }
      setResult(data);
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setBusy(false);
    }
  }

  const [reading, setReading] = useState(false);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const isText = /\.(txt|md|markdown|csv|rtf|text)$/i.test(file.name) || file.type.startsWith("text/");
    try {
      setReading(true);
      let text = "";
      if (isText) {
        // Plain text reads instantly in the browser, no upload.
        text = (await file.text()).slice(0, 16000);
      } else {
        // PDF/DOCX are extracted server-side.
        const fd = new FormData();
        fd.append("file", file);
        const r = await fetch("/api/extract", { method: "POST", body: fd });
        const data = await r.json();
        if (!r.ok) { setError(data.error ?? "Could not read that file."); return; }
        text = data.text;
      }
      setSource((prev) => (prev ? prev + "\n\n" : "") + text);
    } catch {
      setError("Could not read that file — try another.");
    } finally {
      setReading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <textarea
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder="Paste your notes, transcript, or a chapter here…"
        rows={8}
        className="w-full rounded-xl border border-black/10 bg-white p-3 text-sm dark:bg-white/5"
      />
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
        📎 {reading ? "Reading file…" : "Upload a PDF, Word doc, or text file"}
        <input
          type="file"
          accept=".txt,.md,.markdown,.csv,.rtf,.pdf,.docx,text/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={onFile}
          disabled={reading}
          className="sr-only"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {OUTPUTS.map((o) => (
          <button
            key={o.id}
            type="button"
            title={o.hint}
            onClick={() => setOutput(o.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              output === o.id ? "border-brand-500 bg-brand-500 text-white" : "border-black/10 bg-white text-ink-700"
            }`}
          >
            {o.label}
          </button>
        ))}
        <button
          type="button"
          onClick={generate}
          disabled={busy || source.trim().length < 40}
          className="btn-primary ml-auto px-5 py-2 text-sm"
        >
          {busy ? "Generating…" : "Generate"}
        </button>
      </div>

      {offline && (
        <div className="card border-amber-200 bg-amber-50 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10">
          Study-tools generation isn't connected on this deployment yet. It turns on
          automatically once the learning engine is enabled.
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {result?.output === "flashcards" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {(result.data.flashcards as Flashcard[] ?? []).map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
              className="card min-h-[90px] text-left"
            >
              <p className="text-[10px] uppercase tracking-wider text-ink-500">{flipped[i] ? "Answer" : "Card"} · tap to flip</p>
              <p className="mt-1 text-sm font-medium">{flipped[i] ? c.back : c.front}</p>
            </button>
          ))}
        </div>
      )}

      {result?.output === "quiz" && (
        <ol className="space-y-3">
          {(result.data.questions as Question[] ?? []).map((q, i) => (
            <li key={i} className="card">
              <p className="text-sm font-medium">{i + 1}. {q.prompt}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {q.options.map((opt, j) => (
                  <li key={j} className={j === q.answer ? "font-semibold text-green-700" : "text-ink-700"}>
                    {String.fromCharCode(65 + j)}. {opt} {j === q.answer ? "✓" : ""}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-ink-500">{q.explanation}</p>
            </li>
          ))}
        </ol>
      )}

      {result?.output === "summary" && (
        <div className="space-y-3">
          <div className="card">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Summary</p>
            <p className="mt-1 text-sm">{(result.data as Summary).summary}</p>
          </div>
          {((result.data as Summary).keyPoints ?? []).length > 0 && (
            <div className="card">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Key points</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {(result.data as Summary).keyPoints.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </div>
          )}
          {((result.data as Summary).glossary ?? []).length > 0 && (
            <div className="card">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Glossary</p>
              <dl className="mt-1 space-y-1 text-sm">
                {(result.data as Summary).glossary.map((g, i) => (
                  <div key={i}><dt className="inline font-semibold">{g.term}:</dt> <dd className="inline text-ink-700">{g.definition}</dd></div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}

      <p className="text-center text-[11px] text-ink-500">
        Everything is generated only from the material you paste — traceable to your source.
      </p>
    </div>
  );
}
