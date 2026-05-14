-- Minimal Supabase-compatible shims so LinguaFlow migrations can run on plain
-- Postgres for validation. NOT production auth — just enough surface area.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists pg_trgm;

create schema if not exists auth;
create schema if not exists storage;

-- auth.users (FK target + trigger source)
create table if not exists auth.users (
  id uuid primary key default uuid_generate_v4(),
  email text,
  raw_user_meta_data jsonb default '{}'::jsonb
);

-- auth.uid() — in real Supabase this reads a JWT claim; here it reads a GUC
-- we can set per-session to simulate a logged-in user.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon');
$$;

-- storage shims
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false
);

create table if not exists storage.objects (
  id uuid primary key default uuid_generate_v4(),
  bucket_id text references storage.buckets(id),
  name text,
  owner uuid
);

create or replace function storage.foldername(name text) returns text[]
language sql immutable as $$
  select string_to_array(name, '/');
$$;
