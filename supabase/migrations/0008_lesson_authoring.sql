-- Lesson authoring: a course's teacher can create/edit/delete lessons in that
-- course. (0001 only granted public read on lessons.)

create policy "lessons teacher manage" on public.lessons
  for all using (
    auth.uid() = (select teacher_id from public.courses c where c.id = course_id)
  ) with check (
    auth.uid() = (select teacher_id from public.courses c where c.id = course_id)
  );
