import type { SupabaseClient } from "@supabase/supabase-js";

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "").slice(0, 40) || "student";

export type ResolvedStudent = {
  id: string;
  displayName: string;
  created: boolean;
  email: string | null;
  parentEmail: string | null;
};

// Find a student by name within a teacher's classroom, or create a placeholder
// account and enroll them. Enrolling in the teacher's classroom is what lets the
// teacher file and read the student's paper (via teaches_student). Requires the
// service-role admin client.
export async function findOrCreateStudent(
  admin: SupabaseClient,
  opts: { classroomId: string; firstName: string; lastName: string },
): Promise<ResolvedStudent> {
  const displayName = `${opts.firstName} ${opts.lastName}`.replace(/\s+/g, " ").trim();
  const target = norm(displayName);

  // 1) Try to match an existing student already in this classroom.
  const { data: roster } = await admin
    .from("classroom_members")
    .select("user_id, profiles(id, display_name, email, parent_email)")
    .eq("classroom_id", opts.classroomId)
    .eq("role", "student");

  for (const row of roster ?? []) {
    const p = (row as any).profiles;
    if (p?.display_name && norm(p.display_name) === target) {
      return {
        id: p.id,
        displayName: p.display_name,
        created: false,
        email: p.email ?? null,
        parentEmail: p.parent_email ?? null,
      };
    }
  }

  // 2) Create a placeholder account. The login email is a synthetic internal
  //    address the teacher replaces with the real one later.
  const email = `auto.${slug(displayName)}.${Math.random().toString(36).slice(2, 8)}@students.learnnoelia.com`;
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID() + crypto.randomUUID(),
    user_metadata: { display_name: displayName },
  });
  if (error || !created?.user) {
    throw new Error(`Could not create student account: ${error?.message ?? "unknown error"}`);
  }
  const id = created.user.id;

  // The signup trigger made the profile row; mark it as an auto-created student.
  await admin
    .from("profiles")
    .update({ display_name: displayName, role: "student", auto_created: true })
    .eq("id", id);

  // Enroll in the teacher's classroom so teaches_student() is true.
  await admin
    .from("classroom_members")
    .upsert({ classroom_id: opts.classroomId, user_id: id, role: "student" }, { onConflict: "classroom_id,user_id" });

  return { id, displayName, created: true, email: null, parentEmail: null };
}
