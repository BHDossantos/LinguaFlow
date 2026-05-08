import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureCardsForVocab } from "@/lib/srs-server";

export const runtime = "nodejs";

const Body = z.object({
  language: z.string(),
  dialect: z.string().nullish(),
  items: z.array(z.object({
    term: z.string(),
    translation: z.string(),
    ipa: z.string().nullish(),
    example: z.string().nullish(),
  })).max(10),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { language, dialect, items } = parsed.data;
  await ensureCardsForVocab(
    items.map((i) => ({
      language,
      dialect: dialect ?? null,
      term: i.term,
      translation: i.translation,
      ipa: i.ipa ?? null,
      example: i.example ?? null,
    })),
  );
  return NextResponse.json({ added: items.length });
}
