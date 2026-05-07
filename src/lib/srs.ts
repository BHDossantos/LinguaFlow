// SM-2 lite. Rating: 0 (forgot) → 5 (perfect).
export type SrsCard = {
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueAt: Date;
};

export function reviewCard(card: SrsCard, rating: number, now = new Date()): SrsCard {
  const r = Math.max(0, Math.min(5, rating));
  let { ease, intervalDays, repetitions } = card;

  if (r < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * ease);
    repetitions += 1;
  }

  ease = Math.max(1.3, ease + (0.1 - (5 - r) * (0.08 + (5 - r) * 0.02)));

  const dueAt = new Date(now.getTime() + intervalDays * 86_400_000);
  return { ease, intervalDays, repetitions, dueAt };
}

export function isDue(card: { dueAt: Date | string }, now = new Date()) {
  const due = typeof card.dueAt === "string" ? new Date(card.dueAt) : card.dueAt;
  return due.getTime() <= now.getTime();
}
