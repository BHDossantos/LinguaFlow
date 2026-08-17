import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

// GDPR-style "export all my data" (spec §19). Returns a single JSON file with
// every row the signed-in learner owns, read under their own RLS. Best-effort
// per table so an un-migrated table never breaks the export.
export async function GET() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // [table, user-id column]
  const SOURCES: [string, string][] = [
    ["profiles", "id"],
    ["target_languages", "user_id"],
    ["user_stats", "user_id"],
    ["lesson_progress", "user_id"],
    ["srs_cards", "user_id"],
    ["xp_events", "user_id"],
    ["weekly_goals", "user_id"],
    ["enrollments", "user_id"],
    ["submissions", "student_id"],
    ["skill_states", "user_id"],
    ["mastery_events", "user_id"],
    ["misconceptions", "user_id"],
    ["diagnostic_results", "user_id"],
    ["tutor_conversations", "user_id"],
    ["project_submissions", "user_id"],
    ["credentials", "user_id"],
    ["notifications", "user_id"],
    ["pronunciation_attempts", "user_id"],
  ];

  const data: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email },
  };

  for (const [table, col] of SOURCES) {
    try {
      const { data: rows } = await supabase.from(table).select("*").eq(col, user.id);
      data[table] = rows ?? [];
    } catch {
      // table not present / not migrated — omit it.
    }
  }

  const body = JSON.stringify(data, null, 2);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="noelia-data-${user.id.slice(0, 8)}.json"`,
      "cache-control": "no-store",
    },
  });
}
