"use client";
import { useState } from "react";
import { createAssignment } from "@/app/teach/actions";

type AssignmentKind = "essay" | "short_answer" | "math" | "speaking" | "project";

export function AssignmentComposer({ courseId }: { courseId: string }) {
  const [kind, setKind] = useState<AssignmentKind>("essay");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [rubric, setRubric] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [dueAt, setDueAt] = useState("");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (topic.trim().length < 3) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseId, target: "assignment", topic, assignmentKind: kind }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "generation failed");
      const d = data.draft;
      setTitle(d.title ?? "");
      setInstructions(d.instructions_md ?? "");
      setRubric(
        Array.isArray(d.rubric)
          ? d.rubric
              .map((r: any) => `${r.name} | ${r.weight} | ${r.description ?? ""}`)
              .join("\n")
          : "",
      );
      if (typeof d.max_score === "number") setMaxScore(d.max_score);
    } catch (e: any) {
      setError(e?.message ?? "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="card space-y-2">
        <h2 className="font-semibold">Generate a draft</h2>
        <label className="block">
          <span className="text-sm font-medium">Topic</span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Compare two causes of World War I"
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={generate}
          disabled={generating || topic.trim().length < 3}
          className="btn-primary w-full"
        >
          {generating ? "Generating…" : "Generate draft"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      <form action={createAssignment} className="space-y-3">
        <input type="hidden" name="courseId" value={courseId} />

        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input
            name="title"
            required
            minLength={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Instructions (Markdown)</span>
          <textarea
            name="instructions"
            rows={6}
            required
            minLength={5}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Rubric</span>
          <textarea
            name="rubric"
            rows={4}
            value={rubric}
            onChange={(e) => setRubric(e.target.value)}
            placeholder={"name | weight | description, one per line"}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
          />
          <span className="text-xs text-ink-500">Leave blank to use a default rubric.</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          <label className="block">
            <span className="text-sm font-medium">Kind</span>
            <select
              name="kind"
              required
              value={kind}
              onChange={(e) => setKind(e.target.value as AssignmentKind)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
            >
              <option value="essay">Essay</option>
              <option value="short_answer">Short answer</option>
              <option value="math">Math</option>
              <option value="speaking">Speaking</option>
              <option value="project">Project</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Max score</span>
            <input
              name="maxScore"
              type="number"
              min={1}
              max={1000}
              required
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Due date</span>
            <input
              name="dueAt"
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
            />
          </label>
        </div>

        <button type="submit" className="btn-primary w-full">Publish assignment</button>
      </form>
    </div>
  );
}
