"use client";
import { useState, useTransition } from "react";
import { markAttendance } from "@/app/school/[orgId]/classrooms/[classroomId]/meetings/actions";

type Status = "present" | "absent" | "late" | "excused";

type Row = {
  userId: string;
  name: string;
  status: Status | null;
  note: string;
};

const STATUSES: Status[] = ["present", "absent", "late", "excused"];

export function AttendanceTaker({
  orgId, classroomId, meetingId, canManage, initial,
}: {
  orgId: string;
  classroomId: string;
  meetingId: string;
  canManage: boolean;
  initial: Row[];
}) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function set(userId: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.userId === userId ? { ...r, ...patch } : r)));
  }

  function markAll(status: Status) {
    setRows((rs) => rs.map((r) => ({ ...r, status })));
  }

  function save() {
    setError(null);
    const items = rows
      .filter((r) => r.status != null)
      .map((r) => ({ userId: r.userId, status: r.status!, note: r.note || undefined }));
    if (items.length === 0) return;
    start(async () => {
      try {
        await markAttendance({ orgId, classroomId, meetingId, items });
        setSavedAt(new Date().toLocaleTimeString());
      } catch (e: any) {
        setError(e?.message ?? "save failed");
      }
    });
  }

  return (
    <div className="space-y-3">
      {canManage && (
        <div className="flex flex-wrap gap-2">
          <span className="self-center text-xs text-ink-500">Mark all:</span>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => markAll(s)}
              className="btn-ghost px-2 py-1 text-xs capitalize"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <ul className="space-y-2">
        {rows.length === 0 && (
          <li className="card text-sm text-ink-500">No students in this classroom.</li>
        )}
        {rows.map((r) => (
          <li key={r.userId} className="card space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{r.name}</span>
              {canManage ? (
                <div className="flex gap-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => set(r.userId, { status: s })}
                      className={
                        "rounded-md px-2 py-1 text-xs capitalize " +
                        (r.status === s
                          ? s === "present"  ? "bg-green-600 text-white" :
                            s === "absent"   ? "bg-red-600 text-white" :
                            s === "late"     ? "bg-amber-500 text-white" :
                                               "bg-brand-500 text-white"
                          : "bg-black/5 text-ink-700")
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-xs capitalize text-ink-500">
                  {r.status ?? "—"}
                </span>
              )}
            </div>
            {canManage && (
              <input
                value={r.note}
                onChange={(e) => set(r.userId, { note: e.target.value })}
                placeholder="Note (optional)"
                className="w-full rounded-lg border border-black/10 bg-white px-2 py-1 text-xs"
              />
            )}
            {!canManage && r.note && (
              <p className="text-xs text-ink-500">{r.note}</p>
            )}
          </li>
        ))}
      </ul>

      {canManage && (
        <button onClick={save} disabled={pending} className="btn-primary w-full">
          {pending ? "Saving…" : savedAt ? `Saved at ${savedAt} — save again` : "Save attendance"}
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
