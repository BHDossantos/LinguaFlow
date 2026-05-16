"use client";
import { useState, useTransition } from "react";
import {
  postAnnouncement,
  deleteAnnouncement,
} from "@/app/school/[orgId]/classrooms/[classroomId]/announcements/actions";

type Announcement = {
  id: string;
  body: string;
  pinned: boolean;
  created_at: string;
  posted_by_name: string | null;
};

export function Announcements({
  orgId, classroomId, canManage, items,
}: {
  orgId: string;
  classroomId: string;
  canManage: boolean;
  items: Announcement[];
}) {
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function post() {
    setError(null);
    start(async () => {
      try {
        await postAnnouncement({ orgId, classroomId, body, pinned });
        setBody("");
        setPinned(false);
      } catch (e: any) {
        setError(e?.message ?? "failed");
      }
    });
  }

  function remove(id: string) {
    setError(null);
    start(async () => {
      try {
        await deleteAnnouncement({ orgId, classroomId, announcementId: id });
      } catch (e: any) {
        setError(e?.message ?? "failed");
      }
    });
  }

  // Pinned first, then newest.
  const sorted = [...items].sort((a, b) =>
    a.pinned === b.pinned
      ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      : a.pinned ? -1 : 1,
  );

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
        Announcements ({items.length})
      </h2>

      {canManage && (
        <div className="card space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Post an announcement…"
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              Pin to top
            </label>
            <button
              onClick={post}
              disabled={pending || body.trim().length < 1}
              className="btn-primary text-sm"
            >
              {pending ? "…" : "Post"}
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="card text-sm text-ink-500">No announcements yet.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((a) => (
            <li key={a.id} className={"card space-y-1 " + (a.pinned ? "border-brand-500/40" : "")}>
              <div className="flex items-center justify-between text-xs text-ink-500">
                <span>
                  {a.pinned && <span className="mr-1 text-brand-500">📌</span>}
                  {a.posted_by_name ?? "—"} · {new Date(a.created_at).toLocaleString()}
                </span>
                {canManage && (
                  <button
                    onClick={() => remove(a.id)}
                    disabled={pending}
                    className="text-xs text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm">{a.body}</p>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
