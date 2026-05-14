"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ensureInviteCode, linkStudent, unlinkStudent } from "./actions";

type LinkedStudent = { id: string; name: string };

export function FamilyClient({
  initialCode, linkedStudents,
}: {
  initialCode: string | null;
  linkedStudents: LinkedStudent[];
}) {
  const [code, setCode] = useState(initialCode);
  const [entry, setEntry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function reveal() {
    start(async () => {
      try { setCode(await ensureInviteCode()); }
      catch (e: any) { setError(e?.message ?? "failed"); }
    });
  }

  function link() {
    setError(null);
    start(async () => {
      try { await linkStudent({ code: entry }); setEntry(""); }
      catch (e: any) { setError(e?.message ?? "failed"); }
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Family</h1>
        <p className="text-sm text-ink-500">
          Link a parent or guardian so they can follow progress, grades, and assignments.
        </p>
      </header>

      <section className="card space-y-2">
        <h2 className="font-semibold">Invite a parent</h2>
        <p className="text-sm text-ink-500">
          Share this code with your parent. They enter it to link to your account.
        </p>
        {code ? (
          <p className="rounded-xl bg-brand-50 px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] text-brand-700">
            {code}
          </p>
        ) : (
          <button onClick={reveal} disabled={pending} className="btn-primary w-full">
            {pending ? "…" : "Generate my invite code"}
          </button>
        )}
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Follow a student</h2>
        <p className="text-sm text-ink-500">
          Are you a parent? Enter your child's 6-character invite code.
        </p>
        <div className="flex gap-2">
          <input
            value={entry}
            onChange={(e) => setEntry(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ABC123"
            className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 tracking-[0.2em]"
          />
          <button onClick={link} disabled={pending || entry.length !== 6} className="btn-primary">
            Link
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Students you follow
        </h2>
        {linkedStudents.length === 0 ? (
          <p className="card text-sm text-ink-500">Not following anyone yet.</p>
        ) : (
          <ul className="space-y-2">
            {linkedStudents.map((s) => (
              <li key={s.id} className="card flex items-center justify-between">
                <Link href={`/parent/${s.id}`} className="font-medium text-brand-600">
                  {s.name}
                </Link>
                <button
                  onClick={() => start(() => unlinkStudent({ studentId: s.id }))}
                  className="text-xs text-ink-500"
                >
                  Unlink
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
