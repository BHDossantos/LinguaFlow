// Achievements are DERIVED from existing learning data at read time — there
// is no achievements table to forge and no new write path to secure. The
// trade-off (no earned_at timestamp) is fine for v1.
import { levelFromXp } from "@/lib/gamification";

export type AchievementInput = {
  xp: number;
  longestStreak: number;
  lessonsDone: number;
  wordsLearning: number;
  reviewCount: number;
  perfectPronunciations: number;
};

export type Achievement = {
  key: string;
  icon: string;
  title: string;
  description: string;
  earned: boolean;
};

export function computeAchievements(s: AchievementInput): Achievement[] {
  const level = levelFromXp(s.xp);
  return [
    { key: "first_lesson", icon: "🌱", title: "First steps", description: "Complete your first lesson", earned: s.lessonsDone >= 1 },
    { key: "ten_lessons", icon: "📚", title: "Bookworm", description: "Complete 10 lessons", earned: s.lessonsDone >= 10 },
    { key: "word_25", icon: "🧠", title: "Word collector", description: "25 words in your queue", earned: s.wordsLearning >= 25 },
    { key: "word_100", icon: "🏛️", title: "Lexicon builder", description: "100 words in your queue", earned: s.wordsLearning >= 100 },
    { key: "streak_7", icon: "🔥", title: "On fire", description: "7-day streak", earned: s.longestStreak >= 7 },
    { key: "streak_30", icon: "🌋", title: "Unstoppable", description: "30-day streak", earned: s.longestStreak >= 30 },
    { key: "level_5", icon: "⭐", title: "Rising star", description: "Reach level 5", earned: level >= 5 },
    { key: "level_10", icon: "🌟", title: "Constellation", description: "Reach level 10", earned: level >= 10 },
    { key: "reviews_100", icon: "🔁", title: "Repetition master", description: "100 card reviews", earned: s.reviewCount >= 100 },
    { key: "perfect_speech", icon: "🎯", title: "Crystal clear", description: "Score 100 on pronunciation", earned: s.perfectPronunciations >= 1 },
  ];
}
