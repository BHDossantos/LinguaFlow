-- Classroom announcements: a lightweight comms thread visible to org members
-- (students, teachers, admins) and to the linked guardians of any student in
-- the classroom.

create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  body text not null,
  pinned boolean not null default false,
  posted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_announcements_classroom_time
  on public.announcements (classroom_id, created_at desc);

-- Helper: am I a guardian of any student currently in this classroom?
create or replace function public.is_guardian_of_classroom_member(p_classroom uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1
    from public.classroom_members cm
    join public.guardians g on g.student_id = cm.user_id
    where cm.classroom_id = p_classroom
      and g.guardian_id = auth.uid()
  );
$$;

alter table public.announcements enable row level security;

create policy "announcements read" on public.announcements
  for select using (
    public.is_org_member(public.org_of_classroom(classroom_id))
    or public.is_guardian_of_classroom_member(classroom_id)
  );

create policy "announcements manage" on public.announcements
  for all using (
    public.is_org_admin(public.org_of_classroom(classroom_id))
    or public.is_classroom_teacher(classroom_id)
  ) with check (
    public.is_org_admin(public.org_of_classroom(classroom_id))
    or public.is_classroom_teacher(classroom_id)
  );

-- Guardians also need to see which classrooms their student is in so we can
-- pull announcements for those classrooms in the parent dashboard.
create policy "classroom members guardian read" on public.classroom_members
  for select using (public.is_guardian_of(user_id));
