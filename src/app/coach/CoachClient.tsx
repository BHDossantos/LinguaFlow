"use client";
import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Explain ser vs. estar like I'm five",
  "Give me 5 practice sentences",
  "Test me on greetings",
  "How do I roll my Rs?",
];

// Tutor modes: same coach, different pedagogy. Socratic guides with
// questions instead of revealing answers.
const MODES = [
  { id: "explain", label: "💡 Explain", hint: "clear explanations at your level" },
  { id: "socratic", label: "🧭 Socratic", hint: "guides you with questions, never spoils the answer" },
  { id: "practice", label: "✏️ Practice", hint: "generates problems and drills" },
  { id: "review", label: "🔁 Review", hint: "targets your weak spots" },
] as const;
type ModeId = (typeof MODES)[number]["id"];

export function CoachClient() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [mode, setMode] = useState<ModeId>("explain");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, mode }),
      });
      if (r.status === 503) {
        setOffline(true);
        return;
      }
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "coach error");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Something went wrong — try that again." },
      ]);
    } finally {
      setBusy(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <header className="mb-3">
        <h1 className="text-2xl font-bold">Coach</h1>
        <p className="text-sm text-ink-500">
          Your personal tutor. Ask anything — explanations, practice, quizzes.
        </p>
      </header>

      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            title={m.hint}
            onClick={() => setMode(m.id)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
              mode === m.id
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-black/10 bg-white text-ink-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {offline && (
        <div className="card mb-3 border-amber-200 bg-amber-50 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          The coach isn't connected yet on this deployment. Everything else —
          lessons, reviews, pronunciation — works without it.
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto pb-4" data-testid="coach-thread">
        {messages.length === 0 && !offline && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Try asking
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="card block w-full text-left text-sm hover:border-brand-500/40"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-8 rounded-2xl rounded-br-md bg-brand-500 p-3 text-sm text-white"
                : "mr-8 rounded-2xl rounded-bl-md bg-white p-3 text-sm shadow-sm dark:bg-white/[0.06]"
            }
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {busy && (
          <div className="mr-8 rounded-2xl rounded-bl-md bg-white p-3 text-sm text-ink-500 shadow-sm dark:bg-white/[0.06]">
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="sticky bottom-16 flex gap-2 bg-gradient-to-t from-[#fafbff] via-[#fafbff] to-transparent pb-2 pt-3 dark:from-[#0b1020] dark:via-[#0b1020]"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          disabled={offline}
          className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 dark:bg-white/5"
        />
        <button type="submit" disabled={busy || offline || !input.trim()} className="btn-primary">
          Send
        </button>
      </form>
    </div>
  );
}
