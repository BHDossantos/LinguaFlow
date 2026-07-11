import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Daily streak-reminder fan-out, invoked by a scheduler (Vercel cron).
// Sends to users who have a live streak, haven't practiced today, and have
// at least one push subscription. Guarded by CRON_SECRET.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    return NextResponse.json({ skipped: "vapid not configured" }, { status: 200 });
  }

  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:hello@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const today = new Date().toISOString().slice(0, 10);
  const { data: atRisk } = await admin
    .from("user_stats")
    .select("user_id,streak_days")
    .gt("streak_days", 0)
    .neq("last_activity_date", today)
    .limit(500);

  const ids = (atRisk ?? []).map((r) => r.user_id);
  if (ids.length === 0) return NextResponse.json({ sent: 0 });

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("user_id,endpoint,p256dh,auth")
    .in("user_id", ids);

  const streakById = new Map((atRisk ?? []).map((r) => [r.user_id, r.streak_days]));
  let sent = 0;
  let pruned = 0;
  for (const s of subs ?? []) {
    const streak = streakById.get(s.user_id) ?? 0;
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({
          title: `🔥 ${streak}-day streak on the line`,
          body: "A few minutes of practice keeps it alive. You've got this.",
          url: "/",
        }),
      );
      sent++;
    } catch (e: any) {
      // 404/410 = expired subscription — prune it.
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        pruned++;
      }
    }
  }
  return NextResponse.json({ sent, pruned, candidates: ids.length });
}
