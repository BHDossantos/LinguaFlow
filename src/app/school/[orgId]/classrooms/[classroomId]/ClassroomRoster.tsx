"use client";
import { useState, useTransition } from "react";
import { addClassroomMember, removeClassroomMember } from "@/app/school/actions";

type Person = { user_id: string; name: string; role?: string };

export function ClassroomRoster({
  orgId, classroomId, isAdmin, inClassroom, available,
}: {
  orgId: string;
  classroomId: string;
  isAdmin: boolean;
  inClassroom: Person[];
  available: Person[];
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add(userId: string, role: "teacher" | "student") {
    setError(null);
    start(async () => {
      try {
        await addClassroomMember({ orgId, classroomId, userId, role });
      } catch (e: any) {
        setError(e?.message ?? "failed");
      }
    });
  }

  function remove(userId: string) {
    setError(null);
    start(async () => {
      try {
        await removeClassroomMember({ orgId, classroomId, userId, role: "student" });
      } catch (e: any) {
        setError(e?.message ?? "failed");
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          In this classroom ({inClassroom.length})
        </h2>
        {inClassroom.length === 0 ? (
          <p className="card text-sm text-ink-500">No members yet.</p>
        ) : (
          <ul className="space-y-1">
            {inClassroom.map((p) => (
              <li key={p.user_id} className="card flex items-center justify-between py-2">
                <span className="text-sm">
                  {p.name}
                  <span className="ml-2 text-xs capitalize text-ink-500">{p.role}</span>
                </span>
                {isAdmin && (
                  <button
                    onClick={() => remove(p.user_id)}
                    disabled={pending}
                    className="text-xs text-red-600"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {isAdmin && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Add from organization
          </h2>
          {available.length === 0 ? (
            <p className="card text-sm text-ink-500">Everyone is already in this classroom.</p>
          ) : (
            <ul className="space-y-1">
              {available.map((p) => (
                <li key={p.user_id} className="card flex items-center justify-between py-2">
                  <span className="text-sm">{p.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => add(p.user_id, "student")}
                      disabled={pending}
                      className="btn-ghost px-2 py-1 text-xs"
                    >
                      + Student
                    </button>
                    <button
                      onClick={() => add(p.user_id, "teacher")}
                      disabled={pending}
                      className="btn-ghost px-2 py-1 text-xs"
                    >
                      + Teacher
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
