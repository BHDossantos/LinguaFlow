import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { ClassroomRoster } from "./ClassroomRoster";

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

  const [{ data: orgMembers }, { data: classMembers }, { data: myMembership }] =
    await Promise.all([
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
    ]);

  const isAdmin = myMembership?.role === "owner" || myMembership?.role === "admin";

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

      <ClassroomRoster
        orgId={params.orgId}
        classroomId={classroom.id}
        isAdmin={isAdmin}
        inClassroom={inClassroom}
        available={available}
      />
    </div>
  );
}
