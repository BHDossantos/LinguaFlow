"use client";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { submitRetentionAction } from "./actions";
import { Celebrate } from "@/components/Celebrate";
import { XP } from "@/lib/gamification";

type Q = {
  id: number;
  lessonId: string;
  lessonTitle: string;
  courseId: string | null;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string | null;
};

const PASS = 0.8;

// A delayed retention check: answer questions drawn from skills you mastered
// 14+ days ago. Per-skill fraction-correct is written back to the mastery
// engine — pass and the skill stays mastered (and resets its clock), fail and
// it drops to remediation so you'll re-learn it.
export function RetentionCheck({ questions }: { questions: Q[] }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState<Record<string, { right: number; total: number }>>({});
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const q = questions[i];
  const total = questions.length;

  function pick(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    const isRight = idx === q.answer;
    setCorrect((c) => {
      const cur = c[q.lessonId] ?? { right: 0, total: 0 };
      return { ...c, [q.lessonId]: { right: cur.right + (isRight ? 1 : 0), total: cur.total + 1 } };
    });
  }

  function next() {
    if (i + 1 >= total) {
      finish();
    } else {
      setI(i + 1);
      setPicked(null);
    }
  }

  function finish() {
    const results = Object.entries(correct).map(([lessonId, s]) => ({
      lessonId,
      score: s.total ? s.right / s.total : 0,
    }));
    startTransition(async () => {
      try { await submitRetentionAction(results); } catch {}
    });
    setDone(true);
  }

  const summary = useMemo(() => {
    const entries = Object.values(correct);
    const right = entries.reduce((a, s) => a + s.right, 0);
    const tot = entries.reduce((a, s) => a + s.total, 0);
    const kept = Object.values(correct).filter((s) => s.total && s.right / s.total >= PASS).length;
    const dropped = Object.keys(correct).length - kept;
    return { right, tot, kept, dropped };
  }, [correct]);

  if (done) {
    return (
      <div className="mx-auto max-w-md space-y-3 text-center">
        <Celebrate xp={XP.lessonComplete} />
        <h1 className="text-xl font-bold">Retention check complete</h1>
        <p className="text-4xl font-extrabold text-brand-600">
          {summary.tot ? Math.round((summary.right / summary.tot) * 100) : 0}%
        </p>
        <p className="text-sm text-ink-500">
          {summary.kept} skill{summary.kept === 1 ? "" : "s"} still mastered
          {summary.dropped > 0 && (
            <> · {summary.dropped} sent back for a refresher</>
          )}
          {pending ? " · saving…" : ""}
        </p>
        <p className="text-xs text-ink-500">
          This is the number that matters: knowledge that survives a delay, not just lessons finished.
        </p>
        <div className="flex justify-center gap-2 pt-1">
          <Link href="/review" className="btn-ghost">Daily review</Link>
          <Link href="/learn" className="btn-primary">Keep learning</Link>
        </div>
      </div>
    );
  }

  const answered = i + (picked !== null ? 1 : 0);

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <div className="flex gap-1" aria-hidden>
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={"h-1.5 flex-1 rounded-full transition-colors " + (idx < answered ? "bg-brand-500" : "bg-black/10")}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-ink-500">
          <span>Question {i + 1} of {total}</span>
          <span className="truncate rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-medium">
            {q.lessonTitle}
          </span>
        </div>
      </header>

      <div className="card">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Does it still stick?</p>
        <p className="mt-1 font-medium">{q.prompt}</p>
      </div>

      <div className="space-y-2">
        {q.options.map((opt, idx) => {
          const isPicked = picked === idx;
          const isAnswer = idx === q.answer;
          const revealed = picked !== null;
          const letter = String.fromCharCode(65 + idx);
          let cls: string, badge: string;
          if (revealed && isAnswer) { cls = "border-green-400 bg-green-50 ring-1 ring-green-400"; badge = "bg-green-500 text-white"; }
          else if (revealed && isPicked) { cls = "border-red-400 bg-red-50 ring-1 ring-red-400"; badge = "bg-red-500 text-white"; }
          else if (revealed) { cls = "opacity-60"; badge = "bg-black/5 text-ink-500"; }
          else { cls = "hover:border-brand-500/40 hover:ring-1 hover:ring-brand-500/40"; badge = "bg-black/5 text-ink-500"; }
          return (
            <button
              key={idx}
              type="button"
              onClick={() => pick(idx)}
              disabled={revealed}
              className={`card flex w-full items-center gap-3 text-left text-sm transition ${cls}`}
            >
              <span aria-hidden className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${badge}`}>
                {letter}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="space-y-3">
          {q.explanation && (
            <div className="card border-l-4 border-l-green-500">
              <p className="text-sm leading-relaxed text-ink-700">{q.explanation}</p>
            </div>
          )}
          <button type="button" onClick={next} className="btn-primary w-full">
            {i + 1 >= total ? "See results" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
