-- YourHEI: full details of every visit and the list of accounts for the admin panel.
-- Run AFTER 0040. Safe to run again. Paste into Supabase -> SQL Editor -> Run.
--
-- By the owner's decision (13.11.2026) the site now keeps a log of every visit: the IP address, browser, operating
-- system, screen, browser language, and the place of the address as the hosting network (Cloudflare) sees it (country,
-- region, city, postal code, approximate coordinates, provider). Visits of signed-in people are linked to the account.
-- IP addresses and browser strings are erased after 3 years. Only an admin can read any of it.
-- Passwords are NOT shown anywhere: the database keeps only an irreversible hash of them.

-- ------------------------------------------------------------ new columns of a visit
alter table public.site_events add column if not exists ip         text check (ip is null or ip ~ '^[0-9A-Fa-f:.]{3,45}$');
alter table public.site_events add column if not exists user_agent text check (user_agent is null or char_length(user_agent) <= 300);
alter table public.site_events add column if not exists browser    text check (browser is null or char_length(browser) <= 40);
alter table public.site_events add column if not exists os         text check (os is null or char_length(os) <= 40);
alter table public.site_events add column if not exists lang       text check (lang is null or char_length(lang) <= 20);
alter table public.site_events add column if not exists screen     text check (screen is null or screen ~ '^[0-9]{2,5}x[0-9]{2,5}$');
alter table public.site_events add column if not exists postal     text check (postal is null or char_length(postal) <= 20);
alter table public.site_events add column if not exists lat        double precision check (lat is null or lat between -90 and 90);
alter table public.site_events add column if not exists lon        double precision check (lon is null or lon between -180 and 180);
alter table public.site_events add column if not exists user_id    uuid references auth.users (id) on delete set null;

create index if not exists site_events_user_idx    on public.site_events (user_id, at desc) where user_id is not null;
create index if not exists site_events_session_idx on public.site_events (session, at);
create index if not exists site_events_ip_at_idx   on public.site_events (at) where ip is not null;

-- The account of a visit is always the one the database itself sees (the signed-in person), never a value sent by a
-- browser: nobody can attribute a visit to somebody else.
create or replace function public.site_events_owner()
returns trigger
language plpgsql
as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;
drop trigger if exists site_events_owner on public.site_events;
create trigger site_events_owner before insert on public.site_events for each row execute function public.site_events_owner();

-- ------------------------------------------------------------ the log of visits (one line = one visit)
-- p_search: start of an IP address, part of a city, provider or account e-mail, or a 2-letter country code.
create or replace function public.admin_visits(p_days int default 7, p_search text default null, p_limit int default 50, p_offset int default 0)
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
     where q is null
        or v.ip like q || '%'
        or v.city ilike '%' || q || '%'
        or v.as_org ilike '%' || q || '%'
        or u.email ilike '%' || q || '%'
        or v.country = upper(q)
  )
  select jsonb_build_object(
    'total', (select count(*) from f),
    'rows',  (select coalesce(jsonb_agg(to_jsonb(x) order by x.last_at desc), '[]'::jsonb)
                from (select * from f order by last_at desc limit lim offset off) x)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_visits(int, text, int, int) from public, anon;
grant execute on function public.admin_visits(int, text, int, int) to authenticated;

-- The pages and actions of one visit, in order.
create or replace function public.admin_visit_pages(p_session text)
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
  return (select coalesce(jsonb_agg(jsonb_build_object('at', at, 'event', event, 'path', path, 'meta', meta) order by at), '[]'::jsonb)
            from (select at, event, path, meta from public.site_events where session = p_session order by at limit 300) x);
end;
$$;
revoke all on function public.admin_visit_pages(text) from public, anon;
grant execute on function public.admin_visit_pages(text) to authenticated;

-- ------------------------------------------------------------ accounts
-- E-mail, how the person signs in, dates, the address and browser of the last sign-in (kept by Supabase Auth itself),
-- the profile and the last visit. p_search: part of an e-mail or the start of an IP address.
create or replace function public.admin_accounts(p_search text default null, p_limit int default 50, p_offset int default 0)
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
  )
  select jsonb_build_object(
    'total', (select count(*) from a),
    'rows',  (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc), '[]'::jsonb)
                from (select * from a order by created_at desc limit lim offset off) x)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_accounts(text, int, int) from public, anon;
grant execute on function public.admin_accounts(text, int, int) to authenticated;

-- ------------------------------------------------------------ browsers, systems, languages of the visits
create or replace function public.admin_traffic_tech(p_days int default 30)
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
    'addresses', (select count(distinct ip) from public.site_events where at >= since and ip is not null),
    'signed_in', (select count(distinct user_id) from public.site_events where at >= since and user_id is not null),
    'browsers',  (select coalesce(jsonb_agg(jsonb_build_object('label', b, 'n', n) order by n desc), '[]'::jsonb) from (
                   select regexp_replace(browser, ' [0-9.]+$', '') b, count(distinct session) n from public.site_events
                    where at >= since and browser is not null group by 1 order by 2 desc limit 12) x),
    'systems',   (select coalesce(jsonb_agg(jsonb_build_object('label', os, 'n', n) order by n desc), '[]'::jsonb) from (
                   select os, count(distinct session) n from public.site_events
                    where at >= since and os is not null group by 1 order by 2 desc limit 12) x),
    'languages', (select coalesce(jsonb_agg(jsonb_build_object('label', lang, 'n', n) order by n desc), '[]'::jsonb) from (
                   select lang, count(distinct session) n from public.site_events
                    where at >= since and lang is not null group by 1 order by 2 desc limit 12) x),
    'screens',   (select coalesce(jsonb_agg(jsonb_build_object('label', screen, 'n', n) order by n desc), '[]'::jsonb) from (
                   select screen, count(distinct session) n from public.site_events
                    where at >= since and screen is not null group by 1 order by 2 desc limit 10) x)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_traffic_tech(int) from public, anon;
grant execute on function public.admin_traffic_tech(int) to authenticated;
