// Shared answer-matching helpers used by both the pronunciation scorer and
// typed exercises (recall, listen). Keeps the "is this answer close enough?"
// rules in one place.

export function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!.,;:"()]/g, "")
    .trim();
}

export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1).fill(0).map((_, i) => i);
  const curr = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return curr[b.length];
}

// Grade a typed answer against the expected one. Returns an SRS-compatible
// 0..5 confidence + a flag for the UI to celebrate or correct.
//   exact (folded) match            -> 5
//   diacritic-only mismatch         -> 4 (close — coach the accent next time)
//   <=1 edit OR <=15% relative dist -> 4
//   <=33% relative dist             -> 3
//   beyond                          -> 0
export function gradeTypedAnswer(
  expected: string,
  given: string,
): { ok: boolean; close: boolean; confidence: 0 | 3 | 4 | 5 } {
  const e = fold(expected);
  const g = fold(given);
  if (!e || !g) return { ok: false, close: false, confidence: 0 };

  if (e === g) {
    // Diacritic-only mismatch — celebrate but not perfect.
    if (expected.normalize("NFC").toLowerCase() !== given.normalize("NFC").toLowerCase()) {
      return { ok: true, close: true, confidence: 4 };
    }
    return { ok: true, close: false, confidence: 5 };
  }

  const d = editDistance(e, g);
  const ratio = d / Math.max(1, e.length);
  if (d <= 1 || ratio <= 0.15) return { ok: true, close: true, confidence: 4 };
  if (ratio <= 0.33) return { ok: false, close: true, confidence: 3 };
  return { ok: false, close: false, confidence: 0 };
}
