-- Verifiable credentials (spec §20). Issued on course completion, snapshotting
-- what was verified, with a public verification code + URL. Owners read their
-- own; the public verifies a single credential by code via a SECURITY DEFINER
-- function (so the table itself is never world-readable).

create table if not exists public.credentials (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,               -- public verify code, e.g. NOE-XXXX-YYYY
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  learner_name text,
  course_title text,
  cefr_level text,
  skills_verified text[] not null default '{}',
  mastery_pct int,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);
alter table public.credentials enable row level security;
drop policy if exists "own credentials" on public.credentials;
create policy "own credentials" on public.credentials
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public verification: returns only the safe, presentational fields for one code.
create or replace function public.verify_credential(p_code text)
returns table (
  code text, learner_name text, course_title text, cefr_level text,
  skills_verified text[], mastery_pct int, issued_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select code, learner_name, course_title, cefr_level, skills_verified, mastery_pct, issued_at
  from credentials where code = p_code
$$;
revoke all on function public.verify_credential(text) from public;
grant execute on function public.verify_credential(text) to anon, authenticated;
