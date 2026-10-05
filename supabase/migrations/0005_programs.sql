-- YourHEI: programmes, scholarships, rankings, sources and country facts (the data the matching uses).
-- Run AFTER 0001-0004. Safe to run again. Paste into Supabase -> SQL Editor -> Run.
--
-- Rule of the project: only rows with status = 'published' (checked by the owner) are visible
-- to the public and used by the matching. Drafts stay hidden until they are approved.

-- ------------------------------------------------------------ more facts about institutions
alter table public.institutions
  add column if not exists city_size   text check (city_size in ('megapolis', 'medium', 'small_student')),
  add column if not exists climate     text check (climate in ('warm', 'temperate', 'cold')),
  add column if not exists size        text check (size in ('large', 'small')),
  add column if not exists dormitory   boolean,                       -- null = unknown
  add column if not exists features    text[] not null default '{}',  -- internship, double_degree, exchange
  add column if not exists description jsonb not null default '{}'::jsonb;

-- ------------------------------------------------------------ programmes
create table if not exists public.programs (
  id             uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  names          jsonb not null,                        -- {original, en, ru, ...}
  level          text not null check (level in ('school', 'college', 'foundation', 'bachelor', 'master', 'phd', 'language_course')),
  isced_f        text check (isced_f ~ '^[0-9]{2,4}$'),
  languages      text[] not null default '{}',          -- ISO 639-1
  duration_years numeric(4, 1),
  format         text check (format in ('on_campus', 'online', 'blended')),
  intakes        text[] not null default '{}',          -- months: '02', '09'
  tuition        jsonb not null default '[]'::jsonb,    -- [{amount, currency, period, applies_to}]
  free           boolean not null default false,
  requirements   jsonb not null default '{}'::jsonb,    -- {min_gpa, min_scores, documents, entrance_exams, interview, portfolio}
  deadlines      jsonb not null default '[]'::jsonb,
  application_fee jsonb,
  application_url text,
  academic_year  text,
  status         text not null default 'draft' check (status in ('draft', 'published')),
  verified_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists programs_institution_idx on public.programs (institution_id);
create index if not exists programs_level_idx on public.programs (level) where status = 'published';

-- ------------------------------------------------------------ scholarships, rankings, sources
create table if not exists public.scholarships (
  id             uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  names          jsonb not null,
  covers         text check (covers in ('tuition', 'living', 'full', 'partial')),
  eligibility    jsonb not null default '{}'::jsonb,
  url            text,
  status         text not null default 'draft' check (status in ('draft', 'published')),
  verified_at    timestamptz
);

create table if not exists public.rankings (
  id             uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  name           text not null,
  year           int  not null,
  position       text not null,                          -- "152" or "801-1000"
  scope          text not null default 'world' check (scope in ('world', 'country')),
  source_url     text
);

-- Where every value came from (DATA_COLLECTION.md): link, date, confidence.
create table if not exists public.sources (
  id          uuid primary key default gen_random_uuid(),
  entity      text not null check (entity in ('institution', 'program', 'scholarship', 'country')),
  entity_id   text not null,                             -- uuid of the row, or the country code
  field       text not null,
  url         text not null,
  accessed_at date not null,
  confidence  text not null check (confidence in ('high', 'medium', 'low'))
);
create index if not exists sources_entity_idx on public.sources (entity, entity_id);

-- ------------------------------------------------------------ facts about a country (SPEC.md section 13)
create table if not exists public.country_data (
  country              char(2) primary key references public.countries (code),
  currency             text,
  academic_year_start  text,
  work_during_study    boolean,
  post_study_work_visa boolean,
  recognition          boolean,
  cost_of_living       jsonb not null default '[]'::jsonb,  -- [{city: {original,en,ru}, amount_per_month, currency}]
  summary              jsonb not null default '{}'::jsonb,  -- {study_visa, work_during_study, post_study_work_visa, diploma_recognition}: texts
  official_urls        jsonb not null default '{}'::jsonb,
  status               text not null default 'draft' check (status in ('draft', 'published')),
  verified_at          timestamptz
);

-- ------------------------------------------------------------ access: the public sees published rows only
alter table public.programs enable row level security;
alter table public.scholarships enable row level security;
alter table public.rankings enable row level security;
alter table public.sources enable row level security;
alter table public.country_data enable row level security;

drop policy if exists "published programs are public" on public.programs;
create policy "published programs are public" on public.programs for select using (status = 'published');
drop policy if exists "published scholarships are public" on public.scholarships;
create policy "published scholarships are public" on public.scholarships for select using (status = 'published');
drop policy if exists "rankings are public" on public.rankings;
create policy "rankings are public" on public.rankings for select using (true);
drop policy if exists "sources are public" on public.sources;
create policy "sources are public" on public.sources for select using (true);
drop policy if exists "published country data is public" on public.country_data;
create policy "published country data is public" on public.country_data for select using (status = 'published');

grant select on public.programs, public.scholarships, public.rankings, public.sources, public.country_data
  to anon, authenticated;

drop trigger if exists programs_touch on public.programs;
create trigger programs_touch before update on public.programs
  for each row execute function public.touch_updated_at();

-- The map view gets the new institution columns too.
create or replace view public.map_institutions
with (security_invoker = true) as
select
  id, slug, type, country, city, names,
  extensions.st_y(location::extensions.geometry) as lat,
  extensions.st_x(location::extensions.geometry) as lng,
  website, ownership, founded_year, status
from public.institutions;
grant select on public.map_institutions to anon, authenticated;
