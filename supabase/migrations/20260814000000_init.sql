-- ============================================================================
-- Public Request Management System — initial schema
-- Run with: supabase db push  (or apply manually in Supabase SQL editor)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Profiles (staff / admins)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text,
  role text not null default 'STAFF' check (role in ('ADMIN', 'STAFF')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Shared updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Admin geography (administrative divisions)
-- NOTE: Master data must be imported from verified official government sources
-- (see supabase/seed-data/ for CSV import templates). No AI-generated data.
-- ----------------------------------------------------------------------------

create table public.districts (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name_en text not null,
  name_ta text not null default '',
  active boolean not null default true,
  source text,
  source_version text,
  effective_from date,
  effective_to date,
  created_at timestamptz not null default now()
);

create table public.taluks (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.districts (id) on delete cascade,
  code text unique,
  name_en text not null,
  name_ta text not null default '',
  active boolean not null default true,
  source text,
  source_version text,
  effective_from date,
  effective_to date,
  created_at timestamptz not null default now()
);

create table public.local_body_types (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name_en text not null,
  name_ta text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.local_bodies (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.districts (id) on delete cascade,
  local_body_type_id uuid not null references public.local_body_types (id),
  taluk_id uuid references public.taluks (id) on delete set null,
  code text unique,
  name_en text not null,
  name_ta text not null default '',
  active boolean not null default true,
  source text,
  source_version text,
  effective_from date,
  effective_to date,
  created_at timestamptz not null default now()
);

create table public.wards (
  id uuid primary key default gen_random_uuid(),
  local_body_id uuid not null references public.local_bodies (id) on delete cascade,
  code text unique,
  name_en text not null,
  name_ta text not null default '',
  active boolean not null default true,
  source text,
  source_version text,
  effective_from date,
  effective_to date,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Election geography (kept separate from administrative geography)
-- ----------------------------------------------------------------------------
create table public.assembly_constituencies (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name_en text not null,
  name_ta text not null default '',
  active boolean not null default true,
  source text,
  source_version text,
  effective_from date,
  effective_to date,
  created_at timestamptz not null default now()
);

create table public.parliament_constituencies (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name_en text not null,
  name_ta text not null default '',
  active boolean not null default true,
  source text,
  source_version text,
  effective_from date,
  effective_to date,
  created_at timestamptz not null default now()
);

create table public.assembly_parliament_mapping (
  id uuid primary key default gen_random_uuid(),
  assembly_constituency_id uuid not null unique
    references public.assembly_constituencies (id) on delete cascade,
  parliament_constituency_id uuid not null
    references public.parliament_constituencies (id) on delete cascade,
  effective_from date,
  effective_to date,
  source text,
  source_version text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Request categories
-- ----------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ta text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Requests
-- ----------------------------------------------------------------------------
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique,
  name text not null,
  initial text not null default '',
  mobile text not null,
  alternate_mobile text default '',
  district_id uuid references public.districts (id) on delete set null,
  taluk_id uuid references public.taluks (id) on delete set null,
  local_body_id uuid references public.local_bodies (id) on delete set null,
  ward_id uuid references public.wards (id) on delete set null,
  assembly_constituency_id uuid references public.assembly_constituencies (id) on delete set null,
  parliament_constituency_id uuid references public.parliament_constituencies (id) on delete set null,
  address text not null default '',
  category_id uuid references public.categories (id) on delete set null,
  subject text not null,
  description text not null default '',
  status text not null default 'NEW' check (status in (
    'NEW', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE'
  )),
  assigned_to uuid references public.profiles (id) on delete set null,
  internal_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index requests_request_number_idx on public.requests (request_number);
create index requests_mobile_idx on public.requests (mobile);
create index requests_name_idx on public.requests (name);
create index requests_district_id_idx on public.requests (district_id);
create index requests_assembly_constituency_id_idx on public.requests (assembly_constituency_id);
create index requests_parliament_constituency_id_idx on public.requests (parliament_constituency_id);
create index requests_status_idx on public.requests (status);
create index requests_created_at_idx on public.requests (created_at);

create trigger requests_set_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Request number generation: REQ-YYYY-NNNNNN (concurrency-safe per year)
-- ----------------------------------------------------------------------------
create table public.request_counters (
  year integer primary key,
  last_number integer not null default 0
);

create or replace function public.next_request_number()
returns text
language plpgsql
as $$
declare
  y integer := extract(year from now());
  n integer;
begin
  insert into public.request_counters (year, last_number)
  values (y, 0)
  on conflict (year) do nothing;

  update public.request_counters
  set last_number = last_number + 1
  where year = y
  returning last_number into n;

  return 'REQ-' || y || '-' || lpad(n::text, 6, '0');
end;
$$;

create or replace function public.set_request_number()
returns trigger
language plpgsql
as $$
begin
  new.request_number := public.next_request_number();
  return new;
end;
$$;

create trigger requests_set_request_number
  before insert on public.requests
  for each row when (new.request_number is null)
  execute function public.set_request_number();

-- ----------------------------------------------------------------------------
-- Attachments
-- ----------------------------------------------------------------------------
create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null default '',
  file_size bigint not null default 0,
  created_at timestamptz not null default now()
);

create index attachments_request_id_idx on public.attachments (request_id);

-- ----------------------------------------------------------------------------
-- Auto-create profile on new auth user
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- RLS helpers
-- ----------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('ADMIN', 'STAFF')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'ADMIN'
  );
$$;

-- ----------------------------------------------------------------------------
-- Enable RLS
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.districts enable row level security;
alter table public.taluks enable row level security;
alter table public.local_body_types enable row level security;
alter table public.local_bodies enable row level security;
alter table public.wards enable row level security;
alter table public.assembly_constituencies enable row level security;
alter table public.parliament_constituencies enable row level security;
alter table public.assembly_parliament_mapping enable row level security;
alter table public.categories enable row level security;
alter table public.requests enable row level security;
alter table public.attachments enable row level security;
alter table public.request_counters enable row level security;

-- ----------------------------------------------------------------------------
-- RLS policies
-- ----------------------------------------------------------------------------
-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_select_staff" on public.profiles
  for select using (public.is_staff());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- master data: public read of active rows (cascading dropdowns), staff full access
create policy "districts_public_read" on public.districts for select using (active = true);
create policy "districts_staff_all" on public.districts for all using (public.is_staff());
create policy "taluks_public_read" on public.taluks for select using (active = true);
create policy "taluks_staff_all" on public.taluks for all using (public.is_staff());
create policy "local_body_types_public_read" on public.local_body_types for select using (active = true);
create policy "local_body_types_staff_all" on public.local_body_types for all using (public.is_staff());
create policy "local_bodies_public_read" on public.local_bodies for select using (active = true);
create policy "local_bodies_staff_all" on public.local_bodies for all using (public.is_staff());
create policy "wards_public_read" on public.wards for select using (active = true);
create policy "wards_staff_all" on public.wards for all using (public.is_staff());
create policy "ac_public_read" on public.assembly_constituencies for select using (active = true);
create policy "ac_staff_all" on public.assembly_constituencies for all using (public.is_staff());
create policy "pc_public_read" on public.parliament_constituencies for select using (active = true);
create policy "pc_staff_all" on public.parliament_constituencies for all using (public.is_staff());
create policy "apm_public_read" on public.assembly_parliament_mapping for select using (true);
create policy "apm_staff_all" on public.assembly_parliament_mapping for all using (public.is_staff());

-- categories
create policy "categories_public_read" on public.categories for select using (active = true);
create policy "categories_staff_all" on public.categories for all using (public.is_staff());

-- requests
-- Public (anonymous) users may only insert a fresh NEW request.
create policy "requests_public_insert" on public.requests
  for insert with check (
    auth.uid() is null
    and status = 'NEW'
    and assigned_to is null
    and internal_notes = ''
  );
create policy "requests_staff_select" on public.requests for select using (public.is_staff());
create policy "requests_staff_update" on public.requests for update using (public.is_staff());
create policy "requests_staff_delete" on public.requests for delete using (public.is_staff());

-- attachments: staff only (uploads handled server-side)
create policy "attachments_staff_select" on public.attachments for select using (public.is_staff());
create policy "attachments_staff_insert" on public.attachments for insert with check (public.is_staff());

-- request_counters: staff only
create policy "request_counters_staff_select" on public.request_counters for select using (public.is_staff());

-- ----------------------------------------------------------------------------
-- Storage: private bucket for attachments (uploads via server/service role only)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'request-attachments',
  'request-attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Seed: categories and local body types (non-geographic, standard terms only)
-- ----------------------------------------------------------------------------
insert into public.categories (name_en, name_ta) values
  ('Road', 'சாலை'),
  ('Water Supply', 'குடிநீர் வசதி'),
  ('Electricity', 'மின்சாரம்'),
  ('Sanitation / Drainage', 'துப்புரவு / வடிகால்'),
  ('Street Light', 'தெரு விளக்கு'),
  ('Garbage Collection', 'குப்பை அகற்றல்'),
  ('Health Services', 'சுகாதார சேவைகள்'),
  ('Education', 'கல்வி'),
  ('Public Distribution System', 'பொது விநியோகத் திட்டம்'),
  ('Other', 'மற்றவை')
on conflict do nothing;

insert into public.local_body_types (code, name_en, name_ta) values
  ('CORPORATION', 'Corporation', 'மாநகராட்சி'),
  ('MUNICIPALITY', 'Municipality', 'நகராட்சி'),
  ('TOWN_PANCHAYAT', 'Town Panchayat', 'பேரூராட்சி'),
  ('VILLAGE_PANCHAYAT', 'Village Panchayat', 'கிராம ஊராட்சி')
on conflict do nothing;

-- ============================================================================
-- Geographic master data (districts, taluks, local bodies, wards, constituencies)
-- is intentionally NOT generated here. Import from verified official sources
-- using the CSV templates in supabase/seed-data/ and run supabase/seed-data/load.sql.
-- ============================================================================
