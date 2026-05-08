import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { LANGUAGES } from "@/lib/languages";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: target } = await supabase
      .from("target_languages")
      .select("language")
      .eq("user_id", user.id)
      .eq("active", true)
      .limit(1)
      .maybeSingle();
    if (!target) redirect("/onboarding");
    redirect(`/learn?lang=${target.language}`);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-ink-500">Bienvenido / Bem-vindo / Bienvenue</p>
        <h1 className="text-3xl font-bold tracking-tight">Speak. Don't just tap.</h1>
        <p className="text-ink-500">
          Adaptive lessons, AI roleplay, and live instructors — one app.
        </p>
      </header>

      <Link href="/sign-in" className="btn-primary block w-full text-center">
        Get started
      </Link>

      <section className="grid grid-cols-2 gap-3">
        <div className="card">
          <span className="text-2xl">📚</span>
          <p className="mt-1 font-semibold">Self-study</p>
          <p className="text-xs text-ink-500">Adaptive lessons + spaced repetition.</p>
        </div>
        <div className="card">
          <span className="text-2xl">🧑‍🏫</span>
          <p className="mt-1 font-semibold">Live instructor</p>
          <p className="text-xs text-ink-500">Per-minute, instant connect.</p>
        </div>
        <div className="card">
          <span className="text-2xl">💬</span>
          <p className="mt-1 font-semibold">AI roleplay</p>
          <p className="text-xs text-ink-500">Real conversations, no judgment.</p>
        </div>
        <div className="card">
          <span className="text-2xl">🌐</span>
          <p className="mt-1 font-semibold">Real-time translate</p>
          <p className="text-xs text-ink-500">Voice, text, and on the go.</p>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-500">
          Languages
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(LANGUAGES).map(([code, l]) => (
            <span key={code} className="card flex items-center gap-2 px-3 py-2">
              <span aria-hidden>{l.flag}</span>
              <span className="text-sm">{l.label}</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
