-- YourHEI, stage 2: accounts. Run AFTER 0001_stage1.sql and BEFORE 0003_reference_data.sql.
-- Paste the whole file into Supabase -> SQL Editor -> Run. Safe to run again.

-- ---------------------------------------------------------------- reference tables
create table if not exists public.countries (
  code      char(2) primary key,          -- ISO 3166-1 alpha-2
  region    text not null,                -- 'europe' | 'asia' | 'other' (UN M49)
  subregion text                          -- UN M49 sub-region key, e.g. 'western-europe'
);

create table if not exists public.regions (
  id         text primary key,            -- 'caucasus-ca-ee' | 'europe' | 'asia'
  sort_order int not null default 0
);

create table if not exists public.region_countries (
  region_id text not null references public.regions (id) on delete cascade,
  country   char(2) not null references public.countries (code) on delete cascade,
  primary key (region_id, country)
);

create table if not exists public.country_age_thresholds (
  country            char(2) primary key references public.countries (code) on delete cascade,
  min_age            int not null check (min_age between 10 and 21),
  needs_legal_review boolean not null default true
);

-- Minimum registration age for a country of residence; 14 when the country has no own row.
create or replace function public.min_age_for(p_country text)
returns int
language sql
stable
as $$
  select coalesce(
    (select min_age from public.country_age_thresholds where country = upper(p_country)),
    14
  );
$$;

alter table public.countries enable row level security;
alter table public.regions enable row level security;
alter table public.region_countries enable row level security;
alter table public.country_age_thresholds enable row level security;

drop policy if exists "countries are public" on public.countries;
create policy "countries are public" on public.countries for select using (true);
drop policy if exists "regions are public" on public.regions;
create policy "regions are public" on public.regions for select using (true);
drop policy if exists "region_countries are public" on public.region_countries;
create policy "region_countries are public" on public.region_countries for select using (true);
drop policy if exists "age thresholds are public" on public.country_age_thresholds;
create policy "age thresholds are public" on public.country_age_thresholds for select using (true);

grant select on public.countries, public.regions, public.region_countries,
  public.country_age_thresholds to anon, authenticated;

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  birth_date          date,
  gender              text check (gender in ('male', 'female', 'undisclosed')),
  residence_country   char(2) references public.countries (code),
  citizenships        text[] not null default '{}',
  target_regions      text[] not null default '{}',   -- what the user searches for (step 1)
  target_countries    text[] not null default '{}',
  target_types        text[] not null default '{}',
  plan                text not null default 'free' check (plan in ('free', 'premium')),
  role                text not null default 'user'
                        check (role in ('user', 'admin', 'moderator', 'institution_rep')),
  display_currency    text,
  marketing_opt_in    boolean not null default false,
  privacy_accepted_at timestamptz,
  terms_accepted_at   timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.user_documents (
  user_id    uuid not null references auth.users (id) on delete cascade,
  doc_type   text not null check (doc_type in (
               'passport', 'study_visa', 'school_certificate', 'diploma', 'transcript',
               'apostille', 'notarized_translation', 'recognition', 'proof_of_funds',
               'health_insurance', 'parental_consent')),
  status     text not null check (status in ('have', 'in_progress', 'none')),
  details    jsonb not null default '{}'::jsonb,   -- e.g. {"countries": ["GE"]} or {"expected_date": "2027-06-30"}
  updated_at timestamptz not null default now(),
  primary key (user_id, doc_type)
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
drop trigger if exists user_documents_touch on public.user_documents;
create trigger user_documents_touch before update on public.user_documents
  for each row execute function public.touch_updated_at();

-- Row Level Security: a user sees and changes only their own rows.
alter table public.profiles enable row level security;
alter table public.user_documents enable row level security;

drop policy if exists "own profile: read" on public.profiles;
create policy "own profile: read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "own profile: update" on public.profiles;
create policy "own profile: update" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own documents: read" on public.user_documents;
create policy "own documents: read" on public.user_documents for select using (auth.uid() = user_id);
drop policy if exists "own documents: insert" on public.user_documents;
create policy "own documents: insert" on public.user_documents for insert with check (auth.uid() = user_id);
drop policy if exists "own documents: update" on public.user_documents;
create policy "own documents: update" on public.user_documents for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own documents: delete" on public.user_documents;
create policy "own documents: delete" on public.user_documents for delete using (auth.uid() = user_id);

-- A user must never be able to change their own role or plan, so UPDATE is allowed
-- only on these columns (role, plan, dates of consent are changed by the server side only).
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (birth_date, gender, residence_country, citizenships, target_regions,
              target_countries, target_types, display_currency, marketing_opt_in)
  on public.profiles to authenticated;

revoke all on public.user_documents from anon, authenticated;
grant select, insert, update, delete on public.user_documents to authenticated;

-- ---------------------------------------------------------------- sign-up trigger
-- The sign-up form sends the wizard answers inside user_metadata -> "wizard".
-- This trigger checks them and creates the profile. If the person is younger than the
-- minimum age of their country, the exception cancels the whole sign-up: no account is
-- created (SPEC.md section 6). This is the server-side guard behind the form's own check.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  w          jsonb := new.raw_user_meta_data -> 'wizard';
  v_birth    date;
  v_country  text;
  v_gender   text;
  v_citizen  text[];
  v_regions  text[];
  v_targets  text[];
  v_types    text[];
  v_doc      record;
begin
  -- No wizard data (for example a Google sign-up): an empty profile, completed later.
  if w is null or jsonb_typeof(w) <> 'object' then
    insert into public.profiles (id) values (new.id);
    return new;
  end if;

  begin
    v_birth   := (w ->> 'birth_date')::date;
    v_country := upper(w ->> 'residence_country');
    v_gender  := w ->> 'gender';
    v_citizen := array(select upper(jsonb_array_elements_text(coalesce(w -> 'citizenships', '[]'::jsonb))));
    v_regions := array(select jsonb_array_elements_text(coalesce(w -> 'target_regions', '[]'::jsonb)));
    v_targets := array(select upper(jsonb_array_elements_text(coalesce(w -> 'target_countries', '[]'::jsonb))));
    v_types   := array(select jsonb_array_elements_text(coalesce(w -> 'target_types', '[]'::jsonb)));
  exception when others then
    raise exception 'invalid_profile_data';
  end;

  if v_birth is null or v_country is null
     or not exists (select 1 from public.countries where code = v_country) then
    raise exception 'invalid_profile_data';
  end if;
  if v_birth > current_date or v_birth < current_date - interval '120 years' then
    raise exception 'invalid_profile_data';
  end if;
  if age(current_date, v_birth) < make_interval(years => public.min_age_for(v_country)) then
    raise exception 'age_below_threshold';
  end if;
  if coalesce(w ->> 'privacy_accepted', 'false') <> 'true'
     or coalesce(w ->> 'terms_accepted', 'false') <> 'true' then
    raise exception 'consent_required';
  end if;
  if v_gender is not null and v_gender not in ('male', 'female', 'undisclosed') then
    raise exception 'invalid_profile_data';
  end if;
  if exists (select 1 from unnest(v_citizen || v_targets) c where c not in (select code from public.countries)) then
    raise exception 'invalid_profile_data';
  end if;

  insert into public.profiles (
    id, birth_date, gender, residence_country, citizenships, target_regions,
    target_countries, target_types, marketing_opt_in, privacy_accepted_at, terms_accepted_at
  ) values (
    new.id, v_birth, v_gender, v_country, v_citizen, v_regions,
    v_targets, v_types, coalesce(w ->> 'marketing_opt_in', 'false') = 'true', now(), now()
  );

  -- documents: {"passport": {"status": "have", "details": {...}}, ...}
  if jsonb_typeof(w -> 'documents') = 'object' then
    for v_doc in select key, value from jsonb_each(w -> 'documents') loop
      insert into public.user_documents (user_id, doc_type, status, details)
      values (
        new.id,
        v_doc.key,
        v_doc.value ->> 'status',
        case when jsonb_typeof(v_doc.value -> 'details') = 'object'
             then v_doc.value -> 'details' else '{}'::jsonb end
      );
    end loop;
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts created before this file was run have no profile yet: give them an empty one,
-- which the person fills in on the profile page.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- The same age rule when the profile is edited: the birth date or the country cannot be
-- changed to something below the minimum age.
create or replace function public.enforce_age_on_profile_update()
returns trigger
language plpgsql
as $$
begin
  if new.birth_date is not null and new.residence_country is not null
     and (new.birth_date is distinct from old.birth_date
          or new.residence_country is distinct from old.residence_country) then
    if new.birth_date > current_date or new.birth_date < current_date - interval '120 years' then
      raise exception 'invalid_profile_data';
    end if;
    if age(current_date, new.birth_date) < make_interval(years => public.min_age_for(new.residence_country)) then
      raise exception 'age_below_threshold';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists profiles_age_check on public.profiles;
create trigger profiles_age_check before update on public.profiles
  for each row execute function public.enforce_age_on_profile_update();

-- ---------------------------------------------------------------- delete my account
-- "Delete account and all data": removes the login; profile and documents go with it (cascade).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
