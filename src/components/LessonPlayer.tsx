"use client";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { rateCardAction, completeLessonAction } from "@/app/learn/[courseId]/[lessonId]/actions";

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  kind: string;
  body: any;
  grammar_notes_md: string | null;
};

type VocabItem = { term: string; translation: string; ipa?: string; example?: string };

export function LessonPlayer({
  lesson, courseId, language, dialect,
}: {
  lesson: Lesson;
  courseId: string;
  language: string;
  dialect: string | null;
}) {
  if (lesson.kind === "vocab") {
    return (
      <VocabFlashcards
        items={lesson.body.items ?? []}
        title={lesson.title}
        courseId={courseId}
        lessonId={lesson.id}
        language={language}
        dialect={dialect}
        grammar={lesson.grammar_notes_md}
      />
    );
  }
  if (lesson.kind === "roleplay") {
    return <RoleplayLesson body={lesson.body} title={lesson.title} courseId={courseId} />;
  }
  return (
    <ContentLesson
      body={lesson.body}
      title={lesson.title}
      courseId={courseId}
      lessonId={lesson.id}
      grammar={lesson.grammar_notes_md}
    />
  );
}

function ContentLesson({
  body, title, courseId, lessonId, grammar,
}: {
  body: any;
  title: string;
  courseId: string;
  lessonId: string;
  grammar: string | null;
}) {
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  // Supported shapes:
  //   { content: "markdown-ish text" }
  //   { sections: [{ heading, text }] }
  //   { content, sections }
  const sections: Array<{ heading?: string; text: string }> = body?.sections ?? [];

  function complete() {
    startTransition(async () => {
      try { await completeLessonAction(lessonId, 100); } catch {}
    });
    setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold">Lesson complete 🎉</h1>
        <p className="text-sm text-ink-500">
          {pending ? "Saving your progress…" : "Progress saved."}
        </p>
        <Link href={`/learn/${courseId}`} className="btn-primary inline-block">Continue</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{title}</h1>

      {body?.content && (
        <article className="card whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
          {body.content}
        </article>
      )}

      {sections.map((s, i) => (
        <section key={i} className="card space-y-1">
          {s.heading && <h2 className="font-semibold">{s.heading}</h2>}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700">{s.text}</p>
        </section>
      ))}

      {body?.key_terms && Array.isArray(body.key_terms) && (
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Key terms</p>
          <ul className="mt-1 space-y-1 text-sm">
            {body.key_terms.map((t: any, i: number) => (
              <li key={i}><strong>{t.term}:</strong> {t.definition}</li>
            ))}
          </ul>
        </div>
      )}

      {grammar && (
        <details className="card">
          <summary className="cursor-pointer font-medium">Notes</summary>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">{grammar}</p>
        </details>
      )}

      <button onClick={complete} className="btn-primary w-full">Mark complete</button>
      <Link href={`/learn/${courseId}`} className="block text-center text-sm text-ink-500">
        Back to course
      </Link>
    </div>
  );
}

function VocabFlashcards({
  items, title, courseId, lessonId, language, dialect, grammar,
}: {
  items: VocabItem[];
  title: string;
  courseId: string;
  lessonId: string;
  language: string;
  dialect: string | null;
  grammar: string | null;
}) {
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [ratings, setRatings] = useState<number[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const item = items[i];
  const total = items.length;
  const progress = useMemo(() => (i / Math.max(1, total)) * 100, [i, total]);

  function rate(rating: number) {
    if (!item) return;
    setRatings((r) => [...r, rating]);
    startTransition(async () => {
      try {
        await rateCardAction({
          language,
          dialect,
          term: item.term,
          translation: item.translation,
          ipa: item.ipa,
          example: item.example,
          rating,
        });
      } catch (e: any) {
        setError(e?.message ?? "Could not save review");
      }
    });
    if (i + 1 >= total) {
      const avg =
        ([...ratings, rating].reduce((a, b) => a + b, 0) / total) * 20;
      startTransition(async () => {
        try { await completeLessonAction(lessonId, avg); } catch {}
      });
      setDone(true);
    } else {
      setI(i + 1);
      setRevealed(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold">Lesson complete 🎉</h1>
        <p className="text-sm text-ink-500">
          {pending ? "Saving your reviews…" : `${total} cards saved to your spaced-repetition queue.`}
        </p>
        <div className="flex gap-2">
          <Link href="/review" className="btn-primary flex-1 text-center">Start a review</Link>
          <Link href={`/learn/${courseId}`} className="btn-ghost flex-1 text-center">Back to course</Link>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
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
