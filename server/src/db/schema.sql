create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text default '',
  last_name text default '',
  email text,
  company_name text default '',
  phone text default '',
  avatar_url text,
  timezone text default 'Australia/Brisbane',
  role text default 'user' check (role in ('user', 'admin')),
  blocked boolean default false,
  blocked_at timestamptz,
  settings jsonb default '{}'::jsonb,
  accept_terms boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  website text not null,
  industry text default '',
  city_region text default '',
  country text default 'Australia',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  name text not null,
  website text default '',
  created_at timestamptz default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  business_name text not null,
  website text not null,
  industry text default '',
  city_region text default '',
  country text default 'Australia',
  competitors jsonb default '[]'::jsonb,
  key_services jsonb default '[]'::jsonb,
  modes jsonb default '{"browsing":true,"knowledge":true}'::jsonb,
  notify_email boolean default true,
  status text default 'queued' check (status in ('queued','processing','completed','failed')),
  progress_step text default 'queued',
  error text,
  overall_score int,
  score_band text,
  readability_score int,
  score_by_mode jsonb,
  score_by_category jsonb,
  metrics jsonb,
  ai_readiness jsonb,
  result_competitors jsonb,
  gaps jsonb,
  recommendations jsonb,
  notes text default '',
  pdf_url text,
  is_public boolean default true,
  created_at timestamptz default now(),
  completed_at timestamptz
);

alter table public.reports add column if not exists site_profile_raw jsonb;
alter table public.reports add column if not exists business_summary jsonb;
alter table public.reports add column if not exists token_usage jsonb default '[]'::jsonb;
alter table public.reports add column if not exists prompt_versions jsonb default '{}'::jsonb;
alter table public.reports add column if not exists truncated boolean default false;
alter table public.reports add column if not exists how_makeflow_helps jsonb;
alter table public.reports add column if not exists executive_summary text;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text,
  business_name text,
  website text,
  created_at timestamptz default now()
);

create table if not exists public.report_queries (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  text text not null,
  category text,
  topic text,
  intent text,
  mode text,
  raw_answer text,
  citations jsonb default '[]'::jsonb,
  extraction jsonb,
  error text,
  created_at timestamptz default now()
);

create index if not exists report_queries_report_id_idx on public.report_queries (report_id);

alter table public.leads add column if not exists source text default 'website';
alter table public.leads add column if not exists industry text default '';
alter table public.leads add column if not exists location text default '';
alter table public.leads add column if not exists name text default '';

create table if not exists public.admin_settings (
  id text primary key default 'default',
  weights jsonb,
  services jsonb,
  engine jsonb,
  limits jsonb,
  site jsonb,
  updated_at timestamptz default now()
);

alter table public.profiles add column if not exists blocked boolean default false;
alter table public.profiles add column if not exists blocked_at timestamptz;
alter table public.admin_settings add column if not exists site jsonb;

create index if not exists reports_user_id_idx on public.reports (user_id, created_at desc);
create index if not exists businesses_user_id_idx on public.businesses (user_id);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.competitors enable row level security;
alter table public.reports enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own businesses" on public.businesses;
create policy "own businesses" on public.businesses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own competitors" on public.competitors;
create policy "own competitors" on public.competitors for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own reports" on public.reports;
create policy "own reports" on public.reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "public reports" on public.reports;
create policy "public reports" on public.reports for select using (is_public = true and status = 'completed');

drop policy if exists "own report_queries" on public.report_queries;
alter table public.report_queries enable row level security;
create policy "own report_queries" on public.report_queries for all using (
  exists (select 1 from public.reports r where r.id = report_id and r.user_id = auth.uid())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, company_name, accept_terms, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'company_name', ''),
    coalesce((new.raw_user_meta_data->>'accept_terms')::boolean, false),
    case when new.email = current_setting('app.admin_email', true) then 'admin' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
