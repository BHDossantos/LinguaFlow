"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { createClassroom, setOrgMemberRole } from "@/app/school/actions";

type Member = { user_id: string; role: string; name: string };
type Classroom = { id: string; name: string; grade_level: string | null; size: number };

const ROLES = ["student", "teacher", "admin", "owner"] as const;

export function OrgDashboard({
  orgId, isAdmin, members, classrooms,
}: {
  orgId: string;
  isAdmin: boolean;
  members: Member[];
  classrooms: Classroom[];
}) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function addClassroom() {
    setError(null);
    start(async () => {
      try {
        await createClassroom({ orgId, name, gradeLevel: grade || undefined });
        setName("");
        setGrade("");
      } catch (e: any) {
        setError(e?.message ?? "failed");
      }
    });
  }

  function changeRole(userId: string, role: string) {
    start(async () => {
      try {
        await setOrgMemberRole({ orgId, userId, role: role as any });
      } catch (e: any) {
        setError(e?.message ?? "failed");
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Classrooms ({classrooms.length})
          </h2>
        </div>
        {classrooms.length === 0 ? (
          <p className="card text-sm text-ink-500">No classrooms yet.</p>
        ) : (
          <ul className="space-y-2">
            {classrooms.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/school/${orgId}/classrooms/${c.id}`}
                  className="card flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-ink-500">
                      {c.grade_level ? `${c.grade_level} · ` : ""}{c.size} members
                    </p>
                  </div>
                  <span className="text-ink-500">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {isAdmin && (
          <div className="card space-y-2">
            <p className="text-sm font-medium">New classroom</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (e.g. Grade 9 — Section A)"
                className="rounded-xl border border-black/10 bg-white px-3 py-2"
              />
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Grade level"
                className="rounded-xl border border-black/10 bg-white px-3 py-2"
              />
            </div>
            <button
              onClick={addClassroom}
              disabled={pending || name.trim().length < 1}
              className="btn-primary w-full"
            >
              {pending ? "…" : "Create classroom"}
            </button>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Members ({members.length})
        </h2>
        <ul className="space-y-1">
          {members.map((m) => (
            <li key={m.user_id} className="card flex items-center justify-between py-2">
              <span className="text-sm">{m.name}</span>
              {isAdmin ? (
                <select
                  value={m.role}
                  onChange={(e) => changeRole(m.user_id, e.target.value)}
                  disabled={pending}
                  className="rounded-lg border border-black/10 bg-white px-2 py-1 text-xs capitalize"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              ) : (
                <span className="text-xs capitalize text-ink-500">{m.role}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
