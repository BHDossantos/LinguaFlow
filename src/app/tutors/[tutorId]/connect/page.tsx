import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ConnectPage({ params }: { params: { tutorId: string } }) {
  const supabase = supabaseServer();
  const { data: tutor } = await supabase
    .from("tutors")
    .select("display_name,rate_cents_per_minute,languages,dialects")
    .eq("id", params.tutorId)
    .single();

  if (!tutor) return <p>Tutor not found.</p>;

  const ratePerMin = (tutor.rate_cents_per_minute / 100).toFixed(2);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Connect with {tutor.display_name}</h1>
      <div className="card space-y-2 text-sm">
        <p><span className="font-semibold">Rate:</span> ${ratePerMin}/minute</p>
        <p><span className="font-semibold">Languages:</span> {tutor.languages?.join(", ")}</p>
        <p><span className="font-semibold">Dialects:</span> {tutor.dialects?.join(", ") || "—"}</p>
      </div>

      <div className="card space-y-2 text-sm">
        <p className="font-semibold">What we'll share with your tutor</p>
        <ul className="list-disc pl-5 text-ink-700">
          <li>Your CEFR level and target dialect.</li>
          <li>Last 7 days of SRS reviews and weak grammar areas.</li>
          <li>Most recent AI roleplay corrections.</li>
        </ul>
        <p className="text-xs text-ink-500">You can opt out per session.</p>
      </div>

      {/* TODO: Stripe payment intent + per-minute meter + WebRTC video room */}
      <Link href="#" className="btn-primary w-full text-center">
        Start session
      </Link>
      <Link href="/tutors" className="btn-ghost block text-center">Cancel</Link>
    </div>
  );
}
