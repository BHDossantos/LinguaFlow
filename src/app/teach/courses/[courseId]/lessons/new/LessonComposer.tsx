"use client";
import { useState, useTransition } from "react";
import { createLesson } from "@/app/teach/actions";

type LessonKind = "reading" | "grammar" | "listening" | "writing";

export function LessonComposer({ courseId }: { courseId: string }) {
  const [kind, setKind] = useState<LessonKind>("reading");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keyTerms, setKeyTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [minutes, setMinutes] = useState(10);

  const [generating, setGenerating] = useState(false);
  const [saving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (topic.trim().length < 3) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseId, target: "lesson", topic, lessonKind: kind }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "generation failed");
      const d = data.draft;
      setTitle(d.title ?? "");
      setContent(d.content ?? "");
      setKeyTerms(
        Array.isArray(d.key_terms)
          ? d.key_terms.map((t: any) => `${t.term}: ${t.definition}`).join("\n")
          : "",
      );
      setNotes(d.notes ?? "");
    } catch (e: any) {
      setError(e?.message ?? "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  function save() {
    setError(null);
    startSave(async () => {
      try {
        await createLesson({
          courseId,
          title,
          kind,
          content,
          keyTermsRaw: keyTerms,
          notes,
          estimatedMinutes: minutes,
        });
      } catch (e: any) {
        setError(e?.message ?? "Save failed");
      }
    });
  }

  const hasDraft = title.length > 0 || content.length > 0;

  return (
    <div className="space-y-4">
      <section className="card space-y-2">
        <h2 className="font-semibold">Draft with AI</h2>
        <div className="grid grid-cols-3 gap-2">
          <label className="col-span-1 block">
            <span className="text-sm font-medium">Kind</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as LessonKind)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-2 py-2 text-sm"
            >
              <option value="reading">Reading</option>
              <option value="grammar">Grammar</option>
              <option value="listening">Listening</option>
              <option value="writing">Writing</option>
            </select>
          </label>
          <label className="col-span-2 block">
            <span className="text-sm font-medium">Topic</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The water cycle"
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
            />
          </label>
        </div>
        <button
          onClick={generate}
          disabled={generating || topic.trim().length < 3}
          className="btn-primary w-full"
        >
          {generating ? "Generating…" : "Generate draft"}
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Review & edit
        </h2>

        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Key terms</span>
          <textarea
            value={keyTerms}
            onChange={(e) => setKeyTerms(e.target.value)}
            rows={4}
            placeholder="One per line:  term: definition"
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-sm font-medium">Teacher notes</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Est. minutes</span>
            <input
              type="number"
              min={1}
              max={180}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
            />
          </label>
        </div>

        <button
          onClick={save}
          disabled={saving || !hasDraft || title.trim().length < 2 || content.trim().length < 1}
          className="btn-primary w-full"
        >
          {saving ? "Saving…" : "Save lesson"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>
    </div>
  );
}
