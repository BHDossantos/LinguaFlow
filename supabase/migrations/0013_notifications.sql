-- Cross-feature notifications: returned grades, classroom announcements,
-- and abnormal attendance (absent/late/excused) fanned out to guardians.
-- Inserts come from security-definer triggers so callers don't need elevated
-- privileges to notify other users.

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('grade_returned','announcement','attendance_alert')),
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user_recent
  on public.notifications (user_id, created_at desc);
create index if not exists idx_notifications_user_unread
  on public.notifications (user_id, created_at desc) where read_at is null;

alter table public.notifications enable row level security;

-- Only the recipient can read; only the recipient can update (mark read).
-- No insert policy — triggers (security definer) own that path.
create policy "notifications own read" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications own update" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== Trigger 1: teacher returns a grade =====
create or replace function public.notify_grade_returned() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_student uuid; v_title text; v_max int;
begin
  select s.student_id, a.title, a.max_score
    into v_student, v_title, v_max
  from public.submissions s
  join public.assignments a on a.id = s.assignment_id
  where s.id = new.submission_id;
  if v_student is null then return new; end if;
  insert into public.notifications (user_id, kind, title, body, link)
  values (
    v_student,
    'grade_returned',
    'Your work was graded',
    coalesce(v_title, 'Assignment') || ' — ' || coalesce(new.final_score::text, '?') || '/' || coalesce(v_max, 100),
    '/assignments'
  );
  return new;
end;
$$;

drop trigger if exists on_teacher_review_insert on public.teacher_reviews;
create trigger on_teacher_review_insert
  after insert on public.teacher_reviews
  for each row execute function public.notify_grade_returned();

-- ===== Trigger 2: classroom announcement =====
create or replace function public.notify_classroom_announcement() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_classroom_name text; v_link text;
begin
  select name into v_classroom_name from public.classrooms where id = new.classroom_id;
  v_link := '/';  -- the dashboard surfaces classroom announcements
  insert into public.notifications (user_id, kind, title, body, link)
  select distinct cm.user_id, 'announcement',
         coalesce(v_classroom_name, 'Classroom'),
         left(new.body, 200),
         v_link
  from public.classroom_members cm
  where cm.classroom_id = new.classroom_id
    and cm.user_id <> coalesce(new.posted_by, '00000000-0000-0000-0000-000000000000');
  return new;
end;
$$;

drop trigger if exists on_announcement_insert on public.announcements;
create trigger on_announcement_insert
  after insert on public.announcements
  for each row execute function public.notify_classroom_announcement();

-- ===== Trigger 3: abnormal attendance fanned out to guardians =====
create or replace function public.notify_attendance_alert() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_student_name text; v_classroom_name text;
begin
  if new.status not in ('absent','late','excused') then return new; end if;
  -- On UPDATE, only fire if the verdict actually changed.
  if tg_op = 'UPDATE' and old.status = new.status then return new; end if;
  select display_name into v_student_name from public.profiles where id = new.user_id;
  select c.name into v_classroom_name
    from public.class_meetings m
    join public.classrooms c on c.id = m.classroom_id
    where m.id = new.meeting_id;
  insert into public.notifications (user_id, kind, title, body, link)
  select g.guardian_id, 'attendance_alert',
         coalesce(v_student_name, 'Your student') || ' — ' || new.status,
         coalesce(v_classroom_name, 'Classroom'),
         '/parent/' || new.user_id
  from public.guardians g
  where g.student_id = new.user_id;
  return new;
end;
$$;

drop trigger if exists on_attendance_insert on public.attendance;
drop trigger if exists on_attendance_change on public.attendance;
create trigger on_attendance_change
  after insert or update on public.attendance
  for each row execute function public.notify_attendance_alert();
