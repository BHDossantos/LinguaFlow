import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { ClassroomRoster } from "./ClassroomRoster";
import { ClassroomCourses } from "./ClassroomCourses";

export const dynamic = "force-dynamic";

export default async function ClassroomPage({
  params,
}: {
  params: { orgId: string; classroomId: string };
}) {
  const user = await requireUser();
  const supabase = supabaseServer();

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id,name,grade_level,org_id")
    .eq("id", params.classroomId)
    .maybeSingle();
  if (!classroom || classroom.org_id !== params.orgId) notFound();

  const [
    { data: orgMembers },
    { data: classMembers },
    { data: myOrgMembership },
    { data: assignedCourses },
    { data: myCourses },
  ] = await Promise.all([
    supabase
      .from("org_members")
      .select("user_id,profile:profiles(display_name)")
      .eq("org_id", params.orgId),
    supabase
      .from("classroom_members")
      .select("user_id,role,profile:profiles(display_name)")
      .eq("classroom_id", params.classroomId),
    supabase
      .from("org_members")
      .select("role")
      .eq("org_id", params.orgId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("classroom_courses")
      .select(`
        course:courses(
          id,title,subject,kind,
          assignments(id)
        )
      `)
      .eq("classroom_id", params.classroomId),
    supabase
      .from("courses")
      .select("id,title,kind")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const isOrgAdmin =
    myOrgMembership?.role === "owner" || myOrgMembership?.role === "admin";
  const isClassroomTeacher = (classMembers ?? []).some(
    (m: any) => m.user_id === user.id && m.role === "teacher",
  );
  const canManage = isOrgAdmin || isClassroomTeacher;

  const inClassroom = (classMembers ?? []).map((m: any) => ({
    user_id: m.user_id,
    role: m.role,
    name: m.profile?.display_name ?? m.user_id.slice(0, 8),
  }));
  const inSet = new Set(inClassroom.map((m) => m.user_id));
  const available = (orgMembers ?? [])
    .filter((m: any) => !inSet.has(m.user_id))
    .map((m: any) => ({
      user_id: m.user_id,
      name: m.profile?.display_name ?? m.user_id.slice(0, 8),
    }));

  const assigned = (assignedCourses ?? [])
    .map((row: any) => row.course)
    .filter(Boolean)
    .map((c: any) => ({
      id: c.id,
      title: c.title,
      subject: c.subject,
      kind: c.kind,
      assignmentCount: (c.assignments ?? []).length,
    }));
  const assignedIds = new Set(assigned.map((c) => c.id));
  const assignable = (myCourses ?? [])
    .filter((c: any) => !assignedIds.has(c.id))
    .map((c: any) => ({ id: c.id, title: c.title, kind: c.kind }));

  // Recent assignments across all assigned courses, for a quick at-a-glance view.
  const assignedCourseIds = assigned.map((c) => c.id);
  const { data: recentAssignments } =
    assignedCourseIds.length === 0
      ? { data: [] as any[] }
      : await supabase
          .from("assignments")
          .select("id,title,kind,due_at,course_id")
          .in("course_id", assignedCourseIds)
          .eq("published", true)
          .order("due_at", { ascending: true, nullsFirst: false })
          .limit(10);

  return (
    <div className="space-y-5">
      <Link href={`/school/${params.orgId}`} className="text-sm text-brand-500">
        ← Organization
      </Link>
      <header>
        <h1 className="text-2xl font-bold">{classroom.name}</h1>
        {classroom.grade_level && (
          <p className="text-sm text-ink-500">{classroom.grade_level}</p>
        )}
      </header>

      <ClassroomCourses
        orgId={params.orgId}
        classroomId={classroom.id}
        canManage={canManage}
        assigned={assigned}
        assignable={assignable}
      />

      {(recentAssignments ?? []).length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Upcoming assignments
          </h2>
          <ul className="space-y-2">
            {(recentAssignments ?? []).map((a) => (
              <li key={a.id}>
                <Link href={`/teach/assignments/${a.id}`} className="card flex items-center justify-between">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-ink-500 capitalize">
                      {a.kind}
                      {a.due_at ? ` · due ${new Date(a.due_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <span className="text-ink-500">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ClassroomRoster
        orgId={params.orgId}
        classroomId={classroom.id}
        isAdmin={canManage}
        inClassroom={inClassroom}
        available={available}
      />
    </div>
  );
}
