-- 翱翔安居 / 校园租房平台 (MVP 自营版) - Supabase Schema
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  school text,
  password_hash text not null,
  verify_status text not null default 'unverified',
  student_id_image text,
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listings (
  id text primary key,
  code text,
  title text not null,
  type text not null,
  area_sqm int not null,
  rent int not null,
  rooms int not null,
  facilities jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  video_url text,
  map_area text,
  status text not null default '空置',
  desc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.view_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null references public.listings(id) on delete cascade,
  listing_code text,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  phone text not null,
  prefer_time text,
  note text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  target text,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.listings enable row level security;
alter table public.view_requests enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "public read listings" on public.listings;
create policy "public read listings" on public.listings
for select to anon using (true);

drop policy if exists "deny anon users" on public.users;
create policy "deny anon users" on public.users
for select to anon using (false);

drop policy if exists "deny anon requests" on public.view_requests;
create policy "deny anon requests" on public.view_requests
for select to anon using (false);

drop policy if exists "deny anon logs" on public.audit_logs;
create policy "deny anon logs" on public.audit_logs
for select to anon using (false);
