-- A classroom is a real teaching unit: it carries one or more courses, and
-- adding a course to a classroom auto-enrolls every student in it.

create table if not exists public.classroom_courses (
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz default now(),
  primary key (classroom_id, course_id)
);

create index if not exists idx_classroom_courses_course on public.classroom_courses (course_id);

alter table public.classroom_courses enable row level security;

-- Read: any member of the classroom's org.
create policy "classroom_courses read" on public.classroom_courses
  for select using (public.is_org_member(public.org_of_classroom(classroom_id)));

-- Manage: org admin, or the course's teacher (so a teacher can drop their own
-- course onto a classroom they were given access to without escalating to
-- school admin for every link).
create policy "classroom_courses manage" on public.classroom_courses
  for all using (
    public.is_org_admin(public.org_of_classroom(classroom_id))
    or auth.uid() = (select teacher_id from public.courses c where c.id = course_id)
  ) with check (
    public.is_org_admin(public.org_of_classroom(classroom_id))
    or auth.uid() = (select teacher_id from public.courses c where c.id = course_id)
  );

-- Convenience: enroll every current classroom student in a course (or pull all
-- of them out if you unassign). Idempotent.
create or replace function public.sync_classroom_course_enrollments(
  p_classroom uuid, p_course uuid
) returns int language plpgsql security definer set search_path = public as $$
declare v_added int;
begin
  with picked as (
    select cm.user_id
    from public.classroom_members cm
    where cm.classroom_id = p_classroom and cm.role = 'student'
  ), ins as (
    insert into public.enrollments (user_id, course_id, role)
    select user_id, p_course, 'student' from picked
    on conflict (user_id, course_id) do nothing
    returning 1
  )
  select count(*) into v_added from ins;
  return v_added;
end;
$$;

-- Symmetric helper: when a single student is added to a classroom, enroll
-- them in every course already attached to that classroom.
create or replace function public.sync_classroom_member_enrollments(
  p_classroom uuid, p_user uuid
) returns int language plpgsql security definer set search_path = public as $$
declare v_added int;
begin
  with ins as (
    insert into public.enrollments (user_id, course_id, role)
    select p_user, cc.course_id, 'student'
    from public.classroom_courses cc
    where cc.classroom_id = p_classroom
    on conflict (user_id, course_id) do nothing
    returning 1
  )
  select count(*) into v_added from ins;
  return v_added;
end;
$$;
