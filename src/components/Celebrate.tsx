"use client";

// Lightweight CSS confetti burst + XP pop. No dependencies; respects
// prefers-reduced-motion via the global animation override.
const PIECES = ["🎉", "✨", "⭐", "🎊", "💫"];

export function Celebrate({ xp }: { xp?: number | null }) {
  return (
    <div className="pointer-events-none relative h-0" aria-hidden>
      <div className="absolute inset-x-0 -top-2 flex justify-center">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="confetti-piece absolute text-xl"
            style={{
              left: `${8 + (i * 6.5) % 84}%`,
              animationDelay: `${(i % 7) * 70}ms`,
              animationDuration: `${900 + (i % 5) * 180}ms`,
            }}
          >
            {PIECES[i % PIECES.length]}
          </span>
        ))}
      </div>
      {typeof xp === "number" && xp > 0 && (
        <div className="absolute inset-x-0 top-6 flex justify-center">
          <span className="xp-pop rounded-full bg-amber-100 px-4 py-1.5 text-sm font-extrabold text-amber-700 shadow dark:bg-amber-500/20 dark:text-amber-300">
            +{xp} XP
          </span>
        </div>
      )}
    </div>
  );
}
