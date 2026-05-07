import Link from "next/link";
import { LANGUAGES } from "@/lib/languages";

export default function Home() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-ink-500">Bienvenido / Bem-vindo / Bienvenue</p>
        <h1 className="text-3xl font-bold tracking-tight">Speak. Don't just tap.</h1>
        <p className="text-ink-500">
          Adaptive lessons, AI roleplay, and live instructors — one app.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <Link href="/learn" className="card flex flex-col gap-1">
          <span className="text-2xl">📚</span>
          <span className="font-semibold">Self-study</span>
          <span className="text-xs text-ink-500">Lessons + spaced repetition.</span>
        </Link>
        <Link href="/tutors" className="card flex flex-col gap-1">
          <span className="text-2xl">🧑‍🏫</span>
          <span className="font-semibold">Live instructor</span>
          <span className="text-xs text-ink-500">Per-minute, instant connect.</span>
        </Link>
        <Link href="/practice" className="card flex flex-col gap-1">
          <span className="text-2xl">💬</span>
          <span className="font-semibold">AI roleplay</span>
          <span className="text-xs text-ink-500">Order coffee, ace the interview.</span>
        </Link>
        <Link href="/translate" className="card flex flex-col gap-1">
          <span className="text-2xl">🌐</span>
          <span className="font-semibold">Translate</span>
          <span className="text-xs text-ink-500">Real-time voice + text.</span>
        </Link>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-500">
          Languages
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(LANGUAGES).map(([code, l]) => (
            <Link
              key={code}
              href={`/learn?lang=${code}`}
              className="card flex items-center gap-2 px-3 py-2"
            >
              <span aria-hidden>{l.flag}</span>
              <span className="text-sm">{l.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
