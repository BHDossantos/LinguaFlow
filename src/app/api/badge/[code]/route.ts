import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://learnnoelia.com";

// Open Badges v2 Assertion (spec §20) for a credential — a portable, standards
// based badge (LinkedIn, badge wallets). Public, read by code via the same
// SECURITY DEFINER RPC as /verify.
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  let cred: any = null;
  try {
    const supabase = await supabaseServer();
    const { data } = await supabase.rpc("verify_credential", { p_code: code });
    cred = Array.isArray(data) ? data[0] : data;
  } catch {
    cred = null;
  }
  if (!cred) return NextResponse.json({ error: "not found" }, { status: 404 });

  const assertion = {
    "@context": "https://w3id.org/openbadges/v2",
    type: "Assertion",
    id: `${SITE}/api/badge/${cred.code}`,
    recipient: { type: "name", hashed: false, identity: cred.learner_name ?? "Learner" },
    issuedOn: cred.issued_at,
    verification: { type: "HostedBadge" },
    badge: {
      type: "BadgeClass",
      id: `${SITE}/verify/${cred.code}`,
      name: `${cred.course_title}${cred.cefr_level ? ` (${cred.cefr_level})` : ""}`,
      description:
        `Awarded by Noelia for completing "${cred.course_title}"` +
        (typeof cred.mastery_pct === "number" && cred.mastery_pct > 0 ? `, with ${cred.mastery_pct}% of skills mastered.` : "."),
      image: `${SITE}/og.png`,
      criteria: { narrative: "Completed every lesson of the course and passed its assessments on Noelia." },
      issuer: {
        type: "Profile",
        id: `${SITE}`,
        name: "Noelia",
        url: SITE,
      },
    },
  };

  return new NextResponse(JSON.stringify(assertion, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="noelia-badge-${cred.code}.json"`,
      "cache-control": "public, max-age=3600",
    },
  });
}
