"use client";
import { useState } from "react";
import { LANGUAGES, type LanguageCode } from "@/lib/languages";

const SCENARIOS = [
  { title: "Order coffee", scenario: "Order a coffee and pastry at a café and pay.", persona: "friendly barista" },
  { title: "Job interview", scenario: "First-round interview for a marketing role; introduce yourself and answer 3 questions.", persona: "polite hiring manager" },
  { title: "Doctor visit", scenario: "Describe a sore throat and fever to a doctor; understand instructions.", persona: "calm general practitioner" },
  { title: "Apartment hunting", scenario: "Visit a flat and ask about rent, utilities, neighborhood.", persona: "landlord" },
  { title: "Make a friend", scenario: "Strike up small talk at a bar and invite the person to a meetup.", persona: "outgoing local your age" },
  { title: "Lost wallet", scenario: "Report a lost wallet at a police station; describe where you were.", persona: "patient officer" },
];

type Turn = { role: "user" | "assistant"; content: string };
type Meta = {
  corrections: { wrong: string; right: string; why: string }[];
  newWords: { term: string; translation: string }[];
  confidence: number | null;
};

export function PracticeClient({
  defaultLanguage = "es", defaultCefr = "A2",
}: { defaultLanguage?: LanguageCode; defaultCefr?: string }) {
  const [language, setLanguage] = useState<LanguageCode>(defaultLanguage);
  const [cefr, setCefr] = useState(defaultCefr);
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [history, setHistory] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [meta, setMeta] = useState<Meta | null>(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMessage = input;
    const next: Turn[] = [...history, { role: "user", content: userMessage }];
    setHistory(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/roleplay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          language, cefr, scenario: scenario.scenario, persona: scenario.persona,
          history, userMessage,
        }),
      });
      const data = await res.json();
      setHistory([...next, { role: "assistant", content: data.reply }]);
      setMeta(data.meta);
      if (data.meta?.newWords?.length) {
        fetch("/api/vocab/capture", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ language, items: data.meta.newWords }),
        }).catch(() => {});
      }
    } finally {
      setBusy(false);
    }
  }

  function reset() { setHistory([]); setMeta(null); }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">AI Roleplay</h1>
      <p className="text-sm text-ink-500">
        Real conversations, no judgment. Mistakes are corrected at the end of each turn.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <select value={language} onChange={(e) => { setLanguage(e.target.value as LanguageCode); reset(); }}
          className="rounded-xl border border-black/10 bg-white px-3 py-2">
          {Object.entries(LANGUAGES).map(([c, l]) => (
            <option key={c} value={c}>{l.flag} {l.label}</option>
          ))}
        </select>
        <select value={cefr} onChange={(e) => setCefr(e.target.value)}
          className="rounded-xl border border-black/10 bg-white px-3 py-2">
          {["A1","A2","B1","B2","C1","C2"].map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SCENARIOS.map((s) => (
          <button key={s.title} onClick={() => { setScenario(s); reset(); }}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${
              s.title === scenario.title
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-black/10 bg-white text-ink-700"
            }`}>
            {s.title}
          </button>
        ))}
      </div>

      <div className="card text-sm">
        <span className="font-semibold">Scenario:</span> {scenario.scenario}
      </div>

      <div className="space-y-2">
        {history.map((t, i) => (
          <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
            t.role === "user"
              ? "ml-auto bg-brand-500 text-white"
              : "bg-white border border-black/5"
          }`}>
            {t.content}
          </div>
        ))}
      </div>

      {meta && (meta.corrections?.length > 0 || meta.newWords?.length > 0) && (
        <div className="card space-y-2 border-amber-200 bg-amber-50">
          {meta.corrections?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-amber-700">Corrections</p>
              <ul className="mt-1 space-y-1 text-sm">
                {meta.corrections.map((c, i) => (
                  <li key={i}>
                    <span className="line-through text-red-600">{c.wrong}</span> → <span className="font-semibold">{c.right}</span>
                    <span className="block text-xs text-ink-500">{c.why}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {meta.newWords?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-amber-700">New words (added to SRS)</p>
              <ul className="mt-1 text-sm">
                {meta.newWords.map((w, i) => <li key={i}>• <strong>{w.term}</strong> — {w.translation}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="sticky bottom-20 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`Reply in ${LANGUAGES[language].label}…`}
          className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-3"
        />
        <button onClick={send} disabled={busy} className="btn-primary">
          {busy ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
