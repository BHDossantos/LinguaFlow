"use client";
import { useState } from "react";
import { PaperGrader } from "./PaperGrader";
import { BulkGrader } from "./BulkGrader";

type Student = { id: string; name: string };
type Classroom = { id: string; name: string };

export function GraderTabs({ classrooms, students }: { classrooms: Classroom[]; students: Student[] }) {
  const [tab, setTab] = useState<"bulk" | "single">("bulk");
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("bulk")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            tab === "bulk" ? "bg-brand-500 text-white" : "bg-black/5 text-ink-700"
          }`}
        >
          Bulk upload
        </button>
        <button
          onClick={() => setTab("single")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            tab === "single" ? "bg-brand-500 text-white" : "bg-black/5 text-ink-700"
          }`}
        >
          Single paper
        </button>
      </div>
      {tab === "bulk" ? (
        <BulkGrader classrooms={classrooms} students={students} />
      ) : (
        <PaperGrader students={students} />
      )}
    </div>
  );
}
