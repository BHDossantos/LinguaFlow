import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { LessonComposer } from "./LessonComposer";

export const dynamic = "force-dynamic";

export default async function NewLessonPage({
  params,
}: {
  params: { courseId: string };
}) {
  const user = await requireUser();
  const supabase = supabaseServer();
  const { data: course } = await supabase
    .from("courses").select("id,title,teacher_id").eq("id", params.courseId).single();
  if (!course) notFound();
  if (course.teacher_id !== user.id) redirect("/teach");

  return (
    <div className="space-y-4">
      <Link href={`/teach/courses/${course.id}`} className="text-sm text-brand-500">
        ← {course.title}
      </Link>
      <h1 className="text-2xl font-bold">New lesson</h1>
      <LessonComposer courseId={course.id} />
    </div>
  );
}
