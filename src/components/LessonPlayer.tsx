"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  kind: string;
  body: any;
  grammar_notes_md: string | null;
};

type VocabItem = { term: string; translation: string; ipa?: string; example?: string };

export function LessonPlayer({ lesson, courseId }: { lesson: Lesson; courseId: string }) {
  if (lesson.kind === "vocab") {
    return <VocabFlashcards items={lesson.body.items ?? []} title={lesson.title} courseId={courseId} grammar={lesson.grammar_notes_md} />;
  }
  if (lesson.kind === "roleplay") {
    return <RoleplayLesson body={lesson.body} title={lesson.title} courseId={courseId} />;
  }
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">{lesson.title}</h1>
      <pre className="card overflow-auto text-xs">{JSON.stringify(lesson.body, null, 2)}</pre>
      <Link href={`/learn/${courseId}`} className="btn-ghost">Back</Link>
    </div>
  );
}

function VocabFlashcards({
  items, title, courseId, grammar,
}: {
  items: VocabItem[];
  title: string;
  courseId: string;
  grammar: string | null;
}) {
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const item = items[i];
  const total = items.length;
  const progress = useMemo(() => (i / Math.max(1, total)) * 100, [i, total]);

  function rate(rating: number) {
    // TODO: persist to srs_cards / srs_reviews via server action
    void rating;
    if (i + 1 >= total) setDone(true);
    else { setI(i + 1); setRevealed(false); }
  }

  if (done) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold">Lesson complete 🎉</h1>
        <p className="text-sm text-ink-500">
          Cards added to your spaced-repetition queue. We'll surface the weakest ones in your next session.
        </p>
        <Link href={`/learn/${courseId}`} className="btn-primary">Continue</Link>
      </div>
    );
  }

  if (!item) return <p>No items.</p>;

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-ink-500">{i + 1} / {total}</p>
      </header>

      <div className="card min-h-[220px] text-center">
        <p className="text-3xl font-semibold">{item.term}</p>
        {item.ipa && <p className="mt-1 text-sm text-ink-500">/{item.ipa}/</p>}
        {revealed ? (
          <>
            <p className="mt-4 text-lg">{item.translation}</p>
            {item.example && <p className="mt-2 italic text-ink-500">"{item.example}"</p>}
          </>
        ) : (
          <button onClick={() => setRevealed(true)} className="btn-ghost mt-6">
            Show answer
          </button>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => rate(0)} className="btn-ghost">Again</button>
          <button onClick={() => rate(3)} className="btn-ghost">Hard</button>
          <button onClick={() => rate(4)} className="btn-ghost">Good</button>
          <button onClick={() => rate(5)} className="btn-primary">Easy</button>
        </div>
      )}

      {grammar && (
        <details className="card">
          <summary className="cursor-pointer font-medium">Grammar notes</summary>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">{grammar}</p>
        </details>
      )}
    </div>
  );
}

function RoleplayLesson({
  body, title, courseId,
}: { body: any; title: string; courseId: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="card space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-ink-500">Scenario</p>
        <p>{body.scenario}</p>
        {body.goal && <p className="text-sm text-ink-500">Goal: {body.goal}</p>}
      </div>
      <Link href={`/practice?scenario=${encodeURIComponent(body.scenario ?? "")}&persona=${encodeURIComponent(body.persona ?? "")}`} className="btn-primary block text-center">
        Start AI roleplay
      </Link>
      <Link href={`/tutors`} className="btn-ghost block text-center">Or do this with a live instructor</Link>
      <Link href={`/learn/${courseId}`} className="block text-center text-sm text-ink-500">Back to course</Link>
    </div>
  );
}
