"use client";
import { useState, useTransition } from "react";
import { createLesson } from "@/app/teach/actions";

type ContentKind = "reading" | "grammar" | "listening" | "writing";
type LessonKind = "vocab" | "roleplay" | ContentKind;

type VocabRow = { term: string; translation: string; ipa: string; example: string };

const EMPTY_ROW: VocabRow = { term: "", translation: "", ipa: "", example: "" };

export function LessonComposer({ courseId }: { courseId: string }) {
  const [kind, setKind] = useState<LessonKind>("vocab");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(8);
  const [notes, setNotes] = useState("");

  // Per-kind state kept separate so switching tabs doesn't wipe drafts.
  const [items, setItems] = useState<VocabRow[]>([{ ...EMPTY_ROW }]);
  const [scenario, setScenario] = useState("");
  const [persona, setPersona] = useState("");
  const [goal, setGoal] = useState("");
  const [content, setContent] = useState("");
  const [keyTerms, setKeyTerms] = useState("");

  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (topic.trim().length < 3) return;
    if (kind === "vocab" || kind === "roleplay") return;
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

  function patchItem(i: number, patch: Partial<VocabRow>) {
    setItems((prev) => prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ROW }]);
  }
  function removeItem(i: number) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  function canSave(): boolean {
    if (title.trim().length < 2) return false;
    if (kind === "vocab") {
      return items.some((it) => it.term.trim() && it.translation.trim());
    }
    if (kind === "roleplay") return scenario.trim().length >= 5;
    return content.trim().length >= 1;
  }

  function save() {
    setError(null);
    startSave(async () => {
      try {
        if (kind === "vocab") {
          const cleanItems = items
            .filter((it) => it.term.trim() && it.translation.trim())
            .map((it) => ({
              term: it.term.trim(),
              translation: it.translation.trim(),
              ipa: it.ipa.trim() || undefined,
              example: it.example.trim() || undefined,
            }));
          if (cleanItems.length === 0) throw new Error("Add at least one term/translation pair");
          await createLesson({
            courseId, kind: "vocab", title, items: cleanItems,
            notes: notes || undefined, estimatedMinutes: minutes,
          });
        } else if (kind === "roleplay") {
          await createLesson({
            courseId, kind: "roleplay", title,
            scenario,
            persona: persona || undefined,
            goal: goal || undefined,
            notes: notes || undefined,
            estimatedMinutes: minutes,
          });
        } else {
          await createLesson({
            courseId, kind, title, content,
            keyTermsRaw: keyTerms || undefined,
            notes: notes || undefined,
            estimatedMinutes: minutes,
          });
        }
      } catch (e: any) {
        setError(e?.message ?? "Save failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      <section className="card space-y-2">
        <label className="block">
          <span className="text-sm font-medium">Lesson kind</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as LessonKind)}
            data-testid="lesson-kind"
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          >
            <option value="vocab">Vocab — flashcards with multi-mode practice</option>
            <option value="roleplay">Roleplay — conversation scenario</option>
            <option value="reading">Reading</option>
            <option value="grammar">Grammar</option>
            <option value="listening">Listening</option>
            <option value="writing">Writing</option>
          </select>
        </label>
      </section>

      {kind !== "vocab" && kind !== "roleplay" && (
        <section className="card space-y-2">
          <h2 className="font-semibold">
            Generate a draft <span className="text-xs font-normal text-ink-500">(optional)</span>
          </h2>
          <label className="block">
            <span className="text-sm font-medium">Topic</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The water cycle"
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
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          {kind === "vocab" ? "Vocabulary items" : kind === "roleplay" ? "Roleplay scenario" : "Content"}
        </h2>

        <label className="block">
          <span className="text-sm font-medium">Lesson title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              kind === "vocab" ? "e.g. Greetings & introductions" :
              kind === "roleplay" ? "e.g. Ordering at a café" :
              "Lesson title"
            }
            data-testid="lesson-title"
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </label>

        {kind === "vocab" && (
          <div className="space-y-2" data-testid="vocab-editor">
            {items.map((row, i) => (
              <div key={i} className="card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                    Item {i + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-xs text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={row.term}
                    onChange={(e) => patchItem(i, { term: e.target.value })}
                    placeholder="Term (target language)"
                    data-testid={`vocab-term-${i}`}
                    className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  />
                  <input
                    value={row.translation}
                    onChange={(e) => patchItem(i, { translation: e.target.value })}
                    placeholder="Translation"
                    data-testid={`vocab-translation-${i}`}
                    className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  />
                  <input
                    value={row.ipa}
                    onChange={(e) => patchItem(i, { ipa: e.target.value })}
                    placeholder="IPA (optional)"
                    className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  />
                  <input
                    value={row.example}
                    onChange={(e) => patchItem(i, { example: e.target.value })}
                    placeholder="Example sentence (optional)"
                    className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              data-testid="vocab-add"
              className="btn-ghost w-full"
            >
              + Add item
            </button>
          </div>
        )}

        {kind === "roleplay" && (
          <div className="space-y-3" data-testid="roleplay-editor">
            <label className="block">
              <span className="text-sm font-medium">Scenario</span>
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                rows={4}
                placeholder="e.g. You walk into a café in Mexico City. Order a coffee and a pastry, ask the price, pay."
                data-testid="roleplay-scenario"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Roleplay persona (optional)</span>
              <input
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="e.g. Friendly barista in Mexico City"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Goal (optional)</span>
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Complete the order with no English"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}

        {(kind === "reading" || kind === "grammar" || kind === "listening" || kind === "writing") && (
          <div className="space-y-3">
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
          </div>
        )}

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
          type="button"
          onClick={save}
          disabled={saving || !canSave()}
          data-testid="lesson-save"
          className="btn-primary w-full"
        >
          {saving ? "Saving…" : "Save lesson"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>
    </div>
  );
}
