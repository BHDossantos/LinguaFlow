import { requireOnboardedUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { PaperGrader } from "./PaperGrader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Grade a paper" };

// Teacher tool (spec §8/§14): grade a student's paper — typed, scanned, or
// photographed — on the student's account. The student, their teachers, and
// their guardians are notified with the score, feedback, focus areas, and a plan.
export default async function GradePaperPage() {
  const user = await requireOnboardedUser();
  const supabase = await supabaseServer();

  // The teacher's students = students in the classrooms where they teach.
  const { data: myClasses } = await supabase
    .from("classroom_members")
    .select("classroom_id")
    .eq("user_id", user.id)
    .eq("role", "teacher");
  const classIds = (myClasses ?? []).map((c) => c.classroom_id);

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
    students = [...byId.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Grade a paper</h1>
        <p className="text-sm text-ink-500">
          Took a test on paper? Scan or photograph it, or type the answers — the system reads it,
          grades it, and sends the student, their other teachers, and their parents the score,
          detailed feedback, focus areas, and a next-steps plan.
        </p>
      </header>
      <PaperGrader students={students} />
    </div>
  );
}
