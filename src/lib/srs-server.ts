import { supabaseServer } from "@/lib/supabase/server";
import { reviewCard } from "@/lib/srs";

export type RateInput = {
  language: string;
  dialect?: string | null;
  term: string;
  translation: string;
  ipa?: string | null;
  example?: string | null;
  rating: number;
};

export async function rateCardForUser(input: RateInput) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");

  // 1) Upsert vocab item by (language, term, dialect)
  const { data: vocab, error: vocabErr } = await supabase
    .from("vocab_items")
    .upsert(
      {
        language: input.language,
        dialect: input.dialect ?? null,
        term: input.term,
        translation: input.translation,
        ipa: input.ipa ?? null,
        example_sentence: input.example ?? null,
      },
      { onConflict: "language,term,dialect" },
    )
    .select("id")
    .single();
  if (vocabErr || !vocab) throw vocabErr ?? new Error("vocab upsert failed");

  // 2) Get or create card
  const { data: existing } = await supabase
    .from("srs_cards")
    .select("id,ease,interval_days,repetitions,due_at")
    .eq("user_id", user.id)
    .eq("vocab_id", vocab.id)
    .maybeSingle();

  const current = existing
    ? {
        ease: existing.ease,
        intervalDays: existing.interval_days,
        repetitions: existing.repetitions,
        dueAt: new Date(existing.due_at),
      }
    : { ease: 2.5, intervalDays: 0, repetitions: 0, dueAt: new Date() };

  const next = reviewCard(current, input.rating);

  if (existing) {
    await supabase
      .from("srs_cards")
      .update({
        ease: next.ease,
        interval_days: next.intervalDays,
        repetitions: next.repetitions,
        due_at: next.dueAt.toISOString(),
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    await supabase.from("srs_reviews").insert({ card_id: existing.id, rating: input.rating });
    return { cardId: existing.id, dueAt: next.dueAt };
  }

  const { data: created } = await supabase
    .from("srs_cards")
    .insert({
      user_id: user.id,
      vocab_id: vocab.id,
      ease: next.ease,
      interval_days: next.intervalDays,
      repetitions: next.repetitions,
      due_at: next.dueAt.toISOString(),
      last_reviewed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (created) {
    await supabase.from("srs_reviews").insert({ card_id: created.id, rating: input.rating });
  }
  return { cardId: created?.id, dueAt: next.dueAt };
}

export async function ensureCardsForVocab(
  items: Array<Omit<RateInput, "rating">>,
) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  for (const it of items) {
    const { data: vocab } = await supabase
      .from("vocab_items")
      .upsert(
        {
          language: it.language,
          dialect: it.dialect ?? null,
          term: it.term,
          translation: it.translation,
          ipa: it.ipa ?? null,
          example_sentence: it.example ?? null,
        },
        { onConflict: "language,term,dialect" },
      )
      .select("id")
      .single();
    if (!vocab) continue;
    await supabase
      .from("srs_cards")
      .upsert(
        { user_id: user.id, vocab_id: vocab.id },
        { onConflict: "user_id,vocab_id", ignoreDuplicates: true },
      );
  }
}
