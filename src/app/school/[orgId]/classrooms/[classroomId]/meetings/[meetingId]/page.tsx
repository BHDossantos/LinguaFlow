import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { AttendanceTaker } from "./AttendanceTaker";

export const dynamic = "force-dynamic";

export default async function MeetingPage({
  params,
}: {
  params: { orgId: string; classroomId: string; meetingId: string };
}) {
  const user = await requireUser();
  const supabase = supabaseServer();

  const { data: meeting } = await supabase
    .from("class_meetings")
    .select("id,classroom_id,title,location,scheduled_at,duration_minutes")
    .eq("id", params.meetingId)
    .maybeSingle();
  if (!meeting || meeting.classroom_id !== params.classroomId) notFound();

  const [
    { data: students },
    { data: existing },
    { data: myOrgMembership },
    { data: classMembership },
  ] = await Promise.all([
    supabase
      .from("classroom_members")
      .select("user_id,role,profile:profiles(display_name)")
      .eq("classroom_id", params.classroomId)
      .eq("role", "student"),
    supabase
      .from("attendance")
      .select("user_id,status,note")
      .eq("meeting_id", params.meetingId),
    supabase
      .from("org_members")
      .select("role")
      .eq("org_id", params.orgId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("classroom_members")
      .select("role")
      .eq("classroom_id", params.classroomId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const isOrgAdmin =
    myOrgMembership?.role === "owner" || myOrgMembership?.role === "admin";
  const isClassroomTeacher = classMembership?.role === "teacher";
  const canManage = isOrgAdmin || isClassroomTeacher;

  const byUser = new Map(
    (existing ?? []).map((r: any) => [r.user_id, { status: r.status, note: r.note ?? "" }]),
  );
  const rows = (students ?? []).map((s: any) => {
    const e = byUser.get(s.user_id);
    return {
      userId: s.user_id,
      name: s.profile?.display_name ?? s.user_id.slice(0, 8),
      status: (e?.status as any) ?? null,
      note: e?.note ?? "",
    };
  });

  const when = new Date(meeting.scheduled_at);

  return (
    <div className="space-y-4">
      <Link
        href={`/school/${params.orgId}/classrooms/${params.classroomId}`}
        className="text-sm text-brand-500"
      >
        ← Classroom
      </Link>
      <header>
        <h1 className="text-2xl font-bold">{meeting.title || "Class meeting"}</h1>
        <p className="text-sm text-ink-500">
          {when.toLocaleString()} · {meeting.duration_minutes} min
          {meeting.location ? ` · ${meeting.location}` : ""}
        </p>
      </header>

      <AttendanceTaker
        orgId={params.orgId}
        classroomId={params.classroomId}
        meetingId={meeting.id}
        canManage={canManage}
        initial={rows}
      />
    </div>
  );
}
