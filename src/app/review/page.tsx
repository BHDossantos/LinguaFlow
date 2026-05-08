import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { ReviewSession } from "./ReviewSession";
import { requireOnboardedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await requireOnboardedUser();
  const supabase = supabaseServer();

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
