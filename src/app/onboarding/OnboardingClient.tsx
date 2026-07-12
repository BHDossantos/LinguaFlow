"use client";
import { useEffect, useState, useTransition } from "react";
import { LANGUAGES, LANGUAGE_CODES, type LanguageCode } from "@/lib/languages";
import { GOALS } from "@/lib/goals";
import { PLACEMENT, scorePlacement } from "@/lib/placement";
import { saveOnboarding } from "./actions";

const CEFR = [
  { id: "A1", label: "A1 — brand new", desc: "I know almost nothing." },
  { id: "A2", label: "A2 — basics", desc: "I can introduce myself, ask simple things." },
  { id: "B1", label: "B1 — getting by", desc: "Daily situations, simple stories." },
  { id: "B2", label: "B2 — comfortable", desc: "I can argue, follow most TV." },
  { id: "C1", label: "C1 — fluent", desc: "Almost native, some slips." },
  { id: "C2", label: "C2 — near-native", desc: "I want polish, not basics." },
];

export function OnboardingClient({ defaultName = "" }: { defaultName?: string }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(defaultName);
  // Multi-select: learners often want more than one language. The first
  // pick is the primary one (drives the initial dashboard/learn view).
  const [langs, setLangs] = useState<LanguageCode[]>([]);
  const [dialects, setDialects] = useState<Partial<Record<LanguageCode, string>>>({});
  const [cefr, setCefr] = useState("A1");
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [adultMode, setAdultMode] = useState(true);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const total = 4;

  // Languages with a single variant don't need a choice — auto-assign it.
  useEffect(() => {
    setDialects((d) => {
      let changed = false;
      const next = { ...d };
      for (const l of langs) {
        const opts = LANGUAGES[l].dialects;
        if (opts.length === 1 && next[l] !== opts[0].code) {
          next[l] = opts[0].code;
          changed = true;
        }
      }
      return changed ? next : d;
    });
  }, [langs]);

  const needsVariantChoice = langs.some((l) => LANGUAGES[l].dialects.length > 1);
  const allVariantsChosen = langs.every((l) => !!dialects[l]);

  function next() {
    setStep((s) => {
      const n = Math.min(s + 1, total - 1);
      // Nothing to pick on the variant step? Skip it.
      return n === 1 && !needsVariantChoice ? 2 : n;
    });
  }
  function back() {
    setStep((s) => {
      const n = Math.max(s - 1, 0);
      return n === 1 && !needsVariantChoice ? 0 : n;
    });
  }

  function toggleLang(c: LanguageCode) {
    setLangs((ls) => {
      if (ls.includes(c)) {
        setDialects((d) => {
          const nextD = { ...d };
          delete nextD[c];
          return nextD;
        });
        return ls.filter((x) => x !== c);
      }
      return [...ls, c];
    });
  }

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
          name: name.trim(),
          languages: langs.map((l) => ({ language: l, dialect: dialects[l] ?? null })),
          cefr, goals, adultMode, nativeLanguage,
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
          <p className="text-sm text-ink-500">
            Pick as many as you like — your first pick becomes your main focus.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGE_CODES.map((c) => {
              const selected = langs.includes(c);
              const order = langs.indexOf(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleLang(c)}
                  className={`card flex items-center gap-2 ${selected ? "ring-2 ring-brand-500" : ""}`}
                >
                  <span className="text-xl">{LANGUAGES[c].flag}</span>
                  <span className="font-medium">{LANGUAGES[c].label}</span>
                  {selected && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
                      {order === 0 ? "★" : order + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4">
          <h1 className="text-2xl font-bold">Which variant{langs.length > 1 ? "s" : ""}?</h1>
          <p className="text-sm text-ink-500">
            We&apos;ll teach each dialect&apos;s pronunciation, vocabulary, and slang. You can change this later.
          </p>
          {langs
            .filter((l) => LANGUAGES[l].dialects.length > 1)
            .map((l) => (
              <div key={l} className="space-y-2">
                <p className="text-sm font-semibold">
                  {LANGUAGES[l].flag} {LANGUAGES[l].label}
                </p>
                {LANGUAGES[l].dialects.map((d) => (
                  <button
                    key={d.code}
                    onClick={() => setDialects((prev) => ({ ...prev, [l]: d.code }))}
                    className={`card flex w-full items-center justify-between text-left ${dialects[l] === d.code ? "ring-2 ring-brand-500" : ""}`}
                  >
                    <span>{d.label}</span>
                    {dialects[l] === d.code && <span className="text-brand-500">✓</span>}
                  </button>
                ))}
              </div>
            ))}
        </section>
      )}

      {step === 2 && (
        <section className="space-y-3">
          <h1 className="text-2xl font-bold">Where are you now?</h1>
          <p className="text-sm text-ink-500">Honest beats optimistic — we&apos;ll calibrate.</p>
          {testing ? (
            <PlacementTest
              language={langs[0] ?? "es"}
              onDone={(level) => {
                setCefr(level);
                setTested(level);
                setTesting(false);
              }}
              onCancel={() => setTesting(false)}
            />
          ) : (
            <>
              <button
                onClick={() => setTesting(true)}
                className="card w-full border-dashed text-left"
              >
                <p className="font-medium">🎯 Not sure? Take the 2-minute placement test</p>
                <p className="text-xs text-ink-500">
                  8 quick questions in {LANGUAGES[langs[0] ?? "es"].label} — we measure your level instead of guessing.
                </p>
              </button>
              {tested && (
                <p className="card border-green-200 bg-green-50 text-sm text-green-700">
                  ✓ Placement result: <strong>{tested}</strong> — selected below. Override it if it feels wrong.
                </p>
              )}
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
            </>
          )}
        </section>
      )}

      {step === 3 && (
        <section className="space-y-3">
          <h1 className="text-2xl font-bold">About you</h1>
          <label className="block">
            <span className="text-sm font-medium">What should we call you?</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-3"
            />
          </label>
          <h2 className="pt-1 text-lg font-bold">Why are you learning?</h2>
          <p className="text-sm text-ink-500">Pick anything that fits. We&apos;ll bias content toward your goals.</p>
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

      <div className={`flex gap-2 ${testing && step === 2 ? "hidden" : ""}`}>
        {step > 0 && (
          <button onClick={back} className="btn-ghost flex-1">Back</button>
        )}
        {step < total - 1 ? (
          <button
            onClick={next}
            disabled={
              (step === 0 && langs.length === 0) ||
              (step === 1 && !allVariantsChosen)
            }
            className="btn-primary flex-1 disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={pending || !name.trim()}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Start learning"}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

// Inline placement test: one question at a time, instant feedback withheld
// until the end so answers stay honest. Result maps total-correct → CEFR.
function PlacementTest({
  language, onDone, onCancel,
}: {
  language: LanguageCode;
  onDone: (level: string) => void;
  onCancel: () => void;
}) {
  const questions = PLACEMENT[language];
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = questions[i];

  function submit() {
    if (picked === null) return;
    const nextCorrect = correct + (picked === q.answer ? 1 : 0);
    setPicked(null);
    if (i + 1 < questions.length) {
      setCorrect(nextCorrect);
      setI(i + 1);
    } else {
      onDone(scorePlacement(nextCorrect));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-ink-500">
        <span>Question {i + 1} of {questions.length}</span>
        <button onClick={onCancel} className="underline">Cancel test</button>
      </div>
      <div className="card space-y-3">
        <p className="font-medium">{q.prompt}</p>
        <div className="space-y-2">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setPicked(idx)}
              className={`card w-full py-2.5 text-left text-sm ${picked === idx ? "ring-2 ring-brand-500" : ""}`}
            >
              {opt}
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={picked === null}
          className="btn-primary w-full disabled:opacity-50"
        >
          {i + 1 < questions.length ? "Next" : "See my level"}
        </button>
      </div>
    </div>
  );
}
