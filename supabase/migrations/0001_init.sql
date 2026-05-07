-- LinguaFlow initial schema
-- Languages: en, es, it, pt, fr

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ===== Profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  native_language text not null default 'en',
  ui_language text not null default 'en',
  cefr_level text check (cefr_level in ('A1','A2','B1','B2','C1','C2')) default 'A1',
  goals text[] default '{}',
  adult_mode boolean default true,
  timezone text,
  created_at timestamptz default now()
);

create table public.target_languages (
  user_id uuid references public.profiles(id) on delete cascade,
  language text not null check (language in ('en','es','it','pt','fr')),
  dialect text,
  cefr_level text check (cefr_level in ('A1','A2','B1','B2','C1','C2')) default 'A1',
  active boolean default true,
  primary key (user_id, language)
);

-- ===== Course content =====
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  language text not null check (language in ('en','es','it','pt','fr')),
  dialect text,
  title text not null,
  description text,
  cefr_level text check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  goal_tag text,
  position int default 0,
  published boolean default false
);

create table public.lessons (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  position int not null,
  title text not null,
  kind text not null check (kind in ('vocab','grammar','listening','reading','speaking','roleplay','writing')),
  body jsonb not null,
  grammar_notes_md text,
  estimated_minutes int default 8
);

-- ===== Spaced repetition (SM-2 lite) =====
create table public.vocab_items (
  id uuid primary key default uuid_generate_v4(),
  language text not null,
  dialect text,
  term text not null,
  translation text not null,
  ipa text,
  audio_url text,
  example_sentence text,
  unique (language, term, dialect)
);

create table public.srs_cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vocab_id uuid not null references public.vocab_items(id) on delete cascade,
  ease real not null default 2.5,
  interval_days int not null default 0,
  repetitions int not null default 0,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  unique (user_id, vocab_id)
);

create table public.srs_reviews (
  id bigserial primary key,
  card_id uuid not null references public.srs_cards(id) on delete cascade,
  rating smallint not null check (rating between 0 and 5),
  reviewed_at timestamptz default now()
);

-- ===== Progress / learner model =====
create table public.lesson_progress (
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  completed_at timestamptz,
  score real,
  primary key (user_id, lesson_id)
);

create table public.error_log (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  language text not null,
  category text not null, -- e.g. 'gender_agreement','past_tense','vocab'
  detail jsonb,
  created_at timestamptz default now()
);

create table public.weekly_goals (
  user_id uuid references public.profiles(id) on delete cascade,
  week_start date not null,
  target_minutes int not null default 60,
  actual_minutes int not null default 0,
  primary key (user_id, week_start)
);

-- ===== Tutors / live sessions =====
create table public.tutors (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  bio text,
  languages text[] not null,
  dialects text[] default '{}',
  rate_cents_per_minute int not null,
  rating real default 0,
  is_online boolean default false,
  stripe_account_id text
);

create table public.tutor_sessions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  tutor_id uuid not null references public.tutors(id) on delete cascade,
  started_at timestamptz,
  ended_at timestamptz,
  minutes_billed int default 0,
  cents_charged int default 0,
  status text not null default 'pending' check (status in ('pending','live','ended','cancelled')),
  notes_md text,
  shared_learner_snapshot jsonb
);

create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  session_id uuid references public.tutor_sessions(id) on delete set null,
  stripe_payment_intent text,
  amount_cents int not null,
  status text not null,
  created_at timestamptz default now()
);

-- ===== Translation history (feeds learner model) =====
create table public.translation_events (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  source_language text,
  target_language text,
  source_text text,
  translated_text text,
  modality text check (modality in ('text','voice','camera')),
  created_at timestamptz default now()
);

-- ===== Pronunciation attempts =====
create table public.pronunciation_attempts (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  language text not null,
  reference_text text not null,
  audio_url text,
  score real,
  phoneme_feedback jsonb,
  created_at timestamptz default now()
);

-- ===== RLS =====
alter table public.profiles enable row level security;
alter table public.target_languages enable row level security;
alter table public.srs_cards enable row level security;
alter table public.srs_reviews enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.error_log enable row level security;
alter table public.weekly_goals enable row level security;
alter table public.tutor_sessions enable row level security;
alter table public.payments enable row level security;
alter table public.translation_events enable row level security;
alter table public.pronunciation_attempts enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own target languages" on public.target_languages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own srs cards" on public.srs_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own srs reviews" on public.srs_reviews
  for all using (
    auth.uid() = (select user_id from public.srs_cards c where c.id = card_id)
  );

create policy "own lesson progress" on public.lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own error log" on public.error_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own weekly goals" on public.weekly_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "session participants" on public.tutor_sessions
  for all using (auth.uid() = student_id or auth.uid() = tutor_id)
  with check (auth.uid() = student_id or auth.uid() = tutor_id);

create policy "own payments" on public.payments
  for select using (auth.uid() = user_id);

create policy "own translation events" on public.translation_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own pronunciation" on public.pronunciation_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public read for content
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.vocab_items enable row level security;
alter table public.tutors enable row level security;
create policy "courses public read" on public.courses for select using (published);
create policy "lessons public read" on public.lessons for select using (
  exists (select 1 from public.courses c where c.id = course_id and c.published)
);
create policy "vocab public read" on public.vocab_items for select using (true);
create policy "tutors public read" on public.tutors for select using (true);

-- Auto-create profile row on signup
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
