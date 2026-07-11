-- 1) Universal search over published content. SECURITY INVOKER on purpose:
-- the function runs under the caller's RLS, so it can only ever surface
-- rows the caller could already read (published courses / their lessons).
create or replace function public.search_content(p_query text, p_limit int default 20)
returns table (
  kind text,
  id uuid,
  course_id uuid,
  title text,
  snippet text,
  rank real
) as $$
  with q as (select websearch_to_tsquery('simple', p_query) as tsq)
  (
    select
      'course'::text as kind,
      c.id,
      c.id as course_id,
      c.title,
      coalesce(left(c.description, 140), '') as snippet,
      ts_rank(
        to_tsvector('simple', c.title || ' ' || coalesce(c.description, '')),
        q.tsq
      ) as rank
    from public.courses c, q
    where to_tsvector('simple', c.title || ' ' || coalesce(c.description, '')) @@ q.tsq
  )
  union all
  (
    select
      'lesson'::text as kind,
      l.id,
      l.course_id,
      l.title,
      ('in course lesson ' || l.position)::text as snippet,
      ts_rank(to_tsvector('simple', l.title), q.tsq) as rank
    from public.lessons l, q
    where to_tsvector('simple', l.title) @@ q.tsq
  )
  order by rank desc
  limit least(greatest(p_limit, 1), 50);
$$ language sql stable security invoker;

grant execute on function public.search_content(text, int) to authenticated;

-- 2) Community v1: per-course discussions with one level of replies.
create table public.discussions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.discussions(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 4000),
  created_at timestamptz not null default now()
);

create index discussions_course_created_idx on public.discussions (course_id, created_at desc);

alter table public.discussions enable row level security;

-- Any signed-in learner can read and post; authors manage their own posts;
-- the course's teacher can moderate (delete) anything in their course.
create policy "discussions read" on public.discussions
  for select to authenticated using (true);
create policy "discussions post own" on public.discussions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "discussions delete own" on public.discussions
  for delete to authenticated using (
    auth.uid() = user_id
    or auth.uid() = (select teacher_id from public.courses c where c.id = course_id)
  );
