-- Project-based learning + portfolio (spec §9). Learners build/perform something
-- real; submissions become portfolio evidence of applied skill.

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete set null,
  school text check (school in ('language','math','technology','business','science')),
  title text not null,
  brief text not null,
  deliverables text[] not null default '{}',
  rubric text[] not null default '{}',
  difficulty text default 'intermediate' check (difficulty in ('beginner','intermediate','advanced')),
  estimated_hours int,
  published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.projects enable row level security;
drop policy if exists "read published projects" on public.projects;
create policy "read published projects" on public.projects
  for select using (published = true or created_by = auth.uid());
drop policy if exists "authors manage projects" on public.projects;
create policy "authors manage projects" on public.projects
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());

create table if not exists public.project_submissions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  url text,
  notes text,
  status text not null default 'submitted' check (status in ('draft','submitted','reviewed')),
  score int,
  feedback text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);
alter table public.project_submissions enable row level security;
drop policy if exists "own submissions" on public.project_submissions;
create policy "own submissions" on public.project_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Teachers may read their students' submissions (reuse the mastery helper).
drop policy if exists "teachers read student submissions" on public.project_submissions;
create policy "teachers read student submissions" on public.project_submissions
  for select using (public.teaches_student(user_id));
create index if not exists project_submissions_user_idx
  on public.project_submissions (user_id, submitted_at desc);

-- ---- Starter platform projects (idempotent) ----
insert into public.projects (id, school, title, brief, deliverables, rubric, difficulty, estimated_hours) values
  ('cccc0001-0000-4000-8000-000000000001','technology','Build your portfolio website',
   'Design and ship a personal portfolio site that presents who you are and your work. Deploy it to a public URL.',
   array['A live, public URL','Responsive layout (mobile + desktop)','An About section and at least 3 projects'],
   array['Clarity of content','Visual design & responsiveness','Code quality','It actually loads and works'],
   'beginner', 8),
  ('cccc0001-0000-4000-8000-000000000002','technology','Build a REST API for a to-do app',
   'Design and build a small backend API (create/read/update/delete tasks) with input validation and clear endpoints.',
   array['Documented endpoints','Working CRUD','Basic validation & error handling','A short README'],
   array['API design (REST)','Correctness of CRUD','Validation & errors','Documentation'],
   'intermediate', 12),
  ('cccc0001-0000-4000-8000-000000000003','technology','Containerize & deploy a small app',
   'Take a simple app, write a Dockerfile, run it locally in a container, and deploy it somewhere public.',
   array['A working Dockerfile','A running container','A public deployment URL','Notes on what you learned'],
   array['Dockerfile correctness','Image efficiency','Successful deployment','Reflection'],
   'intermediate', 10),
  ('cccc0002-0000-4000-8000-000000000001','business','Three-year startup financial model',
   'Build a simple 3-year financial model (revenue, costs, cash) for a startup idea, with clearly stated assumptions.',
   array['A spreadsheet model','Stated assumptions','Revenue, cost & cash projections','A one-paragraph interpretation'],
   array['Reasonable assumptions','Model correctness','Clarity of layout','Insight from the numbers'],
   'intermediate', 10),
  ('cccc0002-0000-4000-8000-000000000002','business','Market-entry strategy memo',
   'Pick a company and a new market. Write a strategy memo recommending whether and how to enter, using a real framework.',
   array['A 1-2 page memo','External analysis (e.g. Five Forces)','A clear recommendation','Key risks & next steps'],
   array['Use of framework','Depth of analysis','Clarity of recommendation','Risk awareness'],
   'advanced', 8),
  ('cccc0004-0000-4000-8000-000000000001','science','Design a small experiment',
   'Design a simple, safe experiment to test a hypothesis. Run it (or simulate it), record data, and write it up.',
   array['A stated hypothesis','Method & variables','Recorded data (table/chart)','Conclusion tied to the data'],
   array['Hypothesis quality','Sound method & controls','Data handling','Valid conclusion'],
   'beginner', 6),
  ('cccc0001-0000-4000-8000-000000000004','math','Model & present an optimization problem',
   'Choose a real optimization problem (e.g. shortest route, best price), model it, solve it, and present your reasoning.',
   array['Problem statement','A mathematical model','A solution with working','A short explanation of the approach'],
   array['Modeling accuracy','Correct solution','Clarity of reasoning','Presentation'],
   'advanced', 8),
  ('cccc0003-0000-4000-8000-000000000001','language','Hotel check-in, entirely in your target language',
   'Record yourself completing a full hotel check-in conversation in your target language — booking, questions, and a problem to resolve.',
   array['An audio or video recording','Covers arrival, a request, and a problem','Uses target-language politeness forms'],
   array['Comprehensibility','Grammar & vocabulary','Fluency & pacing','Task completion'],
   'intermediate', 4)
on conflict (id) do nothing;
