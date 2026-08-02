import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify credential" };

// Public credential verification (spec §20) — no sign-in required. Reads a
// single credential by its code via the SECURITY DEFINER verify_credential RPC.
export default async function VerifyPage(props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params;
  let cred: any = null;
  try {
    const supabase = await supabaseServer();
    const { data } = await supabase.rpc("verify_credential", { p_code: code });
    cred = Array.isArray(data) ? data[0] : data;
  } catch {
    cred = null;
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 py-10">
      <Link href="/" className="flex items-center justify-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 font-extrabold text-white">N</span>
        <span className="text-lg font-bold">Noelia</span>
      </Link>

      {!cred ? (
        <div className="card text-center">
          <p className="text-2xl">🔍</p>
          <h1 className="mt-2 text-xl font-bold">Credential not found</h1>
          <p className="mt-1 text-sm text-ink-500">
            No credential matches code <span className="font-mono">{code}</span>. Check the code and try again.
          </p>
        </div>
      ) : (
        <div className="card border-brand-500/30 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-600">✓ Verified credential</p>
          <h1 className="mt-3 text-2xl font-extrabold">{cred.learner_name}</h1>
          <p className="mt-1 text-sm text-ink-500">completed</p>
          <p className="mt-1 text-lg font-bold">
            {cred.course_title}
            {cred.cefr_level ? <span className="ml-2 text-base text-brand-600">{cred.cefr_level}</span> : null}
          </p>
          {typeof cred.mastery_pct === "number" && cred.mastery_pct > 0 && (
            <p className="mt-1 text-xs font-semibold text-brand-600">{cred.mastery_pct}% of skills mastered</p>
          )}
          <p className="mt-3 text-sm text-ink-500">
            Issued {new Date(cred.issued_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className="mt-4 text-[10px] tracking-widest text-ink-500">Noelia · learnnoelia.com · {cred.code}</p>
        </div>
      )}

      <p className="text-center text-xs text-ink-500">
        <Link href="/" className="text-brand-600 underline">Learn on Noelia →</Link>
      </p>
    </div>
  );
}
