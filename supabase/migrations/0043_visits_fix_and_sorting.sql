-- YourHEI: fixes the log of visits and adds sorting to the admin lists. Run AFTER 0042. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- 1) The log of visits failed with 'column "region" does not exist': file 0040 (place of a visit) had not been run in
--    this database. Its columns and its function are repeated here, so this one file is enough.
-- 2) The list of accounts can be ordered (registration, last sign-in, last visit, pages opened, e-mail).
-- 3) The log of visits can show only visits of accounts or only visits without one, and can be ordered.

-- ------------------------------------------------------------ the place of a visit (same as 0040)
alter table public.site_events add column if not exists region   text check (region is null or char_length(region) <= 80);
alter table public.site_events add column if not exists city     text check (city is null or char_length(city) <= 80);
alter table public.site_events add column if not exists timezone text check (timezone is null or char_length(timezone) <= 60);
alter table public.site_events add column if not exists asn      bigint check (asn is null or asn between 1 and 4294967295);
alter table public.site_events add column if not exists as_org   text check (as_org is null or char_length(as_org) <= 120);

-- Top places and networks of the visits of the last p_days days (admin only).
create or replace function public.admin_traffic_geo(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  since timestamptz := now() - make_interval(days => least(greatest(coalesce(p_days, 30), 1), 365));
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'with_place', (select count(*) from public.site_events where at >= since and (city is not null or as_org is not null)),
    'cities',    (select coalesce(jsonb_agg(jsonb_build_object('country', country, 'city', city, 'n', n, 'visitors', v) order by n desc), '[]'::jsonb) from (
                   select country, city, count(*) n, count(distinct session) v from public.site_events
                    where at >= since and city is not null group by 1, 2 order by count(*) desc limit 20) x),
    'regions',   (select coalesce(jsonb_agg(jsonb_build_object('country', country, 'region', region, 'n', n) order by n desc), '[]'::jsonb) from (
                   select country, region, count(*) n from public.site_events
                    where at >= since and region is not null group by 1, 2 order by count(*) desc limit 15) x),
    'networks',  (select coalesce(jsonb_agg(jsonb_build_object('asn', asn, 'org', as_org, 'country', country, 'n', n, 'visitors', v) order by n desc), '[]'::jsonb) from (
                   select asn, as_org, max(country) country, count(*) n, count(distinct session) v from public.site_events
                    where at >= since and as_org is not null group by 1, 2 order by count(*) desc limit 20) x),
    'timezones', (select coalesce(jsonb_agg(jsonb_build_object('timezone', timezone, 'n', n) order by n desc), '[]'::jsonb) from (
                   select timezone, count(*) n from public.site_events
                    where at >= since and timezone is not null group by 1 order by count(*) desc limit 10) x)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_traffic_geo(int) from public, anon;
grant execute on function public.admin_traffic_geo(int) to authenticated;

-- ------------------------------------------------------------ the log of visits, with a filter and an order
-- p_who:  'all' | 'accounts' (only visits of signed-in people) | 'guests' (only visits without an account)
-- p_sort: 'new' (latest first) | 'old' (earliest first) | 'pages' (most pages first)
drop function if exists public.admin_visits(int, text, int, int);
create or replace function public.admin_visits(p_days int default 7, p_search text default null, p_limit int default 50, p_offset int default 0,
                                               p_who text default 'all', p_sort text default 'new')
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  since timestamptz := now() - make_interval(days => least(greatest(coalesce(p_days, 7), 1), 1095));
  q     text := nullif(btrim(coalesce(p_search, '')), '');
  lim   int  := least(greatest(coalesce(p_limit, 50), 1), 100);
  off   int  := greatest(coalesce(p_offset, 0), 0);
  who   text := coalesce(p_who, 'all');
  srt   text := coalesce(p_sort, 'new');
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  -- IP addresses and browser strings are kept for 3 years, then erased (the rest of the statistics stays)
  update public.site_events set ip = null, user_agent = null
   where at < now() - interval '3 years' and ip is not null;

  with v as (
    select session,
           min(at) as first_at, max(at) as last_at,
           count(*) filter (where event = 'page_view') as pages,
           count(*) filter (where event <> 'page_view') as actions,
           (array_agg(path order by at))[1] as entry,
           max(ip) as ip, max(country) as country, max(region) as region, max(city) as city, max(postal) as postal,
           max(lat) as lat, max(lon) as lon, max(timezone) as timezone, max(asn) as asn, max(as_org) as as_org,
           max(browser) as browser, max(os) as os, max(device) as device, max(user_agent) as user_agent,
           max(lang) as lang, max(screen) as screen, max(locale) as locale, max(referrer) as referrer,
           (array_agg(user_id) filter (where user_id is not null))[1] as user_id
      from public.site_events
     where at >= since and session is not null
     group by session
  ), f as (
    select v.*, u.email::text as email
      from v left join auth.users u on u.id = v.user_id
     where (who = 'all' or (who = 'accounts' and v.user_id is not null) or (who = 'guests' and v.user_id is null))
       and (q is null
        or v.ip like q || '%'
        or v.city ilike '%' || q || '%'
        or v.as_org ilike '%' || q || '%'
        or u.email ilike '%' || q || '%'
        or v.country = upper(q))
  ), o as (
    select f.*, row_number() over (order by
             case when srt = 'pages' then f.pages end desc nulls last,
             case when srt = 'old' then f.last_at end asc,
             f.last_at desc) as rn
      from f
  )
  select jsonb_build_object(
    'total', (select count(*) from f),
    'rows',  (select coalesce(jsonb_agg(to_jsonb(o) - 'rn' order by o.rn), '[]'::jsonb) from o where o.rn > off and o.rn <= off + lim)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_visits(int, text, int, int, text, text) from public, anon;
grant execute on function public.admin_visits(int, text, int, int, text, text) to authenticated;

-- ------------------------------------------------------------ accounts, with an order
-- p_sort: 'created' | 'login' (last sign-in) | 'visit' (last visit) | 'views' (pages opened) | 'email'
-- p_desc: true = newest / biggest / Z first
drop function if exists public.admin_accounts(text, int, int);
create or replace function public.admin_accounts(p_search text default null, p_limit int default 50, p_offset int default 0,
                                                 p_sort text default 'created', p_desc boolean default true)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  q   text := nullif(btrim(coalesce(p_search, '')), '');
  lim int  := least(greatest(coalesce(p_limit, 50), 1), 100);
  off int  := greatest(coalesce(p_offset, 0), 0);
  srt text := coalesce(p_sort, 'created');
  dsc boolean := coalesce(p_desc, true);
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  with a as (
    select u.id, u.email::text as email, u.created_at, u.last_sign_in_at, u.email_confirmed_at,
           coalesce(u.raw_app_meta_data -> 'providers', '[]'::jsonb) as providers,
           p.role, p.plan, p.residence_country, p.citizenships, p.gender, p.marketing_opt_in,
           date_part('year', age(current_date, p.birth_date))::int as age,
           s.ip as login_ip, s.user_agent as login_user_agent, s.seen as login_seen,
           e.at as visit_at, e.ip as visit_ip, e.country as visit_country, e.region as visit_region, e.city as visit_city,
           e.as_org as visit_as_org, e.browser as visit_browser, e.os as visit_os, e.device as visit_device,
           (select count(*) from public.site_events x where x.user_id = u.id and x.event = 'page_view') as page_views,
           (select count(*) from public.survey_attempts x where x.user_id = u.id and x.status = 'completed') as surveys_completed,
           (select count(*) from public.favorites x where x.user_id = u.id) as favorites
      from auth.users u
      left join public.profiles p on p.id = u.id
      left join lateral (
        select host(ss.ip) as ip, ss.user_agent,
               coalesce(ss.refreshed_at at time zone 'utc', ss.updated_at, ss.created_at) as seen
          from auth.sessions ss where ss.user_id = u.id
         order by coalesce(ss.refreshed_at at time zone 'utc', ss.updated_at, ss.created_at) desc nulls last limit 1) s on true
      left join lateral (
        select ev.at, ev.ip, ev.country, ev.region, ev.city, ev.as_org, ev.browser, ev.os, ev.device
          from public.site_events ev where ev.user_id = u.id order by ev.at desc limit 1) e on true
     where q is null
        or u.email ilike '%' || q || '%'
        or s.ip like q || '%'
        or e.ip like q || '%'
  ), o as (
    select a.*, row_number() over (order by
             case when srt = 'email' and not dsc then lower(a.email) end asc nulls last,
             case when srt = 'email' and dsc then lower(a.email) end desc nulls last,
             case when srt = 'views' and not dsc then a.page_views end asc,
             case when srt = 'views' and dsc then a.page_views end desc,
             case when not dsc then (case srt when 'login' then a.last_sign_in_at when 'visit' then a.visit_at when 'created' then a.created_at end) end asc nulls last,
             case when dsc then (case srt when 'login' then a.last_sign_in_at when 'visit' then a.visit_at when 'created' then a.created_at end) end desc nulls last,
             a.created_at desc) as rn
      from a
  )
  select jsonb_build_object(
    'total', (select count(*) from a),
    'rows',  (select coalesce(jsonb_agg(to_jsonb(o) - 'rn' order by o.rn), '[]'::jsonb) from o where o.rn > off and o.rn <= off + lim)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_accounts(text, int, int, text, boolean) from public, anon;
grant execute on function public.admin_accounts(text, int, int, text, boolean) to authenticated;
