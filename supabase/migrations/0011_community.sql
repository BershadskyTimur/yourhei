-- YourHEI: national scholarships, reviews, saved/shared results, institution accounts.
-- Run AFTER 0001-0010. Safe to run again. Paste into Supabase -> SQL Editor -> Run.

-- ------------------------------------------------------------ 1. scholarships of a country (not only of one institution)
alter table public.scholarships alter column institution_id drop not null;
alter table public.scholarships
  add column if not exists scope        text not null default 'institution' check (scope in ('institution', 'country')),
  add column if not exists host_country char(2) references public.countries (code),
  add column if not exists funder       jsonb not null default '{}'::jsonb,      -- {en, ru}: who pays
  add column if not exists levels       text[] not null default '{}',            -- bachelor, master, phd ...
  add column if not exists deadline_text jsonb not null default '{}'::jsonb,     -- {en, ru}, as published
  add column if not exists accessed_at  date;
create index if not exists scholarships_country_idx on public.scholarships (host_country) where status = 'published';

-- ------------------------------------------------------------ 2. reviews of institutions (moderated)
create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  rating         int  not null check (rating between 1 and 5),
  relation       text not null check (relation in ('student', 'graduate', 'applicant')),
  body           text not null check (char_length(body) between 20 and 2000),
  language       text check (language is null or char_length(language) <= 8),
  status         text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  created_at     timestamptz not null default now(),
  unique (institution_id, user_id)
);
create index if not exists reviews_institution_idx on public.reviews (institution_id) where status = 'published';
alter table public.reviews enable row level security;

drop policy if exists "published reviews are public" on public.reviews;
create policy "published reviews are public" on public.reviews for select using (status = 'published');
drop policy if exists "own reviews: read" on public.reviews;
create policy "own reviews: read" on public.reviews for select using (auth.uid() = user_id);
drop policy if exists "own reviews: write" on public.reviews;
create policy "own reviews: write" on public.reviews for insert with check (auth.uid() = user_id and status = 'pending');
drop policy if exists "own reviews: edit while pending" on public.reviews;
create policy "own reviews: edit while pending" on public.reviews for update
  using (auth.uid() = user_id and status in ('pending', 'rejected')) with check (auth.uid() = user_id and status = 'pending');
drop policy if exists "own reviews: delete" on public.reviews;
create policy "own reviews: delete" on public.reviews for delete using (auth.uid() = user_id);
drop policy if exists "admin: all reviews" on public.reviews;
create policy "admin: all reviews" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;

-- average rating per institution (published reviews only), readable by everyone
create or replace view public.review_summary as
select institution_id, count(*)::int as reviews, round(avg(rating)::numeric, 1) as rating
from public.reviews where status = 'published' group by institution_id;
grant select on public.review_summary to anon, authenticated;

-- ------------------------------------------------------------ 3. saved results that can be shared by a link
create table if not exists public.saved_matches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  share_token uuid not null default gen_random_uuid() unique,
  shared      boolean not null default false,
  title       text check (title is null or char_length(title) <= 120),
  items       jsonb not null,   -- [{name, institution, country, slug, score, group, tuition, currency}] snapshot
  created_at  timestamptz not null default now()
);
alter table public.saved_matches enable row level security;
drop policy if exists "own saved results" on public.saved_matches;
create policy "own saved results" on public.saved_matches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.saved_matches to authenticated;

-- A shared list is opened with the secret link only; the function returns nothing for an unknown or unshared token.
create or replace function public.get_shared_matches(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object('title', title, 'created_at', created_at, 'items', items)
  from public.saved_matches where share_token = p_token and shared;
$$;
revoke all on function public.get_shared_matches(uuid) from public;
grant execute on function public.get_shared_matches(uuid) to anon, authenticated;

-- ------------------------------------------------------------ 4. institution accounts (a representative edits their own card)
create table if not exists public.institution_reps (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  institution_id uuid not null references public.institutions (id) on delete cascade,
  position       text check (position is null or char_length(position) <= 120),
  message        text check (message is null or char_length(message) <= 1000),
  status         text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at     timestamptz not null default now(),
  decided_at     timestamptz,
  unique (user_id, institution_id)
);
alter table public.institution_reps enable row level security;
drop policy if exists "own requests: read" on public.institution_reps;
create policy "own requests: read" on public.institution_reps for select using (auth.uid() = user_id);
drop policy if exists "own requests: create" on public.institution_reps;
create policy "own requests: create" on public.institution_reps for insert with check (auth.uid() = user_id and status = 'pending');
drop policy if exists "admin: all requests" on public.institution_reps;
create policy "admin: all requests" on public.institution_reps for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select, insert on public.institution_reps to authenticated;
grant update, delete on public.institution_reps to authenticated;   -- only admins pass the policy

create or replace function public.is_rep(p_institution uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.institution_reps
                 where user_id = auth.uid() and institution_id = p_institution and status = 'approved');
$$;
revoke all on function public.is_rep(uuid) from public;
grant execute on function public.is_rep(uuid) to authenticated;

-- what an approved representative may touch: their institution card and its programmes
drop policy if exists "rep: update own institution" on public.institutions;
create policy "rep: update own institution" on public.institutions for update to authenticated using (public.is_rep(id)) with check (public.is_rep(id));
drop policy if exists "rep: read own programmes" on public.programs;
create policy "rep: read own programmes" on public.programs for select to authenticated using (public.is_rep(institution_id));
drop policy if exists "rep: manage own programmes" on public.programs;
create policy "rep: manage own programmes" on public.programs for all to authenticated using (public.is_rep(institution_id)) with check (public.is_rep(institution_id));

-- A representative cannot change what identifies the institution or publish/unpublish it.
create or replace function public.protect_institution_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.slug := old.slug;
    new.country := old.country;
    new.type := old.type;
    new.external_ids := old.external_ids;
    new.status := old.status;
    new.is_test := old.is_test;
  end if;
  return new;
end;
$$;
drop trigger if exists institutions_protect on public.institutions;
create trigger institutions_protect before update on public.institutions
  for each row execute function public.protect_institution_columns();

-- Programmes saved by a representative are marked as coming from the institution itself: later bulk loads from
-- open registers never overwrite them (those loads replace only programmes with their own source).
create or replace function public.mark_rep_programme()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.requirements := jsonb_set(coalesce(new.requirements, '{}'::jsonb), '{source}', '"institution"');
    new.status := 'published';
    new.verified_at := now();
  end if;
  return new;
end;
$$;
drop trigger if exists programs_rep_mark on public.programs;
create trigger programs_rep_mark before insert or update on public.programs
  for each row execute function public.mark_rep_programme();

-- ------------------------------------------------------------ 5. catalog: fast filtered pages of programmes
-- With 100,000+ programmes a plain query with a country AND a level filter makes the database choose a slow plan
-- ("statement timeout"). This function reads a page by keyset (after the last row of the previous page) and lets
-- the database start from the institutions of the chosen country. It runs with the caller's rights, so the usual
-- row-level security applies: only published rows are returned.
create index if not exists programs_languages_idx on public.programs using gin (languages) where status = 'published';

create or replace function public.catalog_programs(
  p_country text default null,
  p_level text default null,
  p_language text default null,
  p_field text default null,
  p_free boolean default false,
  p_q text default null,
  p_after_institution uuid default null,
  p_after_program uuid default null,
  p_limit int default 40
)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  result jsonb;
  sql text := 'select coalesce(jsonb_agg(t.r order by t.sort_inst, t.sort_prog), ''[]''::jsonb) from (
    select p.institution_id as sort_inst, p.id as sort_prog,
           jsonb_build_object(
             ''id'', p.id, ''names'', p.names, ''level'', p.level, ''isced_f'', p.isced_f, ''languages'', p.languages,
             ''duration_years'', p.duration_years, ''tuition'', p.tuition, ''free'', p.free,
             ''institutions'', jsonb_build_object(''id'', i.id, ''slug'', i.slug, ''type'', i.type, ''country'', i.country, ''city'', i.city, ''names'', i.names)
           ) as r
    from public.institutions i
    join public.programs p on p.institution_id = i.id
    where i.status = ''published'' and p.status = ''published''';
begin
  if p_country is not null then sql := sql || ' and i.country = $1'; end if;
  if p_level is not null then sql := sql || ' and p.level = $2'; end if;
  if p_language is not null then sql := sql || ' and p.languages @> array[$3]'; end if;
  if p_field is not null then sql := sql || ' and p.isced_f like $4 || ''%'''; end if;
  if p_free then sql := sql || ' and p.free'; end if;
  if p_q is not null and p_q <> '' then
    sql := sql || ' and (p.names->>''en'' ilike ''%'' || $5 || ''%'' or p.names->>''original'' ilike ''%'' || $5 || ''%'')';
  end if;
  if p_after_institution is not null and p_after_program is not null then
    sql := sql || ' and (p.institution_id, p.id) > ($6, $7)';
  end if;
  sql := sql || ' order by p.institution_id, p.id limit least(greatest($8, 1), 100)) t';
  execute sql into result using p_country, p_level, p_language, p_field, p_q, p_after_institution, p_after_program, p_limit;
  return result;
end;
$$;
grant execute on function public.catalog_programs(text, text, text, text, boolean, text, uuid, uuid, int) to anon, authenticated;

-- ------------------------------------------------------------ 6. dashboard numbers for the admin panel
create or replace function public.admin_community_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'reviews_pending',   (select count(*) from public.reviews where status = 'pending'),
    'reviews_published', (select count(*) from public.reviews where status = 'published'),
    'reps_pending',      (select count(*) from public.institution_reps where status = 'pending'),
    'reps_approved',     (select count(*) from public.institution_reps where status = 'approved'),
    'saved_results',     (select count(*) from public.saved_matches),
    'shared_results',    (select count(*) from public.saved_matches where shared),
    'scholarships_country', (select count(*) from public.scholarships where scope = 'country' and status = 'published')
  );
end;
$$;
revoke all on function public.admin_community_stats() from public, anon;
grant execute on function public.admin_community_stats() to authenticated;

-- who asks for access to which institution, with the e-mail of the person (only an admin can call this)
create or replace function public.admin_rep_requests()
returns table (
  id uuid, user_id uuid, email text, institution_id uuid, institution_names jsonb, institution_country text,
  position text, message text, status text, created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  return query
    select r.id, r.user_id, u.email::text, r.institution_id, i.names, i.country::text, r.position, r.message, r.status, r.created_at
    from public.institution_reps r
    join auth.users u on u.id = r.user_id
    join public.institutions i on i.id = r.institution_id
    order by (r.status = 'pending') desc, r.created_at desc
    limit 200;
end;
$$;
revoke all on function public.admin_rep_requests() from public, anon;
grant execute on function public.admin_rep_requests() to authenticated;
