"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { scorePronunciation, type PronunciationResult } from "@/lib/pronunciation";

// Landing-page demo: a taste of the whole platform before signing up. It rotates
// across subjects — speak a language phrase (scored client-side), or answer a
// quick multiple-choice challenge in math, code, SQL, science, or history — so
// the widget shows Noelia's breadth, not just languages. Zero backend, zero auth.

type SpeakDemo = {
  type: "speak";
  subject: string;
  text: string;
  translation: string;
  locale: string;
};
type QuizDemo = {
  type: "quiz";
  subject: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};
type Demo = SpeakDemo | QuizDemo;

const DEMOS: Demo[] = [
  { type: "speak", subject: "Spanish", text: "Hola, ¿cómo estás?", translation: "Hi, how are you?", locale: "es-MX" },
  { type: "quiz", subject: "Math", prompt: "What is 15% of 80?", options: ["8", "12", "15", "20"], answer: 1, explanation: "10% of 80 is 8 and 5% is 4, so 15% is 12." },
  { type: "quiz", subject: "Python", prompt: "What does len(\"noelia\") return?", options: ["5", "6", "7", "\"noelia\""], answer: 1, explanation: "len counts the characters: n-o-e-l-i-a is 6." },
  { type: "quiz", subject: "Science", prompt: "Which is the largest planet in our solar system?", options: ["Earth", "Saturn", "Jupiter", "Neptune"], answer: 2, explanation: "Jupiter is the largest planet by far." },
  { type: "speak", subject: "Spanish", text: "Un café, por favor", translation: "A coffee, please", locale: "es-MX" },
  { type: "quiz", subject: "History", prompt: "In which year did World War II end?", options: ["1918", "1939", "1945", "1950"], answer: 2, explanation: "World War II ended in 1945." },
  { type: "quiz", subject: "SQL", prompt: "Which SQL keyword retrieves rows from a table?", options: ["GET", "SELECT", "FETCH", "OPEN"], answer: 1, explanation: "SELECT retrieves rows; e.g. SELECT * FROM students." },
];

export function TryIt() {
  const [idx, setIdx] = useState(0);
  const demo = DEMOS[idx];

  function next() {
    setIdx((i) => (i + 1) % DEMOS.length);
  }

  return (
    <div
      data-testid="try-it"
      className="rounded-3xl border border-black/5 bg-white p-5 shadow-xl shadow-brand-500/10 dark:border-white/10 dark:bg-white/[0.04]"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Try it right now</p>
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
          No sign-up needed
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-white/10 dark:text-brand-100">
          {demo.subject}
        </span>
        <span className="text-[11px] text-ink-500">a taste of 170+ courses</span>
      </div>

      {demo.type === "speak" ? (
        <SpeakCard key={idx} demo={demo} />
      ) : (
        <QuizCard key={idx} demo={demo} />
      )}

      <button
        type="button"
        onClick={next}
        className="mt-3 block w-full text-center text-xs font-medium text-ink-500 underline-offset-2 hover:underline"
      >
        Try another →
      </button>
    </div>
  );
}

function SpeakCard({ demo }: { demo: SpeakDemo }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  function listen() {
    try {
      const u = new SpeechSynthesisUtterance(demo.text);
      u.lang = demo.locale;
      u.rate = 0.92;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      // No TTS available.
    }
  }
  function grade(transcript: string) {
    if (!transcript.trim()) return;
    setResult(scorePronunciation(demo.text, transcript));
  }
  function record() {
    setResult(null);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = demo.locale;
    rec.interimResults = false;
    let captured = "";
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) captured += e.results[i][0].transcript + " ";
      }
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => { setRecording(false); grade(captured.trim()); };
    try { rec.start(); setRecording(true); recRef.current = rec; } catch { setRecording(false); }
  }

  return (
    <>
      <p className="mt-4 text-center text-3xl font-bold tracking-tight">{demo.text}</p>
      <p className="mt-1 text-center text-sm text-ink-500">“{demo.translation}”</p>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button type="button" onClick={listen} className="btn-ghost whitespace-nowrap" aria-label="Hear the phrase">
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
          <form onSubmit={(e) => { e.preventDefault(); grade(typed); }} className="flex gap-2" data-testid="tryit-typed">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type it…"
              className="w-36 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:bg-white/5"
            />
            <button type="submit" className="btn-primary" disabled={!typed.trim()}>Check</button>
          </form>
        )}
      </div>

      {result && (
        <div className="mt-5 rounded-2xl bg-brand-50 p-4 dark:bg-white/[0.06]" data-testid="tryit-result">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-brand-700 dark:text-brand-100">{result.score}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">accuracy</span>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {result.wordFeedback.map((w, i) => (
              <span key={i} title={w.hint ?? ""} className={"rounded-lg px-2 py-0.5 text-sm font-medium " + (w.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                {w.word}
              </span>
            ))}
          </div>
          <p className="mt-2 text-center text-sm text-ink-700 dark:text-white/80">{result.overallTip}</p>
          <Link href="/sign-in" className="btn-primary mt-3 block w-full text-center">Keep going — it's free</Link>
        </div>
      )}
    </>
  );
}

function QuizCard({ demo }: { demo: QuizDemo }) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === demo.answer;

  return (
    <div data-testid="tryit-quiz">
      <p className="mt-4 text-center text-lg font-semibold leading-snug">{demo.prompt}</p>
      <div className="mt-4 grid gap-2">
        {demo.options.map((opt, i) => {
          const revealed = picked !== null;
          const isAnswer = i === demo.answer;
          const isPicked = picked === i;
          let cls = "border-black/10 hover:border-brand-500/40 hover:bg-brand-50/50 dark:border-white/10";
          if (revealed && isAnswer) cls = "border-green-400 bg-green-50 dark:bg-green-500/10";
          else if (revealed && isPicked) cls = "border-red-400 bg-red-50 dark:bg-red-500/10";
          else if (revealed) cls = "border-black/10 opacity-60 dark:border-white/10";
          return (
            <button
              key={i}
              type="button"
              onClick={() => picked === null && setPicked(i)}
              disabled={revealed}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${cls}`}
            >
              <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-black/5 text-xs font-bold dark:bg-white/10">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {revealed && isAnswer && <span className="text-green-600">✓</span>}
              {revealed && isPicked && !isAnswer && <span className="text-red-600">✕</span>}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-4 rounded-2xl bg-brand-50 p-4 dark:bg-white/[0.06]" data-testid="tryit-result">
          <p className="text-sm font-semibold">{correct ? "Correct! 🎉" : "Not quite — here's why:"}</p>
          <p className="mt-1 text-sm text-ink-700 dark:text-white/80">{demo.explanation}</p>
          <Link href="/sign-in" className="btn-primary mt-3 block w-full text-center">Keep going — it's free</Link>
        </div>
      )}
    </div>
  );
}
