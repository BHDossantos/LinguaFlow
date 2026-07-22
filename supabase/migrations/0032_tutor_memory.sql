-- Tutor memory (spec §5): store educational tutor conversations so the coach can
-- reference prior learning context. Educational memory only — not unrestricted
-- personal memory. Combined with skill_states + misconceptions, this is the
-- learner's tutor memory.
create table if not exists public.tutor_conversations (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text,
  course_id uuid references public.courses(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  messages jsonb not null default '[]'::jsonb,   -- [{role, content}]
  created_at timestamptz not null default now()
);
alter table public.tutor_conversations enable row level security;
drop policy if exists "own tutor_conversations" on public.tutor_conversations;
create policy "own tutor_conversations" on public.tutor_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists tutor_conversations_user_idx
  on public.tutor_conversations (user_id, created_at desc);
