-- Scheduling + attendance: classrooms get a real timetable, teachers take
-- daily attendance, parents see it.

create table if not exists public.class_meetings (
  id uuid primary key default uuid_generate_v4(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  title text,
  location text,
  scheduled_at timestamptz not null,
  duration_minutes int not null default 60,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_meetings_classroom_time
  on public.class_meetings (classroom_id, scheduled_at);

create table if not exists public.attendance (
  meeting_id uuid not null references public.class_meetings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('present','absent','late','excused')),
  note text,
  marked_by uuid references public.profiles(id) on delete set null,
  marked_at timestamptz default now(),
  primary key (meeting_id, user_id)
);

create index if not exists idx_attendance_user on public.attendance (user_id);

-- ===== Helpers =====
create or replace function public.is_classroom_teacher(p_classroom uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.classroom_members cm
    where cm.classroom_id = p_classroom
      and cm.user_id = auth.uid()
      and cm.role = 'teacher'
  );
$$;

create or replace function public.classroom_of_meeting(p_meeting uuid)
returns uuid language sql security definer set search_path = public stable as $$
  select classroom_id from public.class_meetings where id = p_meeting;
$$;

-- ===== RLS =====
alter table public.class_meetings enable row level security;
alter table public.attendance enable row level security;

-- Meetings: any org member reads; org admins or classroom teachers manage.
create policy "meetings org read" on public.class_meetings
  for select using (public.is_org_member(public.org_of_classroom(classroom_id)));
create policy "meetings teacher manage" on public.class_meetings
  for all using (
    public.is_org_admin(public.org_of_classroom(classroom_id))
    or public.is_classroom_teacher(classroom_id)
  ) with check (
    public.is_org_admin(public.org_of_classroom(classroom_id))
    or public.is_classroom_teacher(classroom_id)
  );

-- Attendance reads: the student themself, their linked guardian, any teacher/
-- admin who can manage the meeting, or another org member viewing the
-- aggregate (org-wide visibility is acceptable here; tighten later if needed).
create policy "attendance read" on public.attendance
  for select using (
    auth.uid() = user_id
    or public.is_guardian_of(user_id)
    or public.is_org_admin(public.org_of_classroom(public.classroom_of_meeting(meeting_id)))
    or public.is_classroom_teacher(public.classroom_of_meeting(meeting_id))
  );

create policy "attendance manage" on public.attendance
  for all using (
    public.is_org_admin(public.org_of_classroom(public.classroom_of_meeting(meeting_id)))
    or public.is_classroom_teacher(public.classroom_of_meeting(meeting_id))
  ) with check (
    public.is_org_admin(public.org_of_classroom(public.classroom_of_meeting(meeting_id)))
    or public.is_classroom_teacher(public.classroom_of_meeting(meeting_id))
  );
