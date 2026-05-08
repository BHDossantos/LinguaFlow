import { supabaseServer } from "@/lib/supabase/server";
import { ConnectClient } from "./ConnectClient";
import { requireOnboardedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ConnectPage({ params }: { params: { tutorId: string } }) {
  await requireOnboardedUser();
  const supabase = supabaseServer();
  const { data: tutor } = await supabase
    .from("tutors")
    .select("display_name,rate_cents_per_minute,languages,dialects,is_online")
    .eq("id", params.tutorId)
    .single();

  if (!tutor) return <p>Tutor not found.</p>;
  return <ConnectClient tutorId={params.tutorId} tutor={tutor} />;
}
