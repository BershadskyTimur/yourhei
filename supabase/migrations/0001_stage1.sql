-- YourHEI, stage 1: minimal schema for the map.
-- Paste this whole file into Supabase -> SQL Editor -> Run. Then run supabase/seed.sql.
-- The full schema (programs, users, reviews...) comes at stage 4 and extends these tables.

create extension if not exists postgis with schema extensions;

-- Institution types (SPEC.md section 7). Editable later in the admin panel.
create table if not exists public.institution_types (
  code       text primary key,
  color      text not null,           -- dot colour on the map
  icon       text not null,           -- icon key used by the front end
  names      jsonb not null,          -- {ru, en, ka, es, zh}
  sort_order int  not null default 0
);

insert into public.institution_types (code, color, icon, names, sort_order) values
  ('university',      '#C9A227', 'university',      '{"ru":"Вуз","en":"University","ka":"უნივერსიტეტი","es":"Universidad","zh":"大学"}', 1),
  ('college',         '#C0392B', 'college',         '{"ru":"Колледж","en":"College","ka":"კოლეჯი","es":"Colegio universitario","zh":"学院"}', 2),
  ('school',          '#2F6FD0', 'school',          '{"ru":"Школа","en":"School","ka":"სკოლა","es":"Escuela","zh":"中小学"}', 3),
  ('language_school', '#2E8B57', 'language_school', '{"ru":"Языковая школа","en":"Language school","ka":"ენების სკოლა","es":"Escuela de idiomas","zh":"语言学校"}', 4),
  ('foundation',      '#7B4FC0', 'foundation',      '{"ru":"Подготовительные программы","en":"Foundation programs","ka":"მოსამზადებელი პროგრამები","es":"Programas preparatorios","zh":"预科课程"}', 5),
  ('vocational',      '#159A9C', 'vocational',      '{"ru":"Техникум / профучилище","en":"Vocational school","ka":"პროფესიული სასწავლებელი","es":"Formación profesional","zh":"职业学校"}', 6)
on conflict (code) do nothing;

-- Institutions: open base data. status = 'published' means a verified detailed card exists.
create table if not exists public.institutions (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null,
  type         text not null references public.institution_types (code),
  country      char(2) not null,                      -- ISO 3166-1 alpha-2
  city         jsonb not null default '{}'::jsonb,    -- {original, en, ru, ...}
  names        jsonb not null,                        -- {original, en, ru, ka, es, zh}
  location     extensions.geography(Point, 4326) not null,
  website      text,
  ownership    text check (ownership in ('public', 'private')),
  founded_year int,
  external_ids jsonb not null default '{}'::jsonb,    -- {ror, wikidata, osm}
  status       text not null default 'draft' check (status in ('draft', 'published')),
  verified_at  timestamptz,
  is_test      boolean not null default false,        -- test data from stage 1
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (country, slug)
);

create index if not exists institutions_location_idx on public.institutions using gist (location);
create index if not exists institutions_country_type_idx on public.institutions (country, type);

-- Row Level Security: everyone may read; nobody may write through the public key.
-- (Writes come at stage 4 for the admin role.)
alter table public.institution_types enable row level security;
alter table public.institutions enable row level security;

drop policy if exists "types are public" on public.institution_types;
create policy "types are public" on public.institution_types for select using (true);

drop policy if exists "institution base data is public" on public.institutions;
create policy "institution base data is public" on public.institutions for select using (true);

-- Flat view for the map: coordinates as plain numbers. security_invoker keeps RLS in force.
create or replace view public.map_institutions
with (security_invoker = true) as
select
  id,
  slug,
  type,
  country,
  city,
  names,
  extensions.st_y(location::extensions.geometry) as lat,
  extensions.st_x(location::extensions.geometry) as lng,
  website,
  ownership,
  founded_year,
  status
from public.institutions;

grant select on public.institution_types to anon, authenticated;
grant select on public.institutions to anon, authenticated;
grant select on public.map_institutions to anon, authenticated;
