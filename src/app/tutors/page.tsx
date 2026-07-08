import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { LANGUAGES } from "@/lib/languages";
import { requireOnboardedUser, getPrimaryTargetLanguage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TutorsPage(props: { searchParams: Promise<{ lang?: string }> }) {
  const searchParams = await props.searchParams;
  await requireOnboardedUser();
  const supabase = await supabaseServer();
  const primary = await getPrimaryTargetLanguage();
  const lang = searchParams.lang ?? primary?.language ?? "es";

  const { data: tutors } = await supabase
    .from("tutors")
    .select("id,display_name,bio,languages,dialects,rate_cents_per_minute,rating,is_online")
    .contains("languages", [lang])
    .order("is_online", { ascending: false })
    .order("rating", { ascending: false });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Live instructors</h1>
        <p className="text-sm text-ink-500">
          Per-minute billing. Your tutor sees your lesson history, weak grammar, and recent SRS — no re-explaining.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.entries(LANGUAGES).map(([code, l]) => (
          <Link
            key={code}
            href={`/tutors?lang=${code}`}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${
              code === lang
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-black/10 bg-white text-ink-700"
            }`}
          >
            <span className="mr-1">{l.flag}</span>{l.label}
          </Link>
        ))}
      </div>

      <ul className="space-y-3">
        {(tutors ?? []).map((t) => (
          <li key={t.id} className="card flex gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-lg font-bold text-brand-700">
              {t.display_name?.[0] ?? "T"}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{t.display_name}</p>
                <span className={`text-xs ${t.is_online ? "text-green-600" : "text-ink-500"}`}>
                  {t.is_online ? "● Online" : "Offline"}
                </span>
              </div>
              <p className="text-xs text-ink-500">{t.bio}</p>
              <div className="mt-1 text-xs text-ink-500">
                {t.dialects?.join(" · ") || "All dialects"} · ★ {t.rating?.toFixed(1) ?? "—"} · ${(t.rate_cents_per_minute / 100).toFixed(2)}/min
              </div>
              <div className="mt-2 flex gap-2">
                <Link
                  href={`/tutors/${t.id}/connect`}
                  className={t.is_online ? "btn-primary text-sm" : "btn-ghost text-sm pointer-events-none opacity-50"}
                >
                  Connect now
                </Link>
                <Link href={`/tutors/${t.id}`} className="btn-ghost text-sm">
                  Profile
                </Link>
              </div>
            </div>
          </li>
        ))}
        {(!tutors || tutors.length === 0) && (
          <li className="card text-sm text-ink-500">
            No tutors online for this language yet.
          </li>
        )}
      </ul>
    </div>
  );
}
