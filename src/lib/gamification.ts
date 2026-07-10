// Level curve + XP amounts. Levels grow quadratically so early levels come
// fast (hook) and later ones take commitment: level N needs 100·N² total XP.
export const XP = {
  lessonComplete: 25,
  cardReview: 2,
  submission: 15,
  pronunciation: 5,
} as const;

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + (xp >= 100 ? 1 : 0));
}

export function xpForLevel(level: number): number {
  // Total XP required to REACH this level (level 1 = 0).
  return level <= 1 ? 0 : 100 * (level - 1) * (level - 1);
}

export function levelProgress(xp: number): { level: number; into: number; needed: number; pct: number } {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const into = xp - floor;
  const needed = ceil - floor;
  return { level, into, needed, pct: Math.min(100, Math.round((into / Math.max(1, needed)) * 100)) };
}
