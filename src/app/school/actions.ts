"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

async function requireUserId() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  return { supabase, userId: user.id };
}

const CreateOrgInput = z.object({
  name: z.string().min(2).max(120),
  type: z.enum(["school", "district", "tutoring_center", "homeschool"]),
  country: z.string().max(60).optional(),
});

export async function createOrganization(input: z.input<typeof CreateOrgInput>) {
  const data = CreateOrgInput.parse(input);
  const { supabase } = await requireUserId();
  const { data: orgId, error } = await supabase.rpc("create_organization", {
    p_name: data.name,
    p_type: data.type,
    p_country: data.country ?? null,
  });
  if (error) throw new Error(error.message);
  redirect(`/school/${orgId}`);
}

export async function joinOrganization(input: { code: string }) {
  const code = z.string().trim().min(4).max(12).parse(input.code);
  const { supabase } = await requireUserId();
  const { data: orgId, error } = await supabase.rpc("join_organization", { p_code: code });
  if (error) throw new Error(error.message);
  revalidatePath("/school");
  redirect(`/school/${orgId}`);
}

const CreateClassroomInput = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(1).max(120),
  gradeLevel: z.string().max(40).optional(),
});

export async function createClassroom(input: z.input<typeof CreateClassroomInput>) {
  const data = CreateClassroomInput.parse(input);
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("classrooms").insert({
    org_id: data.orgId,
    name: data.name,
    grade_level: data.gradeLevel ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/school/${data.orgId}`);
}

const SetOrgRoleInput = z.object({
  orgId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["owner", "admin", "teacher", "student"]),
});

export async function setOrgMemberRole(input: z.input<typeof SetOrgRoleInput>) {
  const data = SetOrgRoleInput.parse(input);
  const { supabase } = await requireUserId();
  const { error } = await supabase
    .from("org_members")
    .update({ role: data.role })
    .eq("org_id", data.orgId)
    .eq("user_id", data.userId);
  if (error) throw new Error(error.message);
  revalidatePath(`/school/${data.orgId}`);
}

const ClassroomMemberInput = z.object({
  classroomId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["teacher", "student"]).default("student"),
  orgId: z.string().uuid(),
});

export async function addClassroomMember(input: z.input<typeof ClassroomMemberInput>) {
  const data = ClassroomMemberInput.parse(input);
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("classroom_members").upsert(
    { classroom_id: data.classroomId, user_id: data.userId, role: data.role },
    { onConflict: "classroom_id,user_id" },
  );
  if (error) throw new Error(error.message);
  revalidatePath(`/school/${data.orgId}/classrooms/${data.classroomId}`);
}

export async function removeClassroomMember(input: z.input<typeof ClassroomMemberInput>) {
  const data = ClassroomMemberInput.parse(input);
  const { supabase } = await requireUserId();
  const { error } = await supabase
    .from("classroom_members")
    .delete()
    .eq("classroom_id", data.classroomId)
    .eq("user_id", data.userId);
  if (error) throw new Error(error.message);
  revalidatePath(`/school/${data.orgId}/classrooms/${data.classroomId}`);
}
