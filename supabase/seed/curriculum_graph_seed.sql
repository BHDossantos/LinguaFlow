-- Curriculum Engine seed: sources, standards frameworks, descriptors, and
-- the alignment of existing courses to them. Idempotent (on conflict do
-- nothing / guarded updates).

-- ---- Sources ----
insert into public.curriculum_sources (id, name, url, license, kind) values
  ('mit_ocw','MIT OpenCourseWare','https://ocw.mit.edu','CC BY-NC-SA 4.0','open_courseware'),
  ('openstax','OpenStax','https://openstax.org','CC BY 4.0','open_textbook'),
  ('ck12','CK-12 Foundation','https://www.ck12.org','CC BY-NC 3.0','open_textbook'),
  ('oer_commons','OER Commons','https://www.oercommons.org','Various CC','open_textbook'),
  ('cefr','Common European Framework of Reference','https://www.coe.int/en/web/common-european-framework-reference-languages','Council of Europe','framework'),
  ('common_core','Common Core State Standards','https://www.thecorestandards.org','Public','standard'),
  ('acm','ACM Computing Curricula','https://www.acm.org/education/curricula-recommendations','ACM','standard')
on conflict (id) do nothing;

-- ---- Frameworks ----
insert into public.standards (id, organization, framework, version, url) values
  ('cefr','Council of Europe','CEFR','Companion Volume 2020','https://www.coe.int/en/web/common-european-framework-reference-languages'),
  ('common_core_math','Common Core State Standards Initiative','Common Core Mathematics','2010','https://www.thecorestandards.org/Math/'),
  ('acm_cs','ACM','Computing Curricula','CS2023','https://www.acm.org/education/curricula-recommendations')
on conflict (id) do nothing;

-- ---- CEFR descriptors: 5 activities × A1..C1 ----
insert into public.standard_descriptors (id, standard_id, code, description, level) values
  ('cefr.a1.listen','cefr','A1 Listening','Can recognise familiar words and very basic phrases about themselves, family, and immediate surroundings when people speak slowly.','A1'),
  ('cefr.a1.read','cefr','A1 Reading','Can understand familiar names, words, and very simple sentences, for example on notices and posters.','A1'),
  ('cefr.a1.spoken_interaction','cefr','A1 Spoken interaction','Can introduce themselves and ask and answer simple questions about personal details.','A1'),
  ('cefr.a1.spoken_production','cefr','A1 Spoken production','Can use simple phrases and sentences to describe where they live and people they know.','A1'),
  ('cefr.a1.write','cefr','A1 Writing','Can write a short, simple postcard and fill in forms with personal details.','A1'),
  ('cefr.a2.listen','cefr','A2 Listening','Can understand phrases and high-frequency vocabulary related to areas of most immediate personal relevance.','A2'),
  ('cefr.a2.read','cefr','A2 Reading','Can read short, simple texts and find specific information in everyday material like menus and timetables.','A2'),
  ('cefr.a2.spoken_interaction','cefr','A2 Spoken interaction','Can communicate in simple routine tasks requiring a direct exchange of information on familiar topics.','A2'),
  ('cefr.a2.spoken_production','cefr','A2 Spoken production','Can use a series of phrases to describe family, living conditions, and their job in simple terms.','A2'),
  ('cefr.a2.write','cefr','A2 Writing','Can write short, simple notes and messages and a very simple personal letter.','A2'),
  ('cefr.b1.listen','cefr','B1 Listening','Can understand the main points of clear standard speech on familiar matters regularly encountered.','B1'),
  ('cefr.b1.read','cefr','B1 Reading','Can understand texts that consist mainly of high-frequency everyday or job-related language.','B1'),
  ('cefr.b1.spoken_interaction','cefr','B1 Spoken interaction','Can deal with most situations likely to arise while travelling and enter unprepared into conversation on familiar topics.','B1'),
  ('cefr.b1.spoken_production','cefr','B1 Spoken production','Can connect phrases to describe experiences, ambitions, and give brief reasons for opinions and plans.','B1'),
  ('cefr.b1.write','cefr','B1 Writing','Can write simple connected text on topics which are familiar or of personal interest.','B1'),
  ('cefr.b2.listen','cefr','B2 Listening','Can understand extended speech and lectures and follow complex lines of argument on familiar topics.','B2'),
  ('cefr.b2.read','cefr','B2 Reading','Can read articles and reports on contemporary problems in which writers adopt particular stances.','B2'),
  ('cefr.b2.spoken_interaction','cefr','B2 Spoken interaction','Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers possible.','B2'),
  ('cefr.b2.spoken_production','cefr','B2 Spoken production','Can present clear, detailed descriptions on a wide range of subjects and explain a viewpoint.','B2'),
  ('cefr.b2.write','cefr','B2 Writing','Can write clear, detailed text on a wide range of subjects and essays passing on information or arguments.','B2'),
  ('cefr.c1.listen','cefr','C1 Listening','Can understand extended speech even when it is not clearly structured and relationships are only implied.','C1'),
  ('cefr.c1.read','cefr','C1 Reading','Can understand long and complex factual and literary texts, appreciating distinctions of style.','C1'),
  ('cefr.c1.spoken_interaction','cefr','C1 Spoken interaction','Can express ideas fluently and spontaneously and use language flexibly for social and professional purposes.','C1'),
  ('cefr.c1.spoken_production','cefr','C1 Spoken production','Can present clear, detailed descriptions of complex subjects, developing particular points and rounding off with an appropriate conclusion.','C1'),
  ('cefr.c1.write','cefr','C1 Writing','Can express themselves in clear, well-structured text, expressing points of view at some length.','C1')
on conflict (id) do nothing;

-- ---- Common Core mathematics domains ----
insert into public.standard_descriptors (id, standard_id, code, description, level) values
  ('ccss.math.nbt','common_core_math','NBT','Number and Operations in Base Ten — place value, arithmetic with whole numbers and decimals.','K-5'),
  ('ccss.math.nf','common_core_math','NF','Number and Operations — Fractions — equivalence, ordering, and operations with fractions.','3-5'),
  ('ccss.math.rp','common_core_math','RP','Ratios and Proportional Relationships — ratios, rates, and percent.','6-7'),
  ('ccss.math.ee','common_core_math','EE','Expressions and Equations — variables, linear equations and inequalities, exponents.','6-8'),
  ('ccss.math.f','common_core_math','F','Functions — define, evaluate, compare, and model with functions.','8-HS'),
  ('ccss.math.g','common_core_math','G','Geometry — congruence, similarity, right triangles, circles, area and volume.','K-HS'),
  ('ccss.math.sp','common_core_math','SP','Statistics and Probability — summarising data, distributions, and inference.','6-HS')
on conflict (id) do nothing;

-- ---- ACM computing knowledge areas ----
insert into public.standard_descriptors (id, standard_id, code, description, level) values
  ('acm.pf','acm_cs','PF','Programming Fundamentals — variables, control structures, functions, data types.','Foundational'),
  ('acm.al','acm_cs','AL','Algorithms and Complexity — algorithm design, searching, sorting, Big-O analysis.','Foundational'),
  ('acm.se','acm_cs','SE','Software Engineering — decomposition, testing, debugging, project practices.','Foundational'),
  ('acm.dm','acm_cs','DM','Data Management — data structures, storage, and retrieval.','Foundational'),
  ('acm.sec','acm_cs','SEC','Security — safe computing, authentication, and threat awareness.','Foundational')
on conflict (id) do nothing;

-- ---- Alignment: every language course → its CEFR level's 5 descriptors ----
-- (Covers all aaaa* courses AND the starter-pack A1 courses automatically.)
insert into public.course_standards (course_id, descriptor_id)
select c.id, d.id
from public.courses c
join public.standard_descriptors d
  on d.standard_id = 'cefr' and d.level = c.cefr_level
where c.school = 'language' and c.cefr_level is not null
on conflict do nothing;

-- ---- Alignment: math courses → Common Core domains ----
insert into public.course_standards (course_id, descriptor_id) values
  ('bbbb0001-0000-4000-8000-000000000001','ccss.math.nbt'),
  ('bbbb0001-0000-4000-8000-000000000001','ccss.math.nf'),
  ('bbbb0001-0000-4000-8000-000000000001','ccss.math.rp'),
  ('bbbb0001-0000-4000-8000-000000000002','ccss.math.ee'),
  ('bbbb0001-0000-4000-8000-000000000002','ccss.math.rp'),
  ('bbbb0001-0000-4000-8000-000000000002','ccss.math.sp'),
  ('bbbb0001-0000-4000-8000-000000000003','ccss.math.ee'),
  ('bbbb0001-0000-4000-8000-000000000003','ccss.math.f'),
  ('bbbb0001-0000-4000-8000-000000000004','ccss.math.g'),
  ('bbbb0001-0000-4000-8000-000000000005','ccss.math.sp')
on conflict do nothing;

-- ---- Alignment: technology courses → ACM knowledge areas ----
insert into public.course_standards (course_id, descriptor_id) values
  ('bbbb0002-0000-4000-8000-000000000002','acm.pf'),
  ('bbbb0002-0000-4000-8000-000000000003','acm.pf'),
  ('bbbb0002-0000-4000-8000-000000000003','acm.se'),
  ('bbbb0002-0000-4000-8000-000000000004','acm.al'),
  ('bbbb0002-0000-4000-8000-000000000004','acm.pf'),
  ('bbbb0002-0000-4000-8000-000000000004','acm.se'),
  ('bbbb0002-0000-4000-8000-000000000001','acm.sec')
on conflict do nothing;

-- ---- Provenance on the source-structured courses ----
update public.courses set source_id = 'ck12'     where id = 'bbbb0001-0000-4000-8000-000000000004' and source_id is null;
update public.courses set source_id = 'openstax' where id = 'bbbb0001-0000-4000-8000-000000000005' and source_id is null;
update public.courses set source_id = 'openstax' where id = 'bbbb0003-0000-4000-8000-000000000001' and source_id is null;
update public.courses set source_id = 'openstax' where id = 'bbbb0004-0000-4000-8000-000000000001' and source_id is null;
update public.courses set source_id = 'mit_ocw'  where id = 'bbbb0002-0000-4000-8000-000000000004' and source_id is null;
update public.courses set source_id = 'openstax' where id = 'bbbb0004-0000-4000-8000-000000000002' and source_id is null;
update public.courses set source_id = 'openstax' where id = 'bbbb0003-0000-4000-8000-000000000002' and source_id is null;
update public.courses set source_id = 'openstax' where id in (
  'bbbb0004-0000-4000-8000-000000000003','bbbb0004-0000-4000-8000-000000000004',
  'bbbb0004-0000-4000-8000-000000000005','bbbb0003-0000-4000-8000-000000000003',
  'bbbb0001-0000-4000-8000-000000000006') and source_id is null;
-- Precalculus → Common Core Functions; Physics/Chemistry/etc are science (no CC math map)
insert into public.course_standards (course_id, descriptor_id) values
  ('bbbb0001-0000-4000-8000-000000000006','ccss.math.f'),
  ('bbbb0001-0000-4000-8000-000000000006','ccss.math.ee')
on conflict do nothing;
update public.courses set source_id='mit_ocw'  where id='bbbb0002-0000-4000-8000-000000000005' and source_id is null;
update public.courses set source_id='openstax' where id in ('bbbb0004-0000-4000-8000-000000000006','bbbb0004-0000-4000-8000-000000000007','bbbb0004-0000-4000-8000-000000000009') and source_id is null;
update public.courses set source_id='ck12'     where id='bbbb0004-0000-4000-8000-000000000008' and source_id is null;
insert into public.course_standards (course_id, descriptor_id) values
  ('bbbb0002-0000-4000-8000-000000000005','acm.al'),
  ('bbbb0002-0000-4000-8000-000000000005','acm.dm')
on conflict do nothing;
update public.courses set source_id='acm'      where id in ('bbbb0002-0000-4000-8000-000000000006','bbbb0002-0000-4000-8000-000000000007') and source_id is null;
update public.courses set source_id='openstax' where id in ('bbbb0003-0000-4000-8000-000000000004','bbbb0003-0000-4000-8000-000000000005','bbbb0001-0000-4000-8000-000000000007') and source_id is null;
insert into public.course_standards (course_id, descriptor_id) values
  ('bbbb0002-0000-4000-8000-000000000006','acm.sec'),
  ('bbbb0002-0000-4000-8000-000000000007','acm.se'),
  ('bbbb0002-0000-4000-8000-000000000007','acm.dm'),
  ('bbbb0001-0000-4000-8000-000000000007','ccss.math.f')
on conflict do nothing;
update public.courses set source_id='openstax'    where id in ('bbbb0003-0000-4000-8000-000000000006','bbbb0004-0000-4000-8000-00000000000a','bbbb0004-0000-4000-8000-00000000000b') and source_id is null;
update public.courses set source_id='acm'         where id='bbbb0002-0000-4000-8000-000000000008' and source_id is null;
update public.courses set source_id='oer_commons' where id='bbbb0003-0000-4000-8000-000000000007' and source_id is null;
insert into public.course_standards (course_id, descriptor_id) values
  ('bbbb0002-0000-4000-8000-000000000008','acm.dm')
on conflict do nothing;
update public.courses set source_id='openstax' where id in ('bbbb0004-0000-4000-8000-00000000000c','bbbb0003-0000-4000-8000-000000000008','bbbb0004-0000-4000-8000-00000000000d','bbbb0004-0000-4000-8000-00000000000e') and source_id is null;
update public.courses set source_id='acm'      where id='bbbb0002-0000-4000-8000-000000000009' and source_id is null;
insert into public.course_standards (course_id, descriptor_id) values
  ('bbbb0002-0000-4000-8000-000000000009','acm.se')
on conflict do nothing;

-- ---- Certification sources (batch 7) ----
insert into public.curriculum_sources (id, name, url, license, kind) values
  ('comptia','CompTIA (published exam objectives)','https://www.comptia.org/certifications','Objectives referenced; content original','certification'),
  ('aws','AWS Certification (published domains)','https://aws.amazon.com/certification/','Domains referenced; content original','certification'),
  ('pmi','PMI — Project Management Institute','https://www.pmi.org/certifications','Outline referenced; content original','certification'),
  ('google_career','Google Career Certificates','https://grow.google/certificates/','Topics referenced; content original','certification')
on conflict (id) do nothing;
update public.courses set source_id='comptia' where id in ('bbbb0002-0000-4000-8000-00000000000a','bbbb0002-0000-4000-8000-00000000000c') and source_id is null;
update public.courses set source_id='aws'     where id='bbbb0002-0000-4000-8000-00000000000b' and source_id is null;
update public.courses set source_id='pmi'     where id='bbbb0003-0000-4000-8000-000000000009' and source_id is null;
update public.courses set source_id='google_career' where id='bbbb0003-0000-4000-8000-00000000000a' and source_id is null;
insert into public.course_standards (course_id, descriptor_id) values
  ('bbbb0002-0000-4000-8000-00000000000a','acm.sec'),
  ('bbbb0002-0000-4000-8000-00000000000b','acm.se'),
  ('bbbb0003-0000-4000-8000-00000000000a','acm.dm')
on conflict do nothing;
update public.courses set source_id='openstax'    where id in ('bbbb0001-0000-4000-8000-000000000008','bbbb0004-0000-4000-8000-00000000000f','bbbb0004-0000-4000-8000-000000000011') and source_id is null;
update public.courses set source_id='oer_commons' where id in ('bbbb0002-0000-4000-8000-00000000000d','bbbb0004-0000-4000-8000-000000000010') and source_id is null;
insert into public.course_standards (course_id, descriptor_id) values
  ('bbbb0001-0000-4000-8000-000000000008','ccss.math.f'),
  ('bbbb0001-0000-4000-8000-000000000008','ccss.math.g')
on conflict do nothing;
update public.courses set source_id='openstax'    where id='bbbb0001-0000-4000-8000-000000000009' and source_id is null;
update public.courses set source_id='acm'         where id='bbbb0002-0000-4000-8000-00000000000e' and source_id is null;
update public.courses set source_id='oer_commons' where id in ('bbbb0004-0000-4000-8000-000000000012','bbbb0004-0000-4000-8000-000000000013','bbbb0004-0000-4000-8000-000000000014') and source_id is null;
insert into public.course_standards (course_id, descriptor_id) values
  ('bbbb0001-0000-4000-8000-000000000009','ccss.math.sp'),
  ('bbbb0002-0000-4000-8000-00000000000e','acm.al')
on conflict do nothing;
update public.courses set source_id='openstax'      where id in ('bbbb0004-0000-4000-8000-000000000015','bbbb0004-0000-4000-8000-000000000016') and source_id is null;
update public.courses set source_id='google_career' where id in ('bbbb0002-0000-4000-8000-00000000000f','bbbb0003-0000-4000-8000-00000000000b') and source_id is null;
update public.courses set source_id='oer_commons'   where id='bbbb0004-0000-4000-8000-000000000017' and source_id is null;
update public.courses set source_id='openstax' where id in ('bbbb0004-0000-4000-8000-000000000018','bbbb0004-0000-4000-8000-000000000019') and source_id is null;
update public.courses set source_id='ck12'     where id='bbbb0004-0000-4000-8000-00000000001a' and source_id is null;
update public.courses set source_id='oer_commons' where id in ('bbbb0003-0000-4000-8000-00000000000c','bbbb0003-0000-4000-8000-00000000000d','bbbb0004-0000-4000-8000-00000000001d') and source_id is null;
update public.courses set source_id='openstax'    where id in ('bbbb0004-0000-4000-8000-00000000001b','bbbb0001-0000-4000-8000-00000000000a','bbbb0004-0000-4000-8000-00000000001c') and source_id is null;
insert into public.course_standards (course_id, descriptor_id)
select c.id, d.id from public.courses c join public.standard_descriptors d on d.standard_id='cefr' and d.level=c.cefr_level where c.school='language' and c.cefr_level is not null on conflict do nothing;
update public.courses set source_id='mit_ocw'     where id='bbbb0001-0000-4000-8000-00000000000b' and source_id is null;
update public.courses set source_id='acm'         where id='bbbb0002-0000-4000-8000-000000000010' and source_id is null;
update public.courses set source_id='oer_commons' where id in ('bbbb0003-0000-4000-8000-00000000000e','bbbb0004-0000-4000-8000-00000000001e','bbbb0004-0000-4000-8000-00000000001f') and source_id is null;
insert into public.course_standards (course_id, descriptor_id) values ('bbbb0002-0000-4000-8000-000000000010','acm.se') on conflict do nothing;
update public.courses set source_id='mit_ocw'     where id='bbbb0001-0000-4000-8000-00000000000c' and source_id is null;
update public.courses set source_id='openstax'    where id='bbbb0004-0000-4000-8000-000000000020' and source_id is null;
update public.courses set source_id='oer_commons' where id in ('bbbb0002-0000-4000-8000-000000000011','bbbb0003-0000-4000-8000-00000000000f') and source_id is null;
insert into public.course_standards (course_id, descriptor_id)
select c.id, d.id from public.courses c join public.standard_descriptors d on d.standard_id='cefr' and d.level=c.cefr_level where c.school='language' and c.cefr_level is not null on conflict do nothing;
update public.courses set source_id='acm'         where id='bbbb0002-0000-4000-8000-000000000013' and source_id is null;
update public.courses set source_id='oer_commons' where id in ('bbbb0003-0000-4000-8000-000000000010','bbbb0004-0000-4000-8000-000000000021') and source_id is null;
update public.courses set source_id='openstax'    where id='bbbb0004-0000-4000-8000-000000000022' and source_id is null;
insert into public.course_standards (course_id, descriptor_id)
select c.id, d.id from public.courses c join public.standard_descriptors d on d.standard_id='cefr' and d.level=c.cefr_level where c.school='language' and c.cefr_level is not null on conflict do nothing;
update public.courses set source_id='acm'         where id='bbbb0002-0000-4000-8000-000000000014' and source_id is null;
update public.courses set source_id='oer_commons' where id in ('bbbb0003-0000-4000-8000-000000000011','bbbb0004-0000-4000-8000-000000000024') and source_id is null;
update public.courses set source_id='ck12'        where id='bbbb0004-0000-4000-8000-000000000023' and source_id is null;
insert into public.course_standards (course_id, descriptor_id) values ('bbbb0002-0000-4000-8000-000000000014','acm.sec') on conflict do nothing;
insert into public.course_standards (course_id, descriptor_id)
select c.id, d.id from public.courses c join public.standard_descriptors d on d.standard_id='cefr' and d.level=c.cefr_level where c.school='language' and c.cefr_level is not null on conflict do nothing;
update public.courses set source_id='openstax'    where id='bbbb0003-0000-4000-8000-000000000012' and source_id is null;
update public.courses set source_id='mit_ocw'     where id='bbbb0002-0000-4000-8000-000000000015' and source_id is null;
update public.courses set source_id='oer_commons' where id='bbbb0004-0000-4000-8000-000000000025' and source_id is null;
insert into public.course_standards (course_id, descriptor_id)
select c.id, d.id from public.courses c join public.standard_descriptors d on d.standard_id='cefr' and d.level=c.cefr_level where c.school='language' and c.cefr_level is not null on conflict do nothing;
-- ---- provenance (batch 18) ----
update public.courses set source_id='openstax' where id in ('bbbb0001-0000-4000-8000-00000000000d','bbbb0003-0000-4000-8000-000000000013','bbbb0004-0000-4000-8000-000000000026') and source_id is null;
update public.courses set source_id='mit_ocw'  where id in ('bbbb0001-0000-4000-8000-00000000000e','bbbb0002-0000-4000-8000-000000000016') and source_id is null;
-- ---- provenance (batch 19) ----
update public.courses set source_id='openstax'    where id in ('bbbb0001-0000-4000-8000-00000000000f','bbbb0003-0000-4000-8000-000000000014','bbbb0004-0000-4000-8000-000000000027') and source_id is null;
update public.courses set source_id='mit_ocw'     where id='bbbb0001-0000-4000-8000-000000000010' and source_id is null;
update public.courses set source_id='oer_commons' where id='bbbb0002-0000-4000-8000-000000000017' and source_id is null;
-- ---- provenance + CEFR alignment (batch 20: German B1/B2/C1/Business) ----
update public.courses set source_id='oer_commons' where id in ('aaaa0006-0000-4000-8000-000000000003','aaaa0006-0000-4000-8000-000000000004','aaaa0006-0000-4000-8000-000000000005','aaaa0006-0000-4000-8000-000000000006') and source_id is null;
insert into public.course_standards (course_id, descriptor_id)
select c.id, d.id from public.courses c join public.standard_descriptors d on d.standard_id='cefr' and d.level=c.cefr_level where c.school='language' and c.cefr_level is not null on conflict do nothing;
