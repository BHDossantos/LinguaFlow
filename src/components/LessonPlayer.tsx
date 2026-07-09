"use client";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { rateCardAction, completeLessonAction } from "@/app/learn/[courseId]/[lessonId]/actions";
import { PronouncePractice } from "@/components/PronouncePractice";

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

// A vocab lesson now drills each item through THREE modes back-to-back:
//   1. Recognize — see the term, recall the meaning, self-rate (existing flow).
//   2. Recall    — see the translation, TYPE the term in target language,
//                  auto-graded against the expected answer.
//   3. Listen    — hear the term via TTS, type what was said. Auto-graded.
// Each interaction records an SRS rating; the lesson completes once every
// item has been seen in all three modes.
type Mode = "recognize" | "recall" | "listen";
const MODE_ORDER: Mode[] = ["recognize", "recall", "listen"];
const MODE_LABEL: Record<Mode, string> = {
  recognize: "Recognize",
  recall: "Recall",
  listen: "Listen",
};

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
  // Build the full sequence of {item, mode} steps once. This is the deepening:
  // a 3-card vocab lesson becomes 9 interactions, not 3.
  const sequence = useMemo(
    () => items.flatMap((item) => MODE_ORDER.map((mode) => ({ item, mode }))),
    [items],
  );

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [ratings, setRatings] = useState<number[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const total = sequence.length;
  const current = sequence[step];
  const progress = useMemo(() => (step / Math.max(1, total)) * 100, [step, total]);
  const locale = dialect ? `${language}-${dialect.toUpperCase()}` : undefined;

  function record(rating: number) {
    if (!current) return;
    const nextRatings = [...ratings, rating];
    setRatings(nextRatings);
    startTransition(async () => {
      try {
        await rateCardAction({
          language,
          dialect,
          term: current.item.term,
          translation: current.item.translation,
          ipa: current.item.ipa,
          example: current.item.example,
          rating,
        });
      } catch (e: any) {
        setError(e?.message ?? "Could not save review");
      }
    });
    if (step + 1 >= total) {
      const avg = (nextRatings.reduce((a, b) => a + b, 0) / total) * 20;
      startTransition(async () => {
        try { await completeLessonAction(lessonId, avg); } catch {}
      });
      setDone(true);
    } else {
      setStep(step + 1);
    }
  }

  if (done) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold">Lesson complete 🎉</h1>
        <p className="text-sm text-ink-500">
          {pending
            ? "Saving your reviews…"
            : `${items.length} cards practiced in ${MODE_ORDER.length} modes — saved to your spaced-repetition queue.`}
        </p>
        <div className="flex gap-2">
          <Link href="/review" className="btn-primary flex-1 text-center">Start a review</Link>
          <Link href={`/learn/${courseId}`} className="btn-ghost flex-1 text-center">Back to course</Link>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (!current) return <p>No items.</p>;

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-ink-500">
          <span>{step + 1} / {total}</span>
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            {MODE_LABEL[current.mode]}
          </span>
        </div>
      </header>

      {current.mode === "recognize" && (
        <RecognizeCard
          key={`r-${step}`}
          item={current.item}
          language={language}
          locale={locale}
          onRate={record}
        />
      )}
      {current.mode === "recall" && (
        <TypedExercise
          key={`c-${step}`}
          item={current.item}
          language={language}
          locale={locale}
          mode="recall"
          onRate={record}
        />
      )}
      {current.mode === "listen" && (
        <TypedExercise
          key={`l-${step}`}
          item={current.item}
          language={language}
          locale={locale}
          mode="listen"
          onRate={record}
        />
      )}

      {grammar && (
        <details className="card">
          <summary className="cursor-pointer font-medium">Grammar notes</summary>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">{grammar}</p>
        </details>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function RecognizeCard({
  item, language, locale, onRate,
}: {
  item: VocabItem;
  language: string;
  locale: string | undefined;
  onRate: (rating: number) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <>
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
        <div className="card">
          <PronouncePractice
            reference={item.example ?? item.term}
            language={language}
            locale={locale}
          />
        </div>
      )}

      {revealed && (
        <div className="grid grid-cols-4 gap-2" data-testid="self-rate">
          <button onClick={() => onRate(0)} className="btn-ghost">Again</button>
          <button onClick={() => onRate(3)} className="btn-ghost">Hard</button>
          <button onClick={() => onRate(4)} className="btn-ghost">Good</button>
          <button onClick={() => onRate(5)} className="btn-primary">Easy</button>
        </div>
      )}
    </>
  );
}

function TypedExercise({
  item, language, locale, mode, onRate,
}: {
  item: VocabItem;
  language: string;
  locale: string | undefined;
  mode: "recall" | "listen";
  onRate: (rating: number) => void;
}) {
  const [given, setGiven] = useState("");
  const [graded, setGraded] = useState<null | { ok: boolean; close: boolean; confidence: number }>(null);
  const [played, setPlayed] = useState(false);

  function playPrompt() {
    // Unlock the answer field even if TTS is unavailable (some browsers /
    // headless environments lack speechSynthesis) — the gate is a nudge to
    // listen first, not a hard requirement.
    setPlayed(true);
    try {
      const u = new SpeechSynthesisUtterance(item.term);
      u.lang = locale ?? `${language}-${language.toUpperCase()}`;
      u.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      // No TTS — the learner can still type from memory of the term.
    }
  }

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (!given.trim()) return;
    // Lazy-load to keep the client bundle slim.
    import("@/lib/match").then(({ gradeTypedAnswer }) => {
      setGraded(gradeTypedAnswer(item.term, given));
    });
  }

  return (
    <>
      {mode === "recall" ? (
        <div className="card min-h-[220px] text-center">
          <p className="text-xs uppercase tracking-wider text-ink-500">Translate</p>
          <p className="mt-2 text-2xl font-semibold">{item.translation}</p>
          <p className="mt-3 text-sm text-ink-500">How do you say this in {language === "es" ? "Spanish" : language}?</p>
        </div>
      ) : (
        <div className="card min-h-[220px] text-center">
          <p className="text-xs uppercase tracking-wider text-ink-500">Listen</p>
          <button
            type="button"
            onClick={playPrompt}
            className="mt-3 text-4xl"
            aria-label="Play audio"
            data-testid="listen-play"
          >
            🔊
          </button>
          <p className="mt-2 text-sm text-ink-500">
            {played ? "Type what you heard." : "Tap to hear the term, then type what you heard."}
          </p>
        </div>
      )}

      {!graded ? (
        <form onSubmit={check} className="space-y-3" data-testid="typed-exercise-form">
          <input
            autoFocus
            value={given}
            onChange={(e) => setGiven(e.target.value)}
            placeholder={mode === "listen" ? "What did you hear?" : "Your answer…"}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3"
          />
          <button
            type="submit"
            disabled={!given.trim() || (mode === "listen" && !played)}
            className="btn-primary w-full"
          >
            Check
          </button>
        </form>
      ) : (
        <div
          className={
            "card space-y-2 " +
            (graded.ok ? "border border-green-300 bg-green-50" : "border border-red-300 bg-red-50")
          }
          data-testid="typed-result"
        >
          <p className="text-sm font-semibold">
            {graded.ok
              ? graded.close
                ? "Almost — close to perfect (mind the accents)."
                : "Correct!"
              : graded.close
                ? "Close, but not quite."
                : "Not quite."}
          </p>
          <p className="text-sm">
            <span className="text-ink-500">You wrote:</span>{" "}
            <span className="font-medium">{given || "—"}</span>
          </p>
          <p className="text-sm">
            <span className="text-ink-500">Answer:</span>{" "}
            <span className="font-medium">{item.term}</span>
            {item.ipa && <span className="text-ink-500"> /{item.ipa}/</span>}
          </p>
          <button
            type="button"
            onClick={() => onRate(graded.confidence)}
            className="btn-primary mt-1 w-full"
            data-testid="typed-continue"
          >
            Continue
          </button>
        </div>
      )}
    </>
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
        Start system roleplay
      </Link>
      <Link href={`/tutors`} className="btn-ghost block text-center">Or do this with a live instructor</Link>
      <Link href={`/learn/${courseId}`} className="block text-center text-sm text-ink-500">Back to course</Link>
    </div>
  );
}
