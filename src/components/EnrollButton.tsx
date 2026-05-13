"use client";
import { useTransition } from "react";
import { enrollInCourse, unenrollFromCourse } from "@/app/learn/actions";

export function EnrollButton({ courseId, enrolled }: { courseId: string; enrolled: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() =>
        start(() => (enrolled ? unenrollFromCourse({ courseId }) : enrollInCourse({ courseId })))
      }
      disabled={pending}
      className={enrolled ? "btn-ghost text-sm" : "btn-primary text-sm"}
    >
      {pending ? "…" : enrolled ? "Enrolled ✓" : "Enroll"}
    </button>
  );
}
