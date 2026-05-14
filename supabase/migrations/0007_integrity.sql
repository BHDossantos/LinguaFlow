-- Academic-integrity pass for submissions: AI-likelihood estimate + similarity
-- against other submissions on the same assignment.

create extension if not exists pg_trgm;

create table if not exists public.integrity_checks (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  ai_likelihood real,           -- 0..1, model estimate the text is AI-generated
  ai_reasoning text,
  similarity_max real,          -- 0..1, max trigram similarity vs cohort
  similar_submission_id uuid references public.submissions(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_integrity_submission on public.integrity_checks (submission_id);

alter table public.integrity_checks enable row level security;

-- Only the assignment's teacher can read or create integrity checks.
create policy "integrity teacher rw" on public.integrity_checks
  for all using (
    auth.uid() = (
      select a.teacher_id from public.assignments a
      join public.submissions s on s.assignment_id = a.id
      where s.id = submission_id
    )
  ) with check (
    auth.uid() = (
      select a.teacher_id from public.assignments a
      join public.submissions s on s.assignment_id = a.id
      where s.id = submission_id
    )
  );

-- Max trigram similarity of a submission's text vs other submissions on the
-- same assignment. Security-definer so it can see the cohort regardless of the
-- caller's per-row RLS (the API route still authorizes the caller as teacher).
create or replace function public.max_submission_similarity(p_submission_id uuid)
returns table(similar_submission_id uuid, similarity real)
language sql security definer set search_path = public stable as $$
  select s2.id, similarity(s1.text, s2.text) as sim
  from public.submissions s1
  join public.submissions s2
    on s2.assignment_id = s1.assignment_id
   and s2.id <> s1.id
   and s2.text is not null
  where s1.id = p_submission_id
    and s1.text is not null
  order by sim desc
  limit 1;
$$;
