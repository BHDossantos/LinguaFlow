"use client";
import { useEffect, useState, useTransition } from "react";
import { LANGUAGES, LANGUAGE_CODES, type LanguageCode } from "@/lib/languages";
import { saveOnboarding } from "./actions";

const GOALS = [
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "work", label: "Work", icon: "💼" },
  { id: "family", label: "Family / partner", icon: "👨‍👩‍👧" },
  { id: "school", label: "School / exams", icon: "🎓" },
  { id: "media", label: "Films & shows", icon: "🎬" },
  { id: "dating", label: "Dating", icon: "💛" },
];

const CEFR = [
  { id: "A1", label: "A1 — brand new", desc: "I know almost nothing." },
  { id: "A2", label: "A2 — basics", desc: "I can introduce myself, ask simple things." },
  { id: "B1", label: "B1 — getting by", desc: "Daily situations, simple stories." },
  { id: "B2", label: "B2 — comfortable", desc: "I can argue, follow most TV." },
  { id: "C1", label: "C1 — fluent", desc: "Almost native, some slips." },
  { id: "C2", label: "C2 — near-native", desc: "I want polish, not basics." },
];

export function OnboardingClient() {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<LanguageCode>("es");
  const [dialect, setDialect] = useState<string | null>(null);
  const [cefr, setCefr] = useState("A1");
  const [goals, setGoals] = useState<string[]>([]);
  const [adultMode, setAdultMode] = useState(true);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const dialects = LANGUAGES[language].dialects;
  const total = 4;

  useEffect(() => {
    if (dialects.length === 1 && dialect !== dialects[0].code) {
      setDialect(dialects[0].code);
    }
  }, [dialects, dialect]);

  function next() { setStep((s) => Math.min(s + 1, total - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  function toggleGoal(id: string) {
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  }

  function submit() {
    setError(null);
    const nativeLanguage =
      typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "en";
    start(async () => {
      try {
        await saveOnboarding({
          language, dialect, cefr, goals, adultMode, nativeLanguage,
        });
      } catch (e: any) {
        setError(e?.message ?? "Could not save");
      }
    });
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-wider text-ink-500">
          Step {step + 1} of {total}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </header>

      {step === 0 && (
        <section className="space-y-3">
          <h1 className="text-2xl font-bold">What do you want to learn?</h1>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGE_CODES.map((c) => (
              <button
                key={c}
                onClick={() => { setLanguage(c); setDialect(null); }}
                className={`card flex items-center gap-2 ${language === c ? "ring-2 ring-brand-500" : ""}`}
              >
                <span className="text-xl">{LANGUAGES[c].flag}</span>
                <span className="font-medium">{LANGUAGES[c].label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-3">
          <h1 className="text-2xl font-bold">Which variant?</h1>
          <p className="text-sm text-ink-500">
            We'll teach this dialect's pronunciation, vocabulary, and slang. You can change it later.
          </p>
          <div className="space-y-2">
            {dialects.map((d) => (
              <button
                key={d.code}
                onClick={() => setDialect(d.code)}
                className={`card flex w-full items-center justify-between text-left ${dialect === d.code ? "ring-2 ring-brand-500" : ""}`}
              >
                <span>{d.label}</span>
                {dialect === d.code && <span className="text-brand-500">✓</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-3">
          <h1 className="text-2xl font-bold">Where are you now?</h1>
          <p className="text-sm text-ink-500">Honest beats optimistic — we'll calibrate.</p>
          <div className="space-y-2">
            {CEFR.map((c) => (
              <button
                key={c.id}
                onClick={() => setCefr(c.id)}
                className={`card w-full text-left ${cefr === c.id ? "ring-2 ring-brand-500" : ""}`}
              >
                <p className="font-medium">{c.label}</p>
                <p className="text-xs text-ink-500">{c.desc}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-3">
          <h1 className="text-2xl font-bold">Why are you learning?</h1>
          <p className="text-sm text-ink-500">Pick anything that fits. We'll bias content toward your goals.</p>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className={`card flex items-center gap-2 ${goals.includes(g.id) ? "ring-2 ring-brand-500" : ""}`}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
          <label className="card mt-3 flex items-start gap-3">
            <input
              type="checkbox"
              checked={adultMode}
              onChange={(e) => setAdultMode(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm">
              <span className="font-medium">Adult mode</span>
              <span className="block text-xs text-ink-500">
                Mature topics, professional vocabulary tracks, no babying.
              </span>
            </span>
          </label>
        </section>
      )}

      <div className="flex gap-2">
        {step > 0 && (
          <button onClick={back} className="btn-ghost flex-1">Back</button>
        )}
        {step < total - 1 ? (
          <button
            onClick={next}
            disabled={step === 1 && !dialect}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <button onClick={submit} disabled={pending} className="btn-primary flex-1">
            {pending ? "Saving…" : "Start learning"}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
