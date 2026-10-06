import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { GraderTabs } from "./GraderTabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Grade papers" };

// Teacher tool (spec §8/§14): grade student papers — typed, scanned, photographed,
// PDF, or PowerPoint. Single mode grades one paper for a chosen student; bulk mode
// takes a stack of files, reads each student's name, auto-creates accounts as
// needed, grades, and lets the teacher email feedback and print a marked-up report.
export default async function GradePaperPage() {
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();

  // The teacher's classrooms (for the bulk picker) and their students.
  const { data: myClasses } = await supabase
    .from("classroom_members")
    .select("classroom_id, classrooms(id, name)")
    .eq("user_id", user.id)
    .eq("role", "teacher");
  const classrooms = (myClasses ?? [])
    .map((c) => (c as any).classrooms)
    .filter(Boolean)
    .map((c: any) => ({ id: c.id as string, name: (c.name as string) ?? "Class" }));
  const classIds = classrooms.map((c) => c.id);

  let students: { id: string; name: string }[] = [];
  if (classIds.length) {
    const { data: roster } = await supabase
      .from("classroom_members")
      .select("user_id, profiles(id, display_name)")
      .in("classroom_id", classIds)
      .eq("role", "student");
    const byId = new Map<string, string>();
    for (const r of roster ?? []) {
      const p = (r as any).profiles;
      if (p?.id) byId.set(p.id, p.display_name ?? "Student");
    }
    students = [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Grade papers</h1>
        <p className="text-sm text-ink-500">
          Scan, photograph, or upload a test, essay, PDF, or PowerPoint — even a snapshot of work
          on a whiteboard, scrap paper, or a napkin. The system reads the handwriting, grades it,
          and files the result to the student, who (with their parents and other teachers) is
          notified with the score, feedback, focus areas, and a plan. Then email the feedback in
          one click, or print a marked-up report.
        </p>
      </header>
      <GraderTabs classrooms={classrooms} students={students} />
    </div>
  );
}
