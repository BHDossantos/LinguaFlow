import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { ReviewSession } from "./ReviewSession";
import { requireOnboardedUser } from "@/lib/auth";
import { countDueRetention } from "@/lib/retention";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();

  const dueRetention = await countDueRetention();

  const { data: dueCards } = await supabase
    .from("srs_cards")
    .select("id,due_at,vocab:vocab_items(id,language,dialect,term,translation,ipa,example_sentence)")
    .eq("user_id", user.id)
    .lte("due_at", new Date().toISOString())
    .order("due_at")
    .limit(40);

  const cards = (dueCards ?? [])
    .map((c: any) => c.vocab && {
      cardId: c.id,
      language: c.vocab.language,
      dialect: c.vocab.dialect,
      term: c.vocab.term,
      translation: c.vocab.translation,
      ipa: c.vocab.ipa,
      example: c.vocab.example_sentence,
    })
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Daily review</h1>
        <p className="text-sm text-ink-500">
          {cards.length} card{cards.length === 1 ? "" : "s"} due. Mastery, not streaks.
        </p>
      </header>

      {dueRetention > 0 && (
        <Link
          href="/retention"
          className="card flex items-center justify-between gap-3 border-brand-500/30 bg-gradient-to-br from-brand-50 to-white transition hover:ring-1 hover:ring-brand-500/40 dark:from-white/[0.06] dark:to-transparent"
        >
          <div>
            <p className="text-sm font-semibold">🧠 Retention check ready</p>
            <p className="text-xs text-ink-500">
              {dueRetention} mastered skill{dueRetention === 1 ? "" : "s"} due for a 14-day check — prove it still sticks.
            </p>
          </div>
          <span className="shrink-0 text-brand-500">→</span>
        </Link>
      )}

      {cards.length === 0 ? (
        <div className="card text-sm">
          🎯 Nothing due. <Link href="/learn" className="text-brand-500">Start a new lesson</Link> to keep growing your queue.
        </div>
      ) : (
        <ReviewSession cards={cards} />
      )}
    </div>
  );
}
