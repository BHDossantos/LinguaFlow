-- Phase 4/5 backbone: schools (organizations), classrooms, and membership.
-- A platform user can belong to multiple organizations with different roles.

create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null default 'school' check (type in ('school','district','tutoring_center','homeschool')),
  country text,
  invite_code text unique not null,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.org_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'student' check (role in ('owner','admin','teacher','student')),
  created_at timestamptz default now(),
  primary key (org_id, user_id)
);

create index if not exists idx_org_members_user on public.org_members (user_id);

create table if not exists public.classrooms (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  grade_level text,
  homeroom_teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_classrooms_org on public.classrooms (org_id);

create table if not exists public.classroom_members (
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'student' check (role in ('teacher','student')),
  primary key (classroom_id, user_id)
);

create index if not exists idx_classroom_members_user on public.classroom_members (user_id);

-- Optional: tie a course to an organization (platform content stays null).
alter table public.courses
  add column if not exists org_id uuid references public.organizations(id) on delete set null;

-- ===== Helper functions (security definer to avoid RLS recursion) =====
create or replace function public.is_org_member(p_org uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(p_org uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org and m.user_id = auth.uid()
      and m.role in ('owner','admin')
  );
$$;

create or replace function public.org_of_classroom(p_classroom uuid)
returns uuid language sql security definer set search_path = public stable as $$
  select org_id from public.classrooms where id = p_classroom;
$$;

-- Create an organization and make the caller its owner, atomically.
create or replace function public.create_organization(p_name text, p_type text, p_country text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_code text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  loop
    v_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from public.organizations where invite_code = v_code);
  end loop;
  insert into public.organizations (name, type, country, invite_code, owner_id)
    values (p_name, coalesce(p_type,'school'), p_country, v_code, auth.uid())
    returning id into v_org;
  insert into public.org_members (org_id, user_id, role)
    values (v_org, auth.uid(), 'owner');
  return v_org;
end;
$$;

-- Join an organization by its invite code (joins as 'student' by default).
create or replace function public.join_organization(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into v_org from public.organizations where invite_code = upper(trim(p_code));
  if v_org is null then raise exception 'invalid invite code'; end if;
  insert into public.org_members (org_id, user_id, role)
    values (v_org, auth.uid(), 'student')
    on conflict (org_id, user_id) do nothing;
  return v_org;
end;
$$;

-- ===== RLS =====
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.classrooms enable row level security;
alter table public.classroom_members enable row level security;

-- organizations: members read; admins update. (Insert is via create_organization.)
create policy "org members read" on public.organizations
  for select using (public.is_org_member(id));
create policy "org admins update" on public.organizations
  for update using (public.is_org_admin(id)) with check (public.is_org_admin(id));

-- org_members: members see the roster; admins manage it.
create policy "org roster read" on public.org_members
  for select using (public.is_org_member(org_id));
create policy "org admins manage roster" on public.org_members
  for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

-- classrooms: org members read; org admins manage.
create policy "classroom org read" on public.classrooms
  for select using (public.is_org_member(org_id));
create policy "classroom org admin manage" on public.classrooms
  for all using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

-- classroom_members: anyone in the org reads; org admins manage.
create policy "classroom members read" on public.classroom_members
  for select using (public.is_org_member(public.org_of_classroom(classroom_id)));
create policy "classroom members manage" on public.classroom_members
  for all using (public.is_org_admin(public.org_of_classroom(classroom_id)))
  with check (public.is_org_admin(public.org_of_classroom(classroom_id)));
