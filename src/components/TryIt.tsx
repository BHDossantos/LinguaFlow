"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { scorePronunciation, type PronunciationResult } from "@/lib/pronunciation";

// Landing-page demo: try the speaking loop before signing up.
// Scoring runs entirely client-side (same algorithm as the real lesson
// player), so this works with zero backend and zero auth.
const PHRASES = [
  { text: "Hola, ¿cómo estás?", translation: "Hi, how are you?", locale: "es-MX" },
  { text: "Un café, por favor", translation: "A coffee, please", locale: "es-MX" },
  { text: "Me llamo Ana", translation: "My name is Ana", locale: "es-MX" },
  { text: "¿Cuánto cuesta?", translation: "How much is it?", locale: "es-MX" },
];

export function TryIt() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const recRef = useRef<any>(null);
  const phrase = PHRASES[phraseIdx];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  function listen() {
    try {
      const u = new SpeechSynthesisUtterance(phrase.text);
      u.lang = phrase.locale;
      u.rate = 0.92;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      // No TTS available — nothing to do.
    }
  }

  function grade(transcript: string) {
    if (!transcript.trim()) return;
    setResult(scorePronunciation(phrase.text, transcript));
  }

  function record() {
    setResult(null);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = phrase.locale;
    rec.interimResults = false;
    let captured = "";
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) captured += e.results[i][0].transcript + " ";
      }
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => {
      setRecording(false);
      grade(captured.trim());
    };
    try {
      rec.start();
      setRecording(true);
      recRef.current = rec;
    } catch {
      setRecording(false);
    }
  }

  function next() {
    setPhraseIdx((phraseIdx + 1) % PHRASES.length);
    setResult(null);
    setTyped("");
  }

  return (
    <div
      data-testid="try-it"
      className="rounded-3xl border border-black/5 bg-white p-5 shadow-xl shadow-brand-500/10 dark:border-white/10 dark:bg-white/[0.04]"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
          Try it right now
        </p>
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
          No sign-up needed
        </span>
      </div>

      <p className="mt-4 text-center text-3xl font-bold tracking-tight">{phrase.text}</p>
      <p className="mt-1 text-center text-sm text-ink-500">“{phrase.translation}”</p>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={listen}
          className="btn-ghost whitespace-nowrap"
          aria-label="Hear the phrase"
        >
          🔊 Listen
        </button>
        {supported ? (
          <button
            type="button"
            onClick={recording ? () => recRef.current?.stop() : record}
            className={"btn-primary " + (recording ? "animate-pulse" : "")}
            data-testid="tryit-say"
          >
            {recording ? "■ Stop" : "🎙️ Say it"}
          </button>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); grade(typed); }}
            className="flex gap-2"
            data-testid="tryit-typed"
          >
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type it…"
              className="w-36 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:bg-white/5"
            />
            <button type="submit" className="btn-primary" disabled={!typed.trim()}>
              Check
            </button>
          </form>
        )}
      </div>

      {result && (
        <div className="mt-5 rounded-2xl bg-brand-50 p-4 dark:bg-white/[0.06]" data-testid="tryit-result">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-brand-700 dark:text-brand-100">
              {result.score}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              accuracy
            </span>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {result.wordFeedback.map((w, i) => (
              <span
                key={i}
                title={w.hint ?? ""}
                className={
                  "rounded-lg px-2 py-0.5 text-sm font-medium " +
                  (w.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")
                }
              >
                {w.word}
              </span>
            ))}
          </div>
          <p className="mt-2 text-center text-sm text-ink-700 dark:text-white/80">{result.overallTip}</p>
          <Link href="/sign-in" className="btn-primary mt-3 block w-full text-center">
            Keep going — it's free
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={next}
        className="mt-3 block w-full text-center text-xs font-medium text-ink-500 underline-offset-2 hover:underline"
      >
        Try another phrase →
      </button>
    </div>
  );
}
