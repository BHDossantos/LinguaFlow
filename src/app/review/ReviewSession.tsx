"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { rateCardAction } from "@/app/learn/[courseId]/[lessonId]/actions";

type Card = {
  cardId: string;
  language: string;
  dialect: string | null;
  term: string;
  translation: string;
  ipa: string | null;
  example: string | null;
};

export function ReviewSession({ cards }: { cards: Card[] }) {
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [, startTransition] = useTransition();

  const card = cards[i];

  function rate(rating: number) {
    if (!card) return;
    startTransition(async () => {
      try {
        await rateCardAction({
          language: card.language,
          dialect: card.dialect,
          term: card.term,
          translation: card.translation,
          ipa: card.ipa,
          example: card.example,
          rating,
        });
      } catch {}
    });
    if (i + 1 >= cards.length) setDone(true);
    else { setI(i + 1); setRevealed(false); }
  }

  function speak(t: string, lang: string) {
    if (typeof window === "undefined") return;
    const u = new SpeechSynthesisUtterance(t);
    u.lang = lang;
    speechSynthesis.speak(u);
  }

  if (done) {
    return (
      <div className="space-y-3">
        <p className="card text-sm">Reviewed {cards.length} cards. Come back tomorrow.</p>
        <Link href="/" className="btn-primary inline-block">Done</Link>
      </div>
    );
  }
  if (!card) return <p>No cards.</p>;

  return (
    <div className="space-y-4">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{ width: `${(i / cards.length) * 100}%` }}
        />
      </div>
      <p className="text-xs text-ink-500">{i + 1} / {cards.length}</p>

      <div className="card min-h-[220px] text-center">
        <p className="text-3xl font-semibold">{card.term}</p>
        {card.ipa && <p className="mt-1 text-sm text-ink-500">/{card.ipa}/</p>}
        <button
          onClick={() => speak(card.term, card.language)}
          className="mt-2 text-sm text-brand-500"
        >
          🔊 Hear it
        </button>
        {revealed ? (
          <>
            <p className="mt-4 text-lg">{card.translation}</p>
            {card.example && <p className="mt-2 italic text-ink-500">"{card.example}"</p>}
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
    </div>
  );
}
