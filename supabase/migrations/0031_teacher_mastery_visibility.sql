-- Let classroom teachers READ their own students' mastery data (spec §14:
-- mastery map, misconceptions, at-risk learners). Read-only; teachers never
-- write a student's skill state. Students keep full control of their own rows.
--
-- Uses a SECURITY DEFINER helper so the policy check doesn't recurse through
-- classroom_members' own RLS (the standard Supabase pattern).

create or replace function public.teaches_student(student uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from classroom_members tm
    join classroom_members sm on sm.classroom_id = tm.classroom_id
    where tm.user_id = auth.uid() and tm.role = 'teacher'
      and sm.user_id = student and sm.role = 'student'
  );
$$;

revoke all on function public.teaches_student(uuid) from public;
grant execute on function public.teaches_student(uuid) to authenticated;

-- Additive SELECT policies (permissive → OR'd with the existing "own" policy).
drop policy if exists "teachers read student skill_states" on public.skill_states;
create policy "teachers read student skill_states" on public.skill_states
  for select using (public.teaches_student(user_id));

drop policy if exists "teachers read student mastery_events" on public.mastery_events;
create policy "teachers read student mastery_events" on public.mastery_events
  for select using (public.teaches_student(user_id));

drop policy if exists "teachers read student misconceptions" on public.misconceptions;
create policy "teachers read student misconceptions" on public.misconceptions
  for select using (public.teaches_student(user_id));
