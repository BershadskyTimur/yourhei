-- YourHEI: analytics for the admin panel. Run AFTER 0001-0008. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- 1) site_events: anonymous page views (no names, no e-mails, no IP addresses). The site records them only
--    for visitors who pressed "Accept all" in the cookie banner.
-- 2) admin_user_stats(): numbers about the registered people (ages, countries, funnel) - totals only.
-- 3) admin_traffic(): numbers about visits.
-- Only an admin can read any of this (the functions refuse everyone else).

create table if not exists public.site_events (
  id        bigint generated always as identity primary key,
  at        timestamptz not null default now(),
  event     text not null check (event in ('page_view')),
  path      text not null check (char_length(path) between 1 and 200),
  locale    text check (locale is null or char_length(locale) <= 8),
  country   text check (country is null or country ~ '^[A-Z]{2}$'),
  device    text check (device in ('mobile', 'tablet', 'desktop')),
  referrer  text check (referrer is null or char_length(referrer) <= 100),
  session   text check (session is null or char_length(session) <= 40)
);
create index if not exists site_events_at_idx on public.site_events (at desc);

alter table public.site_events enable row level security;

-- Anyone may add a row (the length limits above keep rows small); nobody but an admin may read.
drop policy if exists "anyone can add events" on public.site_events;
create policy "anyone can add events" on public.site_events for insert to anon, authenticated with check (true);
drop policy if exists "admin: read events" on public.site_events;
create policy "admin: read events" on public.site_events for select using (public.is_admin());
grant insert on public.site_events to anon, authenticated;
grant select on public.site_events to authenticated;

-- ------------------------------------------------------------ registered people
create or replace function public.admin_user_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  with ages as (
    select id, residence_country, gender, created_at, marketing_opt_in,
           date_part('year', age(current_date, birth_date))::int as age
    from public.profiles
  )
  select jsonb_build_object(
    'total',        (select count(*) from ages),
    'new_7d',       (select count(*) from ages where created_at > now() - interval '7 days'),
    'new_30d',      (select count(*) from ages where created_at > now() - interval '30 days'),
    'marketing_opt_in', (select count(*) from ages where marketing_opt_in),
    'with_age',     (select count(*) from ages where age is not null),
    'avg_age',      (select round(avg(age)::numeric, 1) from ages where age is not null),
    'age_buckets',  (select coalesce(jsonb_agg(jsonb_build_object('label', b.label, 'n', b.n) order by b.ord), '[]'::jsonb) from (
                       select ord, label, count(*) filter (where age is not null and age >= lo and age <= hi) as n
                       from (values (1, 'under 18', 0, 17), (2, '18-20', 18, 20), (3, '21-24', 21, 24), (4, '25-29', 25, 29), (5, '30-39', 30, 39), (6, '40+', 40, 200)) as r(ord, label, lo, hi)
                       cross join ages group by ord, label) b),
    'gender',       (select coalesce(jsonb_object_agg(coalesce(gender, 'unknown'), n), '{}'::jsonb) from (select gender, count(*) n from ages group by gender) g),
    'signups_by_day', (select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'n', coalesce(s.n, 0)) order by d), '[]'::jsonb)
                       from generate_series(current_date - 29, current_date, interval '1 day') d
                       left join (select created_at::date as day, count(*) n from ages group by 1) s on s.day = d::date),
    'residence_top', (select coalesce(jsonb_agg(jsonb_build_object('country', residence_country, 'n', n, 'avg_age', avg_age) order by n desc), '[]'::jsonb) from (
                       select residence_country, count(*) n, round(avg(age)::numeric, 1) avg_age from ages
                       where residence_country is not null group by residence_country order by count(*) desc limit 15) r),
    'citizenship_top', (select coalesce(jsonb_agg(jsonb_build_object('country', c, 'n', n) order by n desc), '[]'::jsonb) from (
                       select c, count(*) n from public.profiles, unnest(citizenships) c group by c order by count(*) desc limit 15) x),
    'target_countries_top', (select coalesce(jsonb_agg(jsonb_build_object('country', c, 'n', n) order by n desc), '[]'::jsonb) from (
                       select c, count(*) n from public.profiles, unnest(target_countries) c group by c order by count(*) desc limit 15) x),
    'target_types', (select coalesce(jsonb_object_agg(t, n), '{}'::jsonb) from (
                       select t, count(*) n from public.profiles, unnest(target_types) t group by t) x),
    'surveys_started',   (select count(distinct user_id) from public.survey_attempts),
    'surveys_completed', (select count(distinct user_id) from public.survey_attempts where status = 'completed'),
    'levels', (select coalesce(jsonb_object_agg(l, n), '{}'::jsonb) from (
                       select answers ->> 'level' as l, count(*) n from public.survey_attempts
                       where status = 'completed' and answers ->> 'level' is not null group by 1) x),
    'users_with_favorites', (select count(distinct user_id) from public.favorites),
    'favorites_total',   (select count(*) from public.favorites),
    'top_favorites', (select coalesce(jsonb_agg(jsonb_build_object('name', name, 'country', country, 'n', n) order by n desc), '[]'::jsonb) from (
                       select coalesce(i.names ->> 'en', i.names ->> 'original') as name, i.country, count(*) n
                       from public.favorites f join public.institutions i on i.id = f.institution_id
                       group by 1, 2 order by count(*) desc limit 10) x)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_user_stats() from public, anon;
grant execute on function public.admin_user_stats() to authenticated;

-- ------------------------------------------------------------ visits
create or replace function public.admin_traffic(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  days int := least(greatest(coalesce(p_days, 30), 1), 365);
  since timestamptz := now() - make_interval(days => least(greatest(coalesce(p_days, 30), 1), 365));
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'days',     days,
    'views',    (select count(*) from public.site_events where at >= since),
    'visitors', (select count(distinct session) from public.site_events where at >= since),
    'by_day',   (select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'views', coalesce(s.views, 0), 'visitors', coalesce(s.visitors, 0)) order by d), '[]'::jsonb)
                 from generate_series(current_date - (days - 1), current_date, interval '1 day') d
                 left join (select at::date as day, count(*) views, count(distinct session) visitors from public.site_events where at >= since group by 1) s on s.day = d::date),
    'top_pages', (select coalesce(jsonb_agg(jsonb_build_object('path', p, 'n', n) order by n desc), '[]'::jsonb) from (
                 select regexp_replace(path, '^/[a-z]{2}(/|$)', '/') as p, count(*) n from public.site_events where at >= since group by 1 order by count(*) desc limit 15) x),
    'countries', (select coalesce(jsonb_agg(jsonb_build_object('country', country, 'n', n) order by n desc), '[]'::jsonb) from (
                 select country, count(*) n from public.site_events where at >= since and country is not null group by 1 order by count(*) desc limit 15) x),
    'devices',  (select coalesce(jsonb_object_agg(coalesce(device, 'unknown'), n), '{}'::jsonb) from (select device, count(*) n from public.site_events where at >= since group by 1) x),
    'locales',  (select coalesce(jsonb_object_agg(coalesce(locale, 'unknown'), n), '{}'::jsonb) from (select locale, count(*) n from public.site_events where at >= since group by 1) x),
    'referrers', (select coalesce(jsonb_agg(jsonb_build_object('host', referrer, 'n', n) order by n desc), '[]'::jsonb) from (
                 select referrer, count(*) n from public.site_events where at >= since and referrer is not null group by 1 order by count(*) desc limit 10) x)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_traffic(int) from public, anon;
grant execute on function public.admin_traffic(int) to authenticated;

-- Old events are not needed for ever: this removes events older than 400 days when you run it.
delete from public.site_events where at < now() - interval '400 days';
