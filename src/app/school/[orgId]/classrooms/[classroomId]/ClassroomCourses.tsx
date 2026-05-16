"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  assignCourseToClassroom,
  unassignCourseFromClassroom,
} from "@/app/school/actions";

type AssignedCourse = {
  id: string;
  title: string;
  subject: string | null;
  kind: string;
  assignmentCount: number;
};
type AssignableCourse = { id: string; title: string; kind: string };

export function ClassroomCourses({
  orgId, classroomId, canManage, assigned, assignable,
}: {
  orgId: string;
  classroomId: string;
  canManage: boolean;
  assigned: AssignedCourse[];
  assignable: AssignableCourse[];
}) {
  const [picked, setPicked] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add() {
    if (!picked) return;
    setError(null);
    start(async () => {
      try {
        await assignCourseToClassroom({ orgId, classroomId, courseId: picked });
        setPicked("");
      } catch (e: any) {
        setError(e?.message ?? "failed");
      }
    });
  }
  function remove(courseId: string) {
    setError(null);
    start(async () => {
      try {
        await unassignCourseFromClassroom({ orgId, classroomId, courseId });
      } catch (e: any) {
        setError(e?.message ?? "failed");
      }
    });
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
        Courses ({assigned.length})
      </h2>

      {assigned.length === 0 ? (
        <p className="card text-sm text-ink-500">
          No courses assigned yet. Add a course and every student in this classroom
          is auto-enrolled.
        </p>
      ) : (
        <ul className="space-y-2">
          {assigned.map((c) => (
            <li key={c.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-ink-500 capitalize">
                  {c.kind}
                  {c.subject ? ` · ${c.subject}` : ""} · {c.assignmentCount} assignment
                  {c.assignmentCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/teach/courses/${c.id}`} className="btn-ghost px-2 py-1 text-xs">
                  Open
                </Link>
                {canManage && (
                  <button
                    onClick={() => remove(c.id)}
                    disabled={pending}
                    className="text-xs text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <div className="card space-y-2">
          <p className="text-sm font-medium">Assign one of your courses</p>
          {assignable.length === 0 ? (
            <p className="text-xs text-ink-500">
              You don't have any unassigned courses.{" "}
              <Link href="/teach/courses/new" className="text-brand-500">Create one →</Link>
            </p>
          ) : (
            <div className="flex gap-2">
              <select
                value={picked}
                onChange={(e) => setPicked(e.target.value)}
                className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              >
                <option value="">— pick a course —</option>
                {assignable.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <button
                onClick={add}
                disabled={pending || !picked}
                className="btn-primary text-sm"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
