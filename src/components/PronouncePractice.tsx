"use client";
import { useEffect, useRef, useState } from "react";

type Result = {
  score: number;
  wordFeedback: { word: string; ok: boolean; hint?: string }[];
  overallTip: string;
};

type Props = {
  reference: string;
  language: string;
  // Optional BCP-47 locale, e.g. "es-MX". Falls back to the language code.
  locale?: string;
};

// One round of speaking practice for a single phrase.
// 1. Tap a card to hear the target spoken (browser TTS).
// 2. Tap "Say it" — captures speech via Web Speech API.
// 3. Sends transcript to /api/pronunciation for scoring + DB write.
// 4. Renders per-word feedback and an overall tip.
// Includes a typed fallback when SpeechRecognition isn't available
// (Firefox, older Safari, headless test browsers).
export function PronouncePractice({ reference, language, locale }: Props) {
  const speechLocale = locale ?? `${language}-${language.toUpperCase()}`;
  const [supported, setSupported] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  function speak() {
    if (typeof window === "undefined") return;
    const u = new SpeechSynthesisUtterance(reference);
    u.lang = speechLocale;
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function score(t: string) {
    if (!t.trim()) return;
    setScoring(true);
    setError(null);
    try {
      const r = await fetch("/api/pronunciation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language, reference, transcript: t }),
      });
      if (!r.ok) throw new Error(`scoring failed (${r.status})`);
      setResult(await r.json());
    } catch (e: any) {
      setError(e?.message ?? "Could not score attempt");
    } finally {
      setScoring(false);
    }
  }

  function startRecording() {
    setResult(null);
    setTranscript("");
    setError(null);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = speechLocale;
    rec.interimResults = false;
    rec.continuous = false;
    let captured = "";
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) captured += e.results[i][0].transcript + " ";
      }
    };
    rec.onerror = (e: any) => {
      setError(e?.error === "not-allowed" ? "Microphone permission denied" : `Recognition error: ${e?.error}`);
      setRecording(false);
    };
    rec.onend = () => {
      setRecording(false);
      const t = captured.trim();
      if (t) {
        setTranscript(t);
        score(t);
      }
    };
    try {
      rec.start();
      setRecording(true);
      recRef.current = rec;
    } catch (e: any) {
      setError(e?.message ?? "Could not start recording");
    }
  }

  function stopRecording() {
    try { recRef.current?.stop(); } catch {}
  }

  function reset() {
    setResult(null);
    setTranscript("");
    setError(null);
  }

  return (
    <div data-testid="pronounce-practice" className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-700">Practice saying it</p>
        <button
          type="button"
          onClick={speak}
          aria-label="Hear the target phrase"
          className="text-sm text-brand-600 underline"
        >
          🔊 Listen
        </button>
      </div>

      {supported === false ? (
        <TypedFallback onSubmit={score} pending={scoring} />
      ) : recording ? (
        <button
          type="button"
          onClick={stopRecording}
          className="btn-primary w-full"
          data-testid="stop-recording"
        >
          ■ Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          disabled={scoring}
          className="btn-primary w-full"
          data-testid="start-recording"
        >
          🎙️ {result ? "Try again" : "Say it"}
        </button>
      )}

      {transcript && (
        <p className="text-xs text-ink-500" data-testid="heard-transcript">
          Heard: <span className="italic">{transcript}</span>
        </p>
      )}

      {scoring && <p className="text-xs text-ink-500">Scoring…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {result && (
        <div className="card space-y-2" data-testid="pronunciation-result">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold" data-testid="pronunciation-score">
              {result.score}
            </span>
            <span className="text-xs uppercase tracking-wider text-ink-500">accuracy</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-sm">
            {result.wordFeedback.map((w, i) => (
              <span
                key={i}
                title={w.hint ?? ""}
                className={
                  "rounded-md px-2 py-0.5 " +
                  (w.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")
                }
              >
                {w.word}
              </span>
            ))}
          </div>
          <p className="text-sm text-ink-700">{result.overallTip}</p>
          <button type="button" onClick={reset} className="text-xs text-ink-500 underline">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

function TypedFallback({
  onSubmit, pending,
}: { onSubmit: (s: string) => void; pending: boolean }) {
  const [v, setV] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(v); }}
      className="space-y-2"
      data-testid="typed-fallback"
    >
      <p className="text-xs text-ink-500">
        Speech recognition isn't available here — type what you said instead.
      </p>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Type your attempt…"
        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending || !v.trim()}
        className="btn-primary w-full"
      >
        Check
      </button>
    </form>
  );
}
