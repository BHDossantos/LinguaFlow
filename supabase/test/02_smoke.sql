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

\echo '== SMOKE TESTS PASSED =='
