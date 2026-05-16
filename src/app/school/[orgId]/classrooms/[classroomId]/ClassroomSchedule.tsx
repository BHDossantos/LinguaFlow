"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  createMeeting,
  deleteMeeting,
} from "@/app/school/[orgId]/classrooms/[classroomId]/meetings/actions";

type Meeting = {
  id: string;
  title: string | null;
  location: string | null;
  scheduled_at: string;
  duration_minutes: number;
  attendance_taken: number;
  attendance_total: number;
};

export function ClassroomSchedule({
  orgId, classroomId, canManage, meetings,
}: {
  orgId: string;
  classroomId: string;
  canManage: boolean;
  meetings: Meeting[];
}) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add() {
    setError(null);
    start(async () => {
      try {
        await createMeeting({
          orgId, classroomId, scheduledAt, durationMinutes,
          title: title || undefined, location: location || undefined,
        });
        setScheduledAt(""); setTitle(""); setLocation("");
      } catch (e: any) {
        setError(e?.message ?? "failed");
      }
    });
  }

  function remove(meetingId: string) {
    setError(null);
    start(async () => {
      try {
        await deleteMeeting({ orgId, classroomId, meetingId });
      } catch (e: any) {
        setError(e?.message ?? "failed");
      }
    });
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
        Schedule ({meetings.length})
      </h2>

      {meetings.length === 0 ? (
        <p className="card text-sm text-ink-500">No meetings scheduled.</p>
      ) : (
        <ul className="space-y-2">
          {meetings.map((m) => {
            const when = new Date(m.scheduled_at);
            return (
              <li key={m.id}>
                <div className="card flex items-center justify-between">
                  <Link
                    href={`/school/${orgId}/classrooms/${classroomId}/meetings/${m.id}`}
                    className="flex-1"
                  >
                    <p className="font-medium">{m.title || "Class meeting"}</p>
                    <p className="text-xs text-ink-500">
                      {when.toLocaleString()} · {m.duration_minutes} min
                      {m.location ? ` · ${m.location}` : ""}
                    </p>
                    <p className="text-xs text-ink-500">
                      Attendance: {m.attendance_taken} / {m.attendance_total}
                    </p>
                  </Link>
                  {canManage && (
                    <button
                      onClick={() => remove(m.id)}
                      disabled={pending}
                      className="ml-2 text-xs text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {canManage && (
        <div className="card space-y-2">
          <p className="text-sm font-medium">Schedule a meeting</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={5}
              max={480}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              placeholder="Minutes"
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (optional)"
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={add}
            disabled={pending || !scheduledAt}
            className="btn-primary w-full"
          >
            {pending ? "…" : "Add to schedule"}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
