-- Bootstrap for a NATIVE (non-docker) postgres into a Supabase-compatible
-- shape: the roles, schemas, and auth tables that gotrue/postgrest and our
-- app migrations expect. Used by devstack/setup-native.sh.

-- Roles
do $$ begin
  if not exists (select from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
  if not exists (select from pg_roles where rolname = 'authenticator') then
    create role authenticator login noinherit password 'postgres';
  end if;
  if not exists (select from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin login createrole password 'postgres';
  end if;
end $$;

grant anon, authenticated, service_role to authenticator;

-- Extensions used by migrations
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- auth schema owned by supabase_auth_admin (gotrue runs its own migrations in it)
create schema if not exists auth authorization supabase_auth_admin;
grant usage on schema auth to anon, authenticated, service_role;

-- storage schema + minimal tables (the storage-stub serves the HTTP API)
create schema if not exists storage;
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text,
  owner uuid,
  created_at timestamptz default now()
);
create or replace function storage.foldername(name text) returns text[]
  language sql immutable as $$ select string_to_array(name, '/'); $$;
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated, service_role;
grant all on storage.buckets to service_role;
grant all on storage.objects to service_role;

create schema if not exists graphql_public;
grant usage on schema graphql_public to anon, authenticated, service_role;

-- public defaults postgrest expects
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;

-- auth.uid()/auth.role() helpers that RLS policies in our migrations call.
-- gotrue's migrations may create these too; create-or-replace is fine.
create or replace function auth.uid() returns uuid
  language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true),
                '')::uuid
$$;
create or replace function auth.role() returns text
  language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''),
                  'anon')
$$;
grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role;
