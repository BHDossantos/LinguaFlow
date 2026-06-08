// Pronunciation scoring — runs server-side, no external services needed.
//
// Compares a recognized transcript (from the browser's SpeechRecognition or
// a typed fallback) against a reference phrase. Returns a 0-100 score plus
// per-word feedback the UI can render directly.
import { editDistance, fold } from "@/lib/match";

export type WordFeedback = {
  word: string;
  ok: boolean;
  hint?: string;
};

export type PronunciationResult = {
  score: number;
  wordFeedback: WordFeedback[];
  overallTip: string;
};

function tokens(s: string): string[] {
  return s.split(/\s+/).filter(Boolean);
}

// Per reference word, find the nearest transcript word and grade it.
//   0    edits → ok
//   ≤ 1 edit  or  diacritic-only mismatch → close (counts as ok with hint)
//   ≤ ~25% of word length → minor (counts as 0.5)
//   beyond → missed
function gradeWord(refWord: string, candidates: string[]): { ok: boolean; partial: number; hint?: string } {
  const refFold = fold(refWord);
  if (refFold.length === 0) return { ok: true, partial: 1 };

  let best: { word: string; dist: number; folded: string } | null = null;
  for (const c of candidates) {
    const cf = fold(c);
    const d = editDistance(refFold, cf);
    if (!best || d < best.dist) best = { word: c, dist: d, folded: cf };
  }
  if (!best) return { ok: false, partial: 0, hint: "missed" };

  const ratio = best.dist / Math.max(1, refFold.length);
  if (best.dist === 0) return { ok: true, partial: 1 };
  if (best.dist <= 1) {
    // Diacritic-only mismatch — celebrate but coach the accent.
    if (fold(refWord) === fold(best.word)) return { ok: true, partial: 1 };
    return { ok: true, partial: 0.9, hint: `close — heard "${best.word}"` };
  }
  if (ratio <= 0.34) return { ok: false, partial: 0.5, hint: `nearly — heard "${best.word}"` };
  return { ok: false, partial: 0, hint: `expected "${refWord}"` };
}

export function scorePronunciation(reference: string, transcript: string): PronunciationResult {
  const refWords = tokens(reference);
  const transWords = tokens(transcript);

  if (refWords.length === 0) {
    return { score: 0, wordFeedback: [], overallTip: "No reference text." };
  }

  let earned = 0;
  const wordFeedback: WordFeedback[] = refWords.map((w) => {
    const g = gradeWord(w, transWords);
    earned += g.partial;
    return { word: w, ok: g.ok, hint: g.hint };
  });

  const score = Math.round((earned / refWords.length) * 100);
  const missing = wordFeedback.filter((w) => !w.ok).length;
  const overallTip =
    score >= 90
      ? "Excellent — clear and accurate."
      : score >= 70
        ? `Good. ${missing} word${missing === 1 ? "" : "s"} to polish — try slowing down on those.`
        : score >= 40
          ? "Getting there — focus on the highlighted words and try again."
          : "Listen to the example, then mimic the rhythm before retrying.";

  return { score, wordFeedback, overallTip };
}
