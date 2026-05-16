\set ON_ERROR_STOP on
\echo '== 1. handle_new_user trigger =='
insert into auth.users (id, email, raw_user_meta_data)
values ('11111111-0000-0000-0000-000000000001', 'teacher@test.com', '{"display_name":"Teacher T"}'),
       ('11111111-0000-0000-0000-000000000002', 'student@test.com', '{"display_name":"Student S"}'),
       ('11111111-0000-0000-0000-000000000003', 'parent@test.com', '{"display_name":"Parent P"}');
select id, display_name from public.profiles order by display_name;

\echo '== 2. create_organization (as teacher) =='
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000001';
select public.create_organization('Test School', 'school', 'Italy') as org_id \gset
select id, name, invite_code, owner_id from public.organizations;
select role from public.org_members where org_id = :'org_id';

\echo '== 3. join_organization (as student) =='
select invite_code from public.organizations where id = :'org_id' \gset
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000002';
select public.join_organization(:'invite_code') as joined_org;
select count(*) as org_member_count from public.org_members where org_id = :'org_id';

\echo '== 4. RLS: student sees org (member) but not invite-code-less peek =='
select count(*) as orgs_visible_to_student from public.organizations;

\echo '== 5. is_org_admin checks =='
select public.is_org_admin(:'org_id') as student_is_admin;  -- expect false
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000001';
select public.is_org_admin(:'org_id') as teacher_is_admin;  -- expect true

\echo '== 6. classroom create + membership =='
insert into public.classrooms (org_id, name, grade_level) values (:'org_id', 'Grade 9A', '9') returning id as classroom_id \gset
insert into public.classroom_members (classroom_id, user_id, role)
values (:'classroom_id', '11111111-0000-0000-0000-000000000002', 'student');
select count(*) as classroom_members from public.classroom_members where classroom_id = :'classroom_id';

\echo '== 7. guardian link + is_guardian_of =='
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000002';
update public.profiles set guardian_invite_code = 'STU123' where id = auth.uid();
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000003';
insert into public.guardians (guardian_id, student_id)
values ('11111111-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002');
select public.is_guardian_of('11111111-0000-0000-0000-000000000002') as parent_is_guardian; -- true
select public.is_guardian_of('11111111-0000-0000-0000-000000000001') as parent_of_teacher;  -- false

\echo '== 8. submission + similarity function =='
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000002';
insert into public.submissions (assignment_id, student_id, text)
select id, auth.uid(), 'Photosynthesis converts light into glucose and oxygen.'
from public.assignments limit 1
returning id as sub_id \gset
insert into public.submissions (assignment_id, student_id, text)
select assignment_id, '11111111-0000-0000-0000-000000000001',
       'Photosynthesis converts light into glucose and oxygen too.'
from public.submissions where id = :'sub_id';
select * from public.max_submission_similarity(:'sub_id');

\echo '== 9. RLS isolation: student cannot read another students submission =='
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000002';
-- enable RLS enforcement for this role (table owner bypasses RLS otherwise)
set role lf_rls_test;
select count(*) as visible_submissions from public.submissions;
reset role;

\echo '== 10. classroom-course wiring auto-enrolls students =='
-- Take any seeded course; attach it to the classroom from step 6; the
-- student we put in that classroom must now be enrolled in the course.
select id as course_id from public.courses limit 1 \gset
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000001';
insert into public.classroom_courses (classroom_id, course_id, assigned_by)
values (:'classroom_id', :'course_id', auth.uid());
select public.sync_classroom_course_enrollments(:'classroom_id', :'course_id') as added_by_course_assign;
select count(*) as student_enrolled
from public.enrollments
where user_id = '11111111-0000-0000-0000-000000000002' and course_id = :'course_id';

-- Now add a brand-new student to the classroom and confirm the symmetric
-- sync auto-enrolls them in the already-attached course.
insert into auth.users (id, email, raw_user_meta_data)
values ('11111111-0000-0000-0000-000000000099', 'newstu@test.com', '{"display_name":"New Stu"}');
insert into public.classroom_members (classroom_id, user_id, role)
values (:'classroom_id', '11111111-0000-0000-0000-000000000099', 'student');
select public.sync_classroom_member_enrollments(:'classroom_id', '11111111-0000-0000-0000-000000000099') as added_by_member_join;
select count(*) as new_student_enrolled
from public.enrollments
where user_id = '11111111-0000-0000-0000-000000000099' and course_id = :'course_id';

\echo '== 11. scheduling + attendance =='
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000001';
insert into public.class_meetings (classroom_id, title, scheduled_at, duration_minutes, created_by)
values (:'classroom_id', 'Test meeting', now(), 45, auth.uid())
returning id as meeting_id \gset

-- Owner marks attendance for the original student.
insert into public.attendance (meeting_id, user_id, status, marked_by)
values (:'meeting_id', '11111111-0000-0000-0000-000000000002', 'present', auth.uid());

-- Parent (guardian) can read their student's attendance under RLS.
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000003';
set role lf_rls_test;
select count(*) as parent_can_see from public.attendance
  where user_id = '11111111-0000-0000-0000-000000000002';
reset role;

-- A random unrelated user cannot.
insert into auth.users (id, email) values ('11111111-0000-0000-0000-000000000088', 'rando@test.com');
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000088';
set role lf_rls_test;
select count(*) as stranger_can_see from public.attendance
  where user_id = '11111111-0000-0000-0000-000000000002';
reset role;

\echo '== 12. announcements visibility =='
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000001';
insert into public.announcements (classroom_id, body, posted_by)
values (:'classroom_id', 'Field trip Friday — bring lunch.', auth.uid());

-- Parent of a student in the classroom can read (via guardian policy).
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000003';
set role lf_rls_test;
select count(*) as parent_sees_announcement
  from public.announcements where classroom_id = :'classroom_id';
reset role;

-- Random user with no link to the classroom cannot.
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000088';
set role lf_rls_test;
select count(*) as stranger_sees_announcement
  from public.announcements where classroom_id = :'classroom_id';
reset role;

\echo '== 13. notification triggers fan out =='
-- grade_returned: teacher returns a grade on the student's submission.
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000001';
insert into public.teacher_reviews (submission_id, teacher_id, final_score, comments_md, approved_ai)
values (:'sub_id', auth.uid(), 88, 'Solid effort', true);
select count(*) as grade_notifications
  from public.notifications
  where user_id = '11111111-0000-0000-0000-000000000002' and kind = 'grade_returned';

-- announcement: should NOT notify the poster, should notify other classroom members.
set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000001';
insert into public.announcements (classroom_id, body, posted_by)
values (:'classroom_id', 'Pop quiz Monday', auth.uid());
select count(*) as student_announcement_notifs
  from public.notifications
  where user_id = '11111111-0000-0000-0000-000000000002' and kind = 'announcement';
select count(*) as poster_announcement_notifs
  from public.notifications
  where user_id = '11111111-0000-0000-0000-000000000001' and kind = 'announcement';

-- attendance_alert: marking a student absent notifies their guardian.
insert into public.attendance (meeting_id, user_id, status, marked_by)
values (:'meeting_id', '11111111-0000-0000-0000-000000000002', 'absent', auth.uid())
on conflict (meeting_id, user_id) do update set status = excluded.status, marked_at = now();
select count(*) as guardian_attendance_notifs
  from public.notifications
  where user_id = '11111111-0000-0000-0000-000000000003' and kind = 'attendance_alert';

\echo '== SMOKE TESTS PASSED =='
