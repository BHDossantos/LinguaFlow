import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { updateProfile } from "@/app/settings/actions";
import { SignOutButton, DeleteAccountButton } from "@/app/settings/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const user = await requireUser();
  const supabase = await supabaseServer();

  const [{ data: profile }, { data: stats }] = await Promise.all([
    supabase.from("profiles").select("display_name,cefr_level").eq("id", user.id).single(),
    supabase.from("user_stats").select("daily_goal_minutes").eq("user_id", user.id).maybeSingle(),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <Link href="/profile" className="text-sm text-brand-500">← Profile</Link>
        <h1 className="mt-1 text-2xl font-bold">Settings</h1>
      </header>

      {saved && (
        <p className="card border-green-200 bg-green-50 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10">
          ✓ Saved.
        </p>
      )}

      <form action={updateProfile} className="card space-y-3">
        <label className="block">
          <span className="text-sm font-medium">Display name</span>
          <input
            name="displayName"
            required
            defaultValue={profile?.display_name ?? ""}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 dark:bg-white/5"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-sm font-medium">Level (CEFR)</span>
            <select
              name="cefr"
              defaultValue={profile?.cefr_level ?? "A1"}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 dark:bg-white/5"
            >
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Daily goal (min)</span>
            <input
              name="dailyGoalMinutes"
              type="number"
              min={5}
              max={240}
              defaultValue={stats?.daily_goal_minutes ?? 20}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 dark:bg-white/5"
            />
          </label>
        </div>
        <button type="submit" className="btn-primary w-full">Save</button>
      </form>

      <section className="card space-y-2">
        <p className="text-sm font-medium">Languages</p>
        <p className="text-xs text-ink-500">
          Add or switch target languages from onboarding.
        </p>
        <Link href="/onboarding" className="btn-ghost block w-full text-center">
          Manage languages
        </Link>
      </section>

      <section className="space-y-2">
        <SignOutButton />
        <DeleteAccountButton />
      </section>

      <footer className="pb-4 text-center text-xs text-ink-500">
        <Link href="/legal/privacy" className="underline-offset-2 hover:underline">Privacy</Link>
        {" · "}
        <Link href="/legal/terms" className="underline-offset-2 hover:underline">Terms</Link>
      </footer>
    </div>
  );
}
