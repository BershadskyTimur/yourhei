-- YourHEI: where visits come from. Run AFTER 0009 and 0013. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- The site records, for visitors who pressed "Accept all" in the cookie banner, where a visit comes from as the hosting
-- network (Cloudflare) sees it: region, city, time zone and the network that owns the address (internet provider or
-- company). The IP address itself is not stored. Only an admin can read any of it.

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
