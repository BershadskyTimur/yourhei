-- YourHEI: limits against abuse. Run AFTER 0011 and 0013. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- Signed-in people can now write reviews, ask for access to institutions, save results and (for approved
-- representatives) edit programmes. Everything they send is already checked by row-level security (own rows only);
-- this file adds the missing amounts: how many, how large, how fast. Anyone can also send anonymous usage events, so
-- the events table gets a global speed limit.

-- ------------------------------------------------------------ reviews: a few per day, never a flood
create or replace function public.limit_reviews()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if (select count(*) from public.reviews where user_id = new.user_id and created_at > now() - interval '1 day') >= 5 then
      raise exception 'too many reviews today' using errcode = 'P0001';
    end if;
    if (select count(*) from public.reviews where user_id = new.user_id) >= 100 then
      raise exception 'review limit reached' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists reviews_limit on public.reviews;
create trigger reviews_limit before insert on public.reviews for each row execute function public.limit_reviews();

-- ------------------------------------------------------------ requests for access to an institution
create or replace function public.limit_rep_requests()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if (select count(*) from public.institution_reps where user_id = new.user_id and status = 'pending') >= 5 then
      raise exception 'too many open requests' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists institution_reps_limit on public.institution_reps;
create trigger institution_reps_limit before insert on public.institution_reps for each row execute function public.limit_rep_requests();

-- ------------------------------------------------------------ saved results: at most 30 per person, each of a sane size
alter table public.saved_matches drop constraint if exists saved_matches_items_check;
alter table public.saved_matches add constraint saved_matches_items_check
  check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 80 and pg_column_size(items) <= 60000) not valid;

create or replace function public.limit_saved_matches()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and (select count(*) from public.saved_matches where user_id = new.user_id) >= 30 then
    raise exception 'saved results limit reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists saved_matches_limit on public.saved_matches;
create trigger saved_matches_limit before insert on public.saved_matches for each row execute function public.limit_saved_matches();

-- ------------------------------------------------------------ what a representative may write (sizes, links)
create or replace function public.mark_rep_programme()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if pg_column_size(new.names) > 2000 or pg_column_size(new.tuition) > 4000 or pg_column_size(new.deadlines) > 4000
       or coalesce(cardinality(new.languages), 0) > 12 or char_length(coalesce(new.application_url, '')) > 500
       or (new.application_url is not null and new.application_url !~* '^https?://') then
      raise exception 'programme data is too large or the link is not an http(s) address' using errcode = 'P0001';
    end if;
    new.requirements := jsonb_set(coalesce(new.requirements, '{}'::jsonb), '{source}', '"institution"');
    new.status := 'published';
    new.verified_at := now();
  end if;
  return new;
end;
$$;

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
    if pg_column_size(new.description) > 8000 or char_length(coalesce(new.website, '')) > 300
       or (new.website is not null and new.website !~* '^https?://') then
      raise exception 'description is too large or the website is not an http(s) address' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

-- ------------------------------------------------------------ anonymous events: a global speed limit
-- Anyone with the public key can add an event row. A script could fill the table; this refuses new rows when more
-- than 1,500 arrived in the last minute (real visitors send a few per minute).
create or replace function public.throttle_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from (select 1 from public.site_events where at > now() - interval '1 minute' limit 1500) x) >= 1500 then
    raise exception 'too many events' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists site_events_throttle on public.site_events;
create trigger site_events_throttle before insert on public.site_events for each row execute function public.throttle_events();
