"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

// All gradebook mutations. RLS already restricts writes to the classroom's
// teacher, but we check membership up front for a clean error and to resolve the
// path to revalidate.
async function assertTeacher(classroomId: string) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data } = await supabase.rpc("is_classroom_teacher", { p_classroom: classroomId });
  if (!data) throw new Error("You don't teach this classroom");
  return supabase;
}

function gbPath(classroomId: string) {
  return `/teach/classrooms/${classroomId}/gradebook`;
}

export async function ensureGradebookSettings(classroomId: string) {
  const supabase = await assertTeacher(classroomId);
  await supabase.from("gradebook_settings").upsert({ classroom_id: classroomId }, { onConflict: "classroom_id" });
}

const SettingsInput = z.object({
  classroomId: z.string().uuid(),
  mode: z.enum(["points", "weighted"]).optional(),
  showClassAverage: z.boolean().optional(),
});
export async function updateGradebookSettings(input: z.infer<typeof SettingsInput>) {
  const { classroomId, mode, showClassAverage } = SettingsInput.parse(input);
  const supabase = await assertTeacher(classroomId);
  const patch: Record<string, unknown> = { classroom_id: classroomId, updated_at: new Date().toISOString() };
  if (mode) patch.mode = mode;
  if (typeof showClassAverage === "boolean") patch.show_class_average = showClassAverage;
  await supabase.from("gradebook_settings").upsert(patch, { onConflict: "classroom_id" });
  revalidatePath(gbPath(classroomId));
}

export async function addCategory(formData: FormData) {
  const classroomId = String(formData.get("classroomId"));
  const name = String(formData.get("name") ?? "").trim();
  const weight = Number(formData.get("weight") ?? 0) || 0;
  if (!name) return;
  const supabase = await assertTeacher(classroomId);
  const { count } = await supabase
    .from("grade_categories")
    .select("id", { count: "exact", head: true })
    .eq("classroom_id", classroomId);
  await supabase.from("grade_categories").insert({ classroom_id: classroomId, name, weight, position: (count ?? 0) + 1 });
  revalidatePath(gbPath(classroomId));
}

export async function deleteCategory(formData: FormData) {
  const classroomId = String(formData.get("classroomId"));
  const id = String(formData.get("id"));
  const supabase = await assertTeacher(classroomId);
  await supabase.from("grade_categories").delete().eq("id", id).eq("classroom_id", classroomId);
  revalidatePath(gbPath(classroomId));
}

export async function addItem(formData: FormData) {
  const classroomId = String(formData.get("classroomId"));
  const name = String(formData.get("name") ?? "").trim();
  const maxPoints = Number(formData.get("maxPoints") ?? 100) || 100;
  const weight = Number(formData.get("weight") ?? 0) || 0;
  const type = String(formData.get("type") ?? "manual");
  const categoryId = String(formData.get("categoryId") ?? "");
  const dueAt = String(formData.get("dueAt") ?? "");
  if (!name) return;
  const supabase = await assertTeacher(classroomId);
  const { count } = await supabase
    .from("grade_items")
    .select("id", { count: "exact", head: true })
    .eq("classroom_id", classroomId);
  await supabase.from("grade_items").insert({
    classroom_id: classroomId,
    name,
    max_points: maxPoints,
    weight,
    type: ["assignment", "quiz", "paper", "participation", "project", "manual"].includes(type) ? type : "manual",
    category_id: categoryId || null,
    due_at: dueAt ? new Date(dueAt).toISOString() : null,
    position: (count ?? 0) + 1,
  });
  revalidatePath(gbPath(classroomId));
}

export async function deleteItem(formData: FormData) {
  const classroomId = String(formData.get("classroomId"));
  const id = String(formData.get("id"));
  const supabase = await assertTeacher(classroomId);
  await supabase.from("grade_items").delete().eq("id", id).eq("classroom_id", classroomId);
  revalidatePath(gbPath(classroomId));
}

export async function toggleItemPublished(formData: FormData) {
  const classroomId = String(formData.get("classroomId"));
  const id = String(formData.get("id"));
  const published = String(formData.get("published")) === "true";
  const supabase = await assertTeacher(classroomId);
  await supabase.from("grade_items").update({ published }).eq("id", id).eq("classroom_id", classroomId);
  revalidatePath(gbPath(classroomId));
}

// Upsert a single grade. points="" clears the grade (back to ungraded).
const EntryInput = z.object({
  classroomId: z.string().uuid(),
  gradeItemId: z.string().uuid(),
  studentId: z.string().uuid(),
  points: z.number().nullable(),
  feedback: z.string().max(4000).optional(),
});
export async function setEntry(input: z.infer<typeof EntryInput>) {
  const { classroomId, gradeItemId, studentId, points, feedback } = EntryInput.parse(input);
  const supabase = await assertTeacher(classroomId);
  const { data: { user } } = await supabase.auth.getUser();
  if (points == null && !feedback) {
    // clearing the grade entirely
    await supabase.from("grade_entries").delete().eq("grade_item_id", gradeItemId).eq("student_id", studentId);
  } else {
    await supabase.from("grade_entries").upsert(
      {
        grade_item_id: gradeItemId,
        student_id: studentId,
        points,
        feedback_md: feedback ?? null,
        graded_by: user!.id,
        graded_at: new Date().toISOString(),
      },
      { onConflict: "grade_item_id,student_id" },
    );
  }
  revalidatePath(gbPath(classroomId));
  return { ok: true };
}
